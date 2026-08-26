/**
 * Input guardrails.
 *
 * User input is always treated as untrusted data. We block:
 *   - empty / malformed input
 *   - direct instruction-override and system-prompt-extraction attempts
 *   - requests to expose private/internal information
 *
 * The detector distinguishes a legitimate question *about* prompt injection
 * (allowed) from an actual override attempt (blocked) by requiring an
 * imperative override instruction combined with an internal target.
 */

export type InputGuardResult =
  | { ok: true }
  | { ok: false; reason: string; message: string };

export const MAX_INPUT_CHARS = 500;

/** Imperative override verbs/actions that signal an attack. */
const OVERRIDE_PATTERNS: RegExp[] = [
  /\bignore\s+(all\s+|any\s+|the\s+|your\s+|previous\s+|prior\s+)*(instructions?|prompts?|rules|system\s+prompt|guidelines|guardrails)\b/i,
  /\bdisregard\s+(all\s+|previous\s+|prior\s+|the\s+|your\s+)*(instructions?|prompts?|rules|guidelines|system\s+prompt|guardrails)\b/i,
  /\b(forget|forget\s+all|erase|drop|clear)\s+(all\s+)?(previous|prior|the|your)?\s*(instructions?|prompts?|rules|context)\b/i,
  /\b(reveal|print|output|show|display|write\s+out|leak|paste|repeat|dump|give\s+me)\s+(your\s+|the\s+|a\s+)?(system\s+prompt|system\s+instructions?|prompt|developer\s+prompt|developer\s+instructions?|hidden\s+instructions?|initial\s+instructions?)\b/i,
  /\byou\s+are\s+now\b/i,
  /\bact\s+as\s+(an?\s+|the\s+)?(unrestricted|jailbroken|developer|admin|root|anyone\s+else)\b/i,
  /\brevert\s+(to|into)\b/i,
  /\bsystem\s+prompt\b.{0,60}\b(override|ignore|bypass|reveal|expose)\b/i,
  /\bbypass\s+(your\s+)?(instructions?|rules|guardrails|filters)\b/i,
  /\b(don'?t|do\s+not)\s+(follow|obey|respect)\s+(your|the)\s+(instructions?|rules|guidelines|guardrails)\b/i,
];

/** Internal/private targets that must never be revealed. */
const INTERNAL_TARGET_PATTERNS: RegExp[] = [
  /\b(system\s+prompt|system\s+instructions?|hidden\s+instructions?|internal\s+instructions?|developer\s+prompt|developer\s+instructions?)\b/i,
  /\b(api\s*key|secret|credential|token|password|passphrase|private\s+key)\b/i,
  /\b(database|db\s+password|sql|query\s+plan|vector\s+filter|qdrant|collection\s+name)\b/i,
  /\b(environment\s+variable|env\s+var|dotenv|\.env)\b/i,
  /\b(job\s+applications?|applicant|resumes?|cn\s*ic|national\s+id|submissions|leads?|contact\s+form\s+submissions)\b/i,
  /\b(admin\s+users?|roles|permissions|refresh\s+tokens|password\s+hashes?|auth)\b/i,
];

/** Verbs that indicate an attempt to extract/see private data. */
const EXTRACTION_VERBS = [
  "show",
  "give",
  "list",
  "access",
  "see",
  "reveal",
  "leak",
  "print",
  "dump",
  "download",
  "view",
  "read",
  "find",
  "tell me about the applications",
  "what are the applications",
];

/** Direct "reveal system prompt" style attempts (block unconditionally). */
function isDirectRevealAttempt(text: string): boolean {
  const direct = [
    /\breveal\s+(your\s+|the\s+)?system\s+prompt\b/i,
    /\boutput\s+(your\s+|the\s+)?(system\s+)?prompt\b/i,
    /\bprint\s+(your\s+|the\s+)?(system\s+)?prompt\b/i,
    /\bwhat\s+is\s+your\s+system\s+prompt\b/i,
    /\bshow\s+me\s+(your\s+|the\s+)?(system\s+)?prompt\b/i,
    /\bignore\s+all\s+previous\s+instructions\b.{0,120}\breveal\b/i,
  ];
  return direct.some((re) => re.test(text));
}

/** A purely conceptual question about prompt injection is allowed. */
function isConceptualQuestion(text: string): boolean {
  const trimmed = text.trim().replace(/[?.!]+$/, "");
  if (!/^(what|how|why|is|are|can|do|does|explain|describe|tell\s+me|about)\b/i.test(trimmed)) {
    return false;
  }
  return /\bprompt\s+injection\b|\bprompt\s+injections?\b|\bsystem\s+prompt\b/i.test(trimmed);
}

/** Detects spam / gibberish: character floods or symbol-heavy payloads. */
function isSpamOrGarbage(text: string): boolean {
  if (/(.)\1{14,}/.test(text)) return true; // same char repeated 15+ times
  if (/(\b\w+\b)(\s+\1){9,}/i.test(text)) return true; // same word 10+ times
  const letters = text.replace(/[^a-zA-Z]/g, "").length;
  return letters === 0 || letters / text.length < 0.35;
}

export function guardUserInput(input: string): InputGuardResult {
  const text = input.trim();
  if (!text) {
    return { ok: false, reason: "empty", message: "Please type a question." };
  }
  if (text.length > MAX_INPUT_CHARS) {
    return {
      ok: false,
      reason: "too-long",
      message: "Your question is too long. Please shorten it.",
    };
  }
  if (isSpamOrGarbage(text)) {
    return {
      ok: false,
      reason: "spam",
      message: "That doesn't look like a valid question. Please rephrase it.",
    };
  }

  // Conceptual questions about prompt injection are legitimate.
  if (isConceptualQuestion(text)) {
    return { ok: true };
  }

  if (isDirectRevealAttempt(text)) {
    return {
      ok: false,
      reason: "injection-reveal",
      message:
        "I can't share internal instructions or implementation details. Ask me anything about DiQualia's services, process, or industries instead.",
    };
  }

  const hasOverride = OVERRIDE_PATTERNS.some((re) => re.test(text));
  const hasTarget = INTERNAL_TARGET_PATTERNS.some((re) => re.test(text));

  if (hasOverride && hasTarget) {
    return {
      ok: false,
      reason: "injection-override",
      message:
        "I can't do that. I'm here to answer questions about DiQualia from the public website content. Ask me about services, industries, the process, or careers.",
    };
  }

  if (hasTarget) {
    // Only block private-data extraction requests, not mentions.
    const lower = text.toLowerCase();
    const wantsExtraction =
      EXTRACTION_VERBS.some((v) => lower.includes(v)) && /(applications?|cn\s*ic|submissions|leads|admin|password|api\s*key)/i.test(text);
    if (wantsExtraction) {
      return {
        ok: false,
        reason: "private-data",
        message:
          "That information isn't public. I can only answer from the public DiQualia website content.",
      };
    }
  }

  return { ok: true };
}
