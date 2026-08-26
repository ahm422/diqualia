/**
 * Output guardrails.
 *
 * Validates the DeepSeek answer before it is returned to the user:
 *   - no internal/system-prompt leakage
 *   - no invented prices (currency amounts absent from the retrieved context)
 *   - no unsupported statistics
 *   - no absolute guarantees/promises
 *   - no references to private application/admin data
 *
 * This is not a "do the words appear" check: numeric claims are only allowed
 * when the same numbers exist in the retrieved context. An LLM-judge hook is
 * exposed for later use without changing the architecture.
 */

export type OutputGuardResult =
  | { ok: true }
  | { ok: false; reason: string; fallback: string };

const LEAK_PATTERNS = [
  /\b(system\s+prompt|developer\s+instructions?|hidden\s+instructions?)\b/i,
  /\b(api[_-]?key|secret\s+key|refresh\s+token|password\s+hash|jwt[_-]?secret|deepseek[_-]?key)\b/i,
  /\b(environment\s+variable|env[_-]?var|\.env\b|qdrant[_-]?collection|vector\s+filter)\b/i,
  /\b(cnic|national\s+id\s+number|applicant\s+photos?|job\s+applications?)\b/i,
];

/**
 * Meta-disclosure / AI-speak: the model describing its own internals or the
 * source of its answers instead of answering as DiQualia's assistant.
 */
const META_PATTERNS = [
  /\blarge\s+language\s+model\b/i,
  /\bas\s+an?\s+(ai|language\s+model|chatbot|bot)\b/i,
  /\bi(?:'m|\u2019m|\s+am)\s+(?:an?\s+)?(ai|language\s+model|chatbot|bot|program)\b/i,
  /\b(according\s+to|based\s+on|from)\s+(the\s+)?(provided|supplied|given|retrieved|referenced)\b/i,
  /\b(provided|supplied|retrieved|referenced)\s+(content|context|documents?|texts?|materials?)\b/i,
  /\b(content|context|information|documents?)\s+(that\s+(was|is)\s+)?(provided|supplied|given|shared)\b/i,
  /\b(my\s+)?(training\s+data|retrieval\s+system|knowledge\s+base)\b/i,
];

const GUARANTEE_PATTERNS = [
  /\bguarantee[ds]?\b/i,
  /\bwe\s+promise\b/i,
  /\b100%\s+(guarantee|satisfaction|success)\b/i,
  /\bno[- ]risk\b/i,
];

const CURRENCY = /\$|€|£|¥|₩|₹|PKR|Rs\.?|USD|EUR|GBP|AED|SAR/i;
const NUMBER = /\b\d{2,}(?:[.,]\d+)?\b/;

function stripUrls(text: string): string {
  return text.replace(/https?:\/\/\S+/g, "");
}

/** Extracts currency+amount mentions, e.g. "$5,000" or "3,000 USD". */
function currencyAmounts(text: string): string[] {
  const matches = text.match(
    /(?:\$|€|£|₹|¥|[A-Za-z]{3})\s?\d[\d,.]*|\d[\d,.]*\s*(?:USD|EUR|GBP|AED|SAR|PKR)/gi,
  );
  return matches ?? [];
}

function containsLeakage(text: string): boolean {
  return LEAK_PATTERNS.some((re) => re.test(text));
}

function containsMetaDisclosure(text: string): boolean {
  return META_PATTERNS.some((re) => re.test(text));
}

function containsGuarantee(text: string): boolean {
  return GUARANTEE_PATTERNS.some((re) => re.test(text));
}

function containsInventedPricing(text: string, contextText: string): boolean {
  if (!CURRENCY.test(text)) return false;
  const amounts = currencyAmounts(text);
  if (amounts.length === 0) return false;
  // Allow only if the same money phrase exists in the context.
  return amounts.some((a) => !contextText.includes(a));
}

function containsUnsupportedNumbers(text: string, contextText: string): boolean {
  const body = stripUrls(text);
  const numbers = body.match(NUMBER);
  if (!numbers) return false;
  for (const n of numbers) {
    const num = Number.parseInt(n.replace(/[.,]/g, ""), 10);
    if (Number.isNaN(num)) continue;
    // Years, small counts, and timestamps are generally safe.
    if (num >= 1900 && num <= 2100) continue;
    if (num < 10) continue;
    if (contextText.includes(n)) continue;
    return true;
  }
  return false;
}

const GENERIC_FALLBACK =
  "I don't have enough verified information to answer that fully. Ask me about DiQualia's services, industries, process, or how to get in touch.";

/** Exported for the streaming path when a guardrail fires before any safe output. */
export const GROUNDED_FALLBACK = GENERIC_FALLBACK;

/** Reserved for a future LLM-based groundedness judge (optional, off by default). */
export async function llmJudgeGrounded(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _answer: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _contextText: string,
): Promise<{ grounded: boolean; reason?: string }> {
  // Disabled by default to stay lightweight. Implement later if needed.
  return { grounded: true };
}

export async function guardOutput(
  answer: string,
  contextText: string,
): Promise<OutputGuardResult> {
  const text = answer.trim();
  if (!text) {
    return { ok: false, reason: "empty", fallback: GENERIC_FALLBACK };
  }

  if (containsLeakage(text)) {
    return { ok: false, reason: "leakage", fallback: GENERIC_FALLBACK };
  }
  if (containsMetaDisclosure(text)) {
    return { ok: false, reason: "meta-disclosure", fallback: GENERIC_FALLBACK };
  }
  if (containsGuarantee(text)) {
    return { ok: false, reason: "guarantee", fallback: GENERIC_FALLBACK };
  }
  if (containsInventedPricing(text, contextText)) {
    return { ok: false, reason: "invented-price", fallback: GENERIC_FALLBACK };
  }
  if (containsUnsupportedNumbers(text, contextText)) {
    return { ok: false, reason: "unsupported-stat", fallback: GENERIC_FALLBACK };
  }

  // Optional LLM judge hook (off by default).
  const judged = await llmJudgeGrounded(text, contextText);
  if (!judged.grounded) {
    return { ok: false, reason: judged.reason ?? "not-grounded", fallback: GENERIC_FALLBACK };
  }

  return { ok: true };
}

/**
 * Streaming variant: same checks applied to the accumulated answer so far.
 * Returns the violation reason as soon as one appears (or null while safe),
 * letting the orchestrator cut generation off mid-stream.
 *
 * `groundNumbers` can be disabled for general-knowledge answers (no retrieved
 * DiQualia context), where strict numeric grounding is meaningless.
 */
export function checkOutputStreaming(
  accumulated: string,
  contextText: string,
  opts?: { groundNumbers?: boolean },
): string | null {
  const groundNumbers = opts?.groundNumbers ?? true;
  if (containsLeakage(accumulated)) return "leakage";
  if (containsMetaDisclosure(accumulated)) return "meta-disclosure";
  if (containsGuarantee(accumulated)) return "guarantee";
  if (!groundNumbers) return null;
  if (containsInventedPricing(accumulated, contextText)) return "invented-price";
  if (containsUnsupportedNumbers(accumulated, contextText)) return "unsupported-stat";
  return null;
}
