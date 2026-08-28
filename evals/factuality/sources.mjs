/**
 * Factuality evals — ground-truth sources.
 *
 * Ground truth is the source repository's README, fetched at run time through
 * the GitHub API. Nothing is vendored: a committed copy would drift from the
 * source and reintroduce exactly the staleness the gate exists to prevent
 * (spec #12, "Implementation Decisions").
 *
 * Everything network-facing lives here so that `claims.mjs` and `verdict.mjs`
 * stay pure and testable offline.
 */

import { execFileSync } from "node:child_process";

/** Thrown when GitHub could not be reached after the configured retries. */
export class NetworkExhaustedError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = "NetworkExhaustedError";
  }
}

/**
 * Resolve a GitHub token.
 *
 * In CI this is the workflow's `GITHUB_TOKEN`, which can only read the
 * repository the workflow belongs to. Locally it falls back to the `gh` CLI's
 * stored token, which usually carries the owner's own access.
 *
 * The consequence is that the same case study can be `grounded` locally and
 * `unverifiable` in CI, when its source repository is private to the owner
 * (`ComPhysGroup/PyAMorph` is one). Both runs are correct and both exit 0: a
 * source the run cannot read is reported as unverifiable, never guessed at.
 *
 * @returns {{token: string | null, origin: string}}
 */
export function resolveToken() {
  const fromEnv = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (fromEnv) return { token: fromEnv, origin: process.env.GITHUB_TOKEN ? "GITHUB_TOKEN" : "GH_TOKEN" };

  try {
    const out = execFileSync("gh", ["auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 10_000,
    }).trim();
    if (out) return { token: out, origin: "gh auth token" };
  } catch {
    // gh not installed or not logged in — fall through to unauthenticated.
  }

  return { token: null, origin: "unauthenticated" };
}

/**
 * Parse an `owner/repo` pair out of a case study's `link` frontmatter field.
 *
 * Tolerates the quoting variations already present in the content (some links
 * are wrapped in single quotes by the YAML) and trailing slashes or `.git`.
 *
 * @param {unknown} link
 * @returns {{owner: string, repo: string, url: string} | null}
 */
export function parseRepo(link) {
  if (typeof link !== "string") return null;
  const cleaned = link.trim().replace(/^['"]|['"]$/g, "").trim();
  if (!cleaned) return null;
  const m = cleaned.match(/^https?:\/\/(?:www\.)?github\.com\/([^/\s]+)\/([^/\s#?]+)/i);
  if (!m) return null;
  const owner = m[1];
  const repo = m[2].replace(/\.git$/i, "");
  return { owner, repo, url: `https://github.com/${owner}/${repo}` };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch a repository's README as raw text.
 *
 * Outcomes:
 *   { ok: true, text, ref }            — README retrieved
 *   { ok: false, reason }              — repository or README not reachable in a
 *                                        way that retrying cannot fix (404 =
 *                                        gone, renamed or private). The caller
 *                                        treats this as `unverifiable`, not a
 *                                        crash.
 *   throws NetworkExhaustedError       — transient failures (5xx, rate limit,
 *                                        socket) survived every retry. A
 *                                        different exit code from a factuality
 *                                        failure: a red check must never be
 *                                        ambiguous between "the network broke"
 *                                        and "you published a false claim".
 *
 * @param {{owner: string, repo: string}} repo
 * @param {{token?: string | null, retries?: number, baseDelayMs?: number, fetchImpl?: typeof fetch, log?: (m: string) => void}} [options]
 */
export async function fetchReadme({ owner, repo }, options = {}) {
  const {
    token = null,
    retries = 4,
    baseDelayMs = 500,
    fetchImpl = fetch,
    log = () => {},
  } = options;

  const url = `https://api.github.com/repos/${owner}/${repo}/readme`;
  const headers = {
    Accept: "application/vnd.github.raw+json",
    "User-Agent": "harshdipsaha-portfolio-factuality-eval",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let lastTransient = "";

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    let response;
    try {
      response = await fetchImpl(url, { headers });
    } catch (error) {
      lastTransient = `network error: ${error?.message ?? error}`;
      log(`  ${owner}/${repo}: ${lastTransient} (attempt ${attempt + 1}/${retries + 1})`);
      if (attempt < retries) await sleep(baseDelayMs * 2 ** attempt);
      continue;
    }

    if (response.ok) {
      return { ok: true, text: await response.text(), ref: `${owner}/${repo} README` };
    }

    // 404 — repository gone, renamed, private, or no README at all. Retrying
    // cannot change this, and it is a legitimate "unverifiable", not a failure.
    if (response.status === 404) {
      return {
        ok: false,
        reason: `GitHub returned 404 for ${owner}/${repo} — repository or README not readable (gone, renamed, or private)`,
      };
    }

    // 401/403 without a rate-limit marker means the token cannot read this repo.
    const remaining = response.headers.get("x-ratelimit-remaining");
    const rateLimited =
      response.status === 429 || (response.status === 403 && remaining === "0");

    if (response.status === 401 || (response.status === 403 && !rateLimited)) {
      return {
        ok: false,
        reason: `GitHub returned ${response.status} for ${owner}/${repo} — not readable with the available credentials`,
      };
    }

    if (rateLimited || response.status >= 500) {
      lastTransient = `HTTP ${response.status}${rateLimited ? " (rate limited)" : ""}`;
      log(`  ${owner}/${repo}: ${lastTransient} (attempt ${attempt + 1}/${retries + 1})`);
      if (attempt < retries) {
        const reset = Number(response.headers.get("x-ratelimit-reset"));
        const untilReset = Number.isFinite(reset) ? reset * 1000 - Date.now() : NaN;
        // Honour the reset window when GitHub gives one, but never sleep for
        // longer than a minute — CI should fail fast and clearly.
        const wait = Number.isFinite(untilReset) && untilReset > 0
          ? Math.min(untilReset + 1000, 60_000)
          : baseDelayMs * 2 ** attempt;
        await sleep(wait);
      }
      continue;
    }

    return { ok: false, reason: `GitHub returned HTTP ${response.status} for ${owner}/${repo}` };
  }

  throw new NetworkExhaustedError(
    `could not fetch ${owner}/${repo} README after ${retries + 1} attempts — last failure: ${lastTransient}`,
  );
}
