/**
 * Query analysis.
 *
 * Lightweight, deterministic intent classification (no extra LLM call) that
 * decides which structured topics to fetch and whether semantic retrieval is
 * needed. Off-topic and technical questions are rejected here so they never
 * reach the LLM.
 */

import type { StructuredTopic } from "./structured";

export type QueryAnalysis = {
  structuredTopics: StructuredTopic[];
  needsVector: boolean;
  offTopic: boolean;
};

const DIQUALIA_KEYWORDS =
  /\b(diqualia|service|industr|sector|process|engagement|career|job|role|hiring|pricing|contact|email|story|about|manifesto|double experience|values|construction|engineering|technical services|real estate|manufacturing|healthcare|financial|logistics|energy|saas|legal|marketing|research|lead|buyer|positioning|messaging|competitive|pipeline)\b/i;

/** General-knowledge / entertainment patterns — always out of scope. */
const OFF_TOPIC_PATTERNS: RegExp[] = [
  /\bcapital\s+of\b/i,
  /\bweather\s+(in|at|for)\b/i,
  /\b(tell me|what is)\s+a\s+(recipe|joke|poem|story)\b/i,
  /\bhow to (cook|bake|fix|repair|install|play|win|drive|draw)\b/i,
  /\btranslate\b/i,
  /\b(president|prime minister|king|queen)\s+of\b/i,
  /\b(celebrity|football|cricket|basketball|world cup|olympic|movie|film|song|game)\b/i,
  /\b(what is|who is|explain|define|tell me about)\s+(the\s+)?(meaning of life|gravity|photosynthesis|quantum|black hole|big bang)\b/i,
  /\b(history|geography|biology|chemistry|physics)\s+(of|question|homework)\b/i,
];

/** Technical / development questions are never answered by this assistant. */
const TECHNICAL_PATTERNS: RegExp[] = [
  /\b(code|coding|program(ming)?|developer|script|function|variable|array|loop|regex)\b/i,
  /\b(javascript|typescript|python|java|c\+\+|c#|php|ruby|rust|golang|react|angular|vue|next\.?js|node\.?js|tailwind|html|css)\b/i,
  /\b(api|rest|graphql|endpoint|database|sql|nosql|mongo|prisma|schema|query|index(?:ing)?)\b/i,
  /\b(machine learning|deep learning|neural network|ai model|llm|transformer|embedding|vector search|algorithm|data structure|big o)\b/i,
  /\b(docker|kubernetes|cloudflare|aws|azure|vercel|server|hosting|deploy(?:ment)?|devops|ci\/cd|linux|ubuntu|ssh|dns|ssl|http status)\b/i,
  /\b(debug|bug fix|stack trace|error message|exception|compile|runtimes?|framework version|install|npm|pip|git(hub)?|command line|terminal)\b/i,
  /\b(how do (i|you) (build|create|write|implement|code|configure|set up)|step[- ]by[- ]step (guide|instructions?)|technical (detail|specification|architecture))\b/i,
];

const CONTACT_RE =
  /\b(contact|email|reach\s+(you|out|diQualia)|get\s+in\s+touch|talk\s+to\s+(you|them)|call|discovery\s+call|book|hello|hi\b|how\s+do\s+i\s+reach)\b/i;
const JOBS_RE = /\b(job|career|hiring|open\s+role|vacanc|position|apply|resume|research\s+analyst|strategy\s+associate|interview|culture|benefit|how\s+to\s+apply|team)\b/i;
const PRICING_RE =
  /\b(price|cost|pricing|how\s+much|fee|budget|retainer|engagement\s+model|intelligence\s+(starter|partnership|ongoing)|market\s+intelligence\s+sprint|90[- ]day|starter|partnership)\b/i;
const SERVICES_RE =
  /\b(service|offer|provide|do\s+you\s+(do|offer|provide)|capabilt|competitive\s+intelligence|market\s+research|lead\s+generation|buyer\s+identification|positioning|messaging|sales\s+enablement|content|proposal|outreach)\b/i;
const INDUSTRIES_RE =
  /\b(industr|sector|vertical|construction|built\s+environment|engineering|infrastructure|technical\s+services|real\s+estate|manufacturing|healthcare|financial\s+services|logistics|supply\s+chain|energy|utilities|saas|technology|legal|compliance|professional\s+services)\b/i;
const PROCESS_RE =
  /\b(process|how\s+do(es)?\s+(you|diQualia)\s+work|how\s+do(es)?\s+(you|diQualia)\s+work\s+with|steps?|methodolog|intelligence\s+process|sector\s+immersion|buyer\s+mapping|intelligence\s+brief|optimise|execution)\b/i;
const COMPANY_RE =
  /\b(what\s+is\s+diQualia|who\s+is\s+diQualia|about|story|philosophy|mission|manifesto|double\s+experience|values|why\s+diQualia|different\s+from|agency|founded|founder|positioning|approach)\b/i;
const STATS_RE = /\b(stat|metric|94%?|3\.8x|lead\s+quality|pipeline\s+growth|first\s+lead|open\s+roles|departments)\b/i;

export function analyzeQuery(rawQuery: string): QueryAnalysis {
  const text = rawQuery.trim();

  // General-knowledge and technical questions never reach the LLM.
  // A DiQualia keyword overrides a weak off-topic match, but technical
  // patterns always block (they are never legitimate for this assistant).
  if (
    TECHNICAL_PATTERNS.some((re) => re.test(text)) ||
    (OFF_TOPIC_PATTERNS.some((re) => re.test(text)) && !DIQUALIA_KEYWORDS.test(text))
  ) {
    return { structuredTopics: [], needsVector: false, offTopic: true };
  }

  const topics = new Set<StructuredTopic>();
  let needsVector = false;

  if (CONTACT_RE.test(text)) topics.add("contact");
  if (JOBS_RE.test(text)) topics.add("jobs");
  if (STATS_RE.test(text)) topics.add("stats");
  if (PRICING_RE.test(text)) topics.add("engagement");
  if (SERVICES_RE.test(text)) topics.add("services_list");
  if (INDUSTRIES_RE.test(text)) topics.add("industries_list");
  if (PROCESS_RE.test(text)) topics.add("process_list");
  if (COMPANY_RE.test(text)) topics.add("stats"); // company/values support via stats+vectors

  // Almost every substantive question benefits from semantic retrieval;
  // deterministic-only intents (pure contact/greeting) can skip it.
  const pureContact = CONTACT_RE.test(text) && !/\b(service|industr|process|job|price|engagement|story|positioning|competitive)\b/i.test(text);
  if (!pureContact) needsVector = true;

  return {
    structuredTopics: [...topics],
    needsVector,
    offTopic: false,
  };
}
