/**
 * Factuality evals — optional LLM-judge tier.
 *
 * The deterministic tier only sees numbers. A prose assertion ("selected for
 * oral presentation", "placed in the top 45") is invisible to a regex, and
 * pretending otherwise would produce false confidence. This tier asks a model
 * to judge such assertions against the source README, with a rubric.
 *
 * Two rules govern it, from spec #12:
 *
 *   1. Its verdicts are **advisory**. They appear in the report; they never
 *      change the exit code. A model's opinion is not a gate.
 *   2. It is **optional**. This repository has no `ANTHROPIC_API_KEY`, so the
 *      tier is skipped with a printed notice and the run still succeeds. A gate
 *      that is dead by default is worse than no gate.
 *
 * The Anthropic SDK is a devDependency and is imported dynamically, so a
 * checkout without it (or without a key) still runs the suite end to end.
 */

const MODEL = "claude-opus-5";

const RUBRIC = `You are auditing a portfolio case study against the source repository's README.

Return ONLY assertions in the CASE STUDY that a careful reader could not support
from the SOURCE. Judge support, not style. Apply this rubric:

- supported      — the SOURCE states it, or states something that entails it.
- unsupported    — the SOURCE contradicts it, or says nothing that entails it.
- unverifiable   — the assertion is about something outside the SOURCE's scope
                   (a competition result, a paper, a private artefact).

Ignore: numbers (a separate deterministic check already covers those), wording,
tone, ordering, and anything the case study explicitly attributes to a source
other than the README.

Respond as a JSON array (possibly empty) of
{"assertion": string, "verdict": "unsupported" | "unverifiable", "why": string}.
Output nothing else.`;

/**
 * Is a key configured for the judge tier?
 * @returns {boolean}
 */
export function judgeAvailable() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

/**
 * Human-readable reason the tier was skipped, or null if it can run.
 * @returns {string | null}
 */
export function judgeSkipReason() {
  if (!judgeAvailable()) {
    return "no ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN in the environment — the judge tier is optional and the deterministic tier alone decides the exit code";
  }
  return null;
}

/**
 * Judge one case study's prose against its source.
 *
 * Never throws: any failure (missing SDK, API error, unparseable response)
 * degrades to a recorded note. An advisory tier must not be able to break the
 * gate it advises.
 *
 * @param {{file: string, body: string, source: string}} input
 * @returns {Promise<{file: string, ran: boolean, note?: string, findings?: Array<{assertion: string, verdict: string, why: string}>}>}
 */
export async function judgeCaseStudy({ file, body, source }) {
  if (!judgeAvailable()) return { file, ran: false, note: judgeSkipReason() };

  let Anthropic;
  try {
    ({ default: Anthropic } = await import("@anthropic-ai/sdk"));
  } catch {
    return {
      file,
      ran: false,
      note: "@anthropic-ai/sdk is not installed — run `npm ci` to enable the judge tier",
    };
  }

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: RUBRIC,
      messages: [
        {
          role: "user",
          content: `<case-study file="${file}">\n${body}\n</case-study>\n\n<source>\n${source}\n</source>`,
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return { file, ran: false, note: "judge declined the request" };
    }

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    const json = text.replace(/^```(?:json)?\s*|\s*```$/g, "");
    const findings = JSON.parse(json);
    if (!Array.isArray(findings)) throw new Error("judge did not return an array");
    return { file, ran: true, findings };
  } catch (error) {
    return { file, ran: false, note: `judge tier errored: ${error?.message ?? error}` };
  }
}
