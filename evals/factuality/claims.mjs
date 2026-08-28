/**
 * Factuality evals — pure claim-extraction and grounding core.
 *
 * This module is deliberately dependency-free: it imports nothing, touches no
 * filesystem and opens no socket. Everything here is a pure function over
 * strings, so the logic that decides pass/fail is testable in milliseconds with
 * `node --test evals` and cannot be flaky.
 *
 * Two exports carry the contract (spec #12, ticket #14):
 *
 *   extractClaims(body)            -> ordered Claim[]
 *   isGrounded(claim, sourceText)  -> boolean
 *
 * Design bias: a false "grounded" verdict is the single failure mode that
 * defeats the gate — it lets an invented number through silently. An
 * over-eager "ungrounded" verdict only costs a human a baseline entry. So every
 * ambiguous case resolves to ungrounded.
 */

/** @typedef {"currency" | "percentage" | "measurement" | "rank" | "year" | "count"} ClaimKind */

/**
 * @typedef {object} Claim
 * @property {string} value       The claim as written, e.g. "1.4 cm".
 * @property {string} normalised  Canonical form used for matching, e.g. "1.4cm".
 * @property {ClaimKind} kind
 * @property {string} phrase      Surrounding text, kept for the failure report.
 * @property {number} index       Character offset in the stripped body (order key).
 */

/* ------------------------------------------------------------------ *
 * Unit vocabulary
 * ------------------------------------------------------------------ */

/**
 * Real units of measure. A unit binds to its number during matching: "30 mm"
 * is only grounded by "30 mm"/"30mm" in the source, never by a bare "30".
 * A trailing noun ("462 instances") is NOT a unit — the source is free to call
 * them "payments", so only the number itself has to match.
 */
const UNITS = [
  // length
  "km", "cm", "mm", "nm", "um", "µm", "m",
  // mass
  "kg", "mg", "g",
  // time
  "ms", "ns", "sec", "secs", "s", "min", "mins", "hr", "hrs", "h",
  // frequency / rate
  "ghz", "mhz", "khz", "hz", "fps", "bps", "kbps", "mbps",
  // data
  "tb", "gb", "mb", "kb", "kib", "mib", "gib", "b",
  // electrical / signal
  "db", "dbm", "kw", "mw", "w", "kv", "mv", "v",
  // display
  "px", "dpi", "ppi",
];

/** Multi-character units are tried before single-character ones so "ms" wins over "m". */
const UNIT_ALTERNATION = [...UNITS]
  .sort((a, b) => b.length - a.length)
  .map((u) => u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");

/**
 * Words that precede a *version* number rather than a factual quantity.
 * "Python 3.12" and "Gemini 1.5 Flash" are software versions: they say nothing
 * about the work's results, and treating them as claims produced pure noise on
 * the first run over real content. Excluded at extraction, not baselined
 * (ticket #16 triage tier 3).
 */
const VERSION_CONTEXT = new Set([
  "python", "node", "nodejs", "java", "openjdk", "jdk", "jre", "ruby", "php",
  "go", "rust", "dotnet", "net", "cuda", "cudnn", "tensorflow", "torch",
  "pytorch", "keras", "numpy", "scipy", "pandas", "react", "next", "angular",
  "vue", "django", "flask", "spark", "hadoop", "llama", "gemini", "gpt",
  "claude", "mistral", "qwen", "bert", "sdxl", "http", "https", "tls", "ssl",
  "usb", "bluetooth", "wifi", "ipv", "v", "version", "ver", "rev", "release",
  "es", "ecmascript", "typescript", "ts", "js", "css", "html", "sql",
  "postgres", "postgresql", "mysql", "sqlite", "redis", "mongodb", "ubuntu",
  "windows", "macos", "android", "ios", "chrome", "firefox", "safari",
]);

/**
 * Words that introduce a *structural enumeration* — the document's own
 * scaffolding, not a claim about the world. "Stage 3" in a four-bullet list
 * describing a pipeline is a list index; the source repo is under no obligation
 * to number its stages the same way.
 */
const ENUMERATION_CONTEXT = new Set([
  "stage", "stages", "step", "steps", "phase", "phases", "part", "parts",
  "section", "sections", "chapter", "chapters", "figure", "figures", "fig",
  "table", "tables", "appendix", "item", "items", "point", "points",
  "channel", "channels", "class", "classes", "label", "labels", "index",
  "theme", "themes", "track", "tracks", "round", "rounds",
]);

/** Words that mark a rank/ordinal claim when they immediately precede a number. */
const RANK_CONTEXT = new Set(["top", "rank", "ranked", "place", "placed", "position", "no", "#"]);

/* ------------------------------------------------------------------ *
 * Normalisation
 * ------------------------------------------------------------------ */

const UNICODE_FOLD = [
  [/[‘’‚‛′]/g, "'"],
  [/[“”„‟″]/g, '"'],
  [/[‐‑‒–—―−]/g, "-"],
  [/[·•‧⋅]/g, " "],
  [/[…]/g, "..."],
  [/[       ]/g, " "],
  [/[​‌‍﻿]/g, ""],
  [/[×✕✖]/g, "x"],
  [/[≥]/g, ">="],
  [/[≤]/g, "<="],
  [/[≈]/g, "~"],
];

/**
 * Canonical form for literal matching.
 *
 * Equates, per ticket #14: thousands separators (`1,200` = `1200`), unit
 * spacing (`2 °` = `2°`, `30 mm` = `30mm`), unicode punctuation, spelled-out
 * percent and degree, and Indian currency words (`₹1.19 crore`).
 *
 * @param {string} text
 * @returns {string}
 */
export function normalise(text) {
  let s = String(text ?? "");

  for (const [re, to] of UNICODE_FOLD) s = s.replace(re, to);

  s = s.toLowerCase();

  // Spelled-out units -> symbols, before any spacing is squeezed.
  s = s.replace(/\bper\s?cents?\b/g, "%");
  s = s.replace(/\bpercentage\s+points?\b/g, "%");
  s = s.replace(/\bdegrees?\b/g, "°");
  s = s.replace(/\bdeg\b/g, "°");

  // Currency: symbol/word forms of the rupee collapse to one symbol.
  s = s.replace(/\b(?:rs\.?|inr|rupees?)\s*/g, "₹");
  // Indian magnitude words. "L"/"lakh"/"lakhs" and "cr"/"crore"/"crores" are
  // the same magnitude written three ways.
  s = s.replace(/(\d)\s*(?:lakhs?|lacs?|l)\b/g, "$1lakh");
  s = s.replace(/(\d)\s*(?:crores?|cr)\b/g, "$1crore");

  // Thousands separators inside numbers: 1,200 -> 1200 and 1 200 -> 1200.
  // Applied repeatedly so 1,234,567 collapses fully.
  let prev;
  do {
    prev = s;
    s = s.replace(/(\d),(\d{3})\b/g, "$1$2");
  } while (s !== prev);

  // Unit spacing: "30 mm" -> "30mm", "2 °" -> "2°", "45 %" -> "45%".
  s = s.replace(new RegExp(`(\\d)\\s+(${UNIT_ALTERNATION})\\b`, "g"), "$1$2");
  s = s.replace(/(\d)\s+([%°])/g, "$1$2");
  s = s.replace(/([₹$£€])\s+(\d)/g, "$1$2");

  // Trailing decimal zeros carry no information for a literal match:
  // 100.0 % and 100 % are the same claim.
  s = s.replace(/(\d)\.0+(?![\d])/g, "$1");

  // Collapse remaining whitespace.
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

/* ------------------------------------------------------------------ *
 * Markdown stripping
 * ------------------------------------------------------------------ */

/**
 * Remove markdown scaffolding so that its syntax is never mistaken for a claim,
 * while preserving the prose (and its character order) that carries claims.
 *
 * Removed outright: fenced code, inline code spans, HTML comments, link and
 * image *targets* (a URL's digits are not a claim), bare URLs, table separator
 * rows, frontmatter.
 *
 * Reduced to their text: headings (hashes dropped), list markers, emphasis
 * markers, table pipes, blockquote markers, link labels.
 *
 * @param {string} body
 * @returns {string}
 */
export function stripMarkdown(body) {
  let s = String(body ?? "");

  // Frontmatter, if a whole file was handed in rather than a body.
  s = s.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");

  // HTML comments and MDX/JSX-ish tags.
  s = s.replace(/<!--[\s\S]*?-->/g, " ");

  // Fenced code blocks.
  s = s.replace(/^[ \t]*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^[ \t]*\1[^\n]*$/gm, " ");
  // An unterminated fence swallows the rest of the document rather than
  // leaking code as prose.
  s = s.replace(/^[ \t]*(`{3,}|~{3,})[^\n]*\n[\s\S]*$/m, " ");

  // Inline code spans. Identifiers like `CACHED128` or `(10, 128, 128, 128)`
  // are code, not claims about the world.
  s = s.replace(/(`+)(?:(?!\1)[\s\S])*?\1/g, " ");

  // Images: drop entirely (alt text is not prose).
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, " ");

  // Links: keep the label, drop the target.
  s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  // Reference-style link definitions.
  s = s.replace(/^\s*\[[^\]]+\]:\s*\S+.*$/gm, " ");

  // Bare URLs and autolinks.
  s = s.replace(/<https?:\/\/[^>]*>/g, " ");
  s = s.replace(/\bhttps?:\/\/\S+/g, " ");
  s = s.replace(/\b[\w.-]+\.(?:com|org|net|io|dev|app|ai|tech|co|edu|gov|in|me)\b(?:\/\S*)?/g, " ");

  // Table separator rows (|---|---|).
  s = s.replace(/^\s*\|?[\s:-]*\|[\s|:-]*$/gm, " ");
  // Table pipes -> spaces (cell contents are prose and may carry claims).
  s = s.replace(/\|/g, " ");

  // Heading hashes, blockquote markers, list markers, horizontal rules.
  s = s.replace(/^\s{0,3}#{1,6}\s+/gm, "");
  s = s.replace(/^\s*>+\s?/gm, "");
  s = s.replace(/^\s*(?:[-*+]|\d{1,3}[.)])\s+/gm, "");
  s = s.replace(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/gm, " ");

  // Emphasis / strikethrough markers.
  s = s.replace(/\*\*|__|~~/g, "");
  s = s.replace(/(^|[\s(])[*_]([^*_\n]+)[*_](?=[\s).,;:!?]|$)/g, "$1$2");

  return s;
}

/* ------------------------------------------------------------------ *
 * Extraction
 * ------------------------------------------------------------------ */

/**
 * One numeric token, optionally prefixed by a currency symbol and optionally
 * suffixed by a unit, a percent sign or a degree sign.
 *
 * Kept greedy on the number so "22050" is one token, and anchored so that a
 * number embedded in an identifier (`sha1abc`) is not matched.
 */
const NUMBER_RE = new RegExp(
  String.raw`(?<![\w.])` +
    String.raw`(?<currency>[₹$£€])?\s?` +
    String.raw`(?<number>\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)` +
    String.raw`\s?(?<suffix>%|°|` +
    UNIT_ALTERNATION +
    String.raw`|lakhs?|lacs?|l|crores?|cr|million|billion|thousand|k|m)?` +
    String.raw`(?![\w.]*[a-z])`,
  "giu",
);

const PHRASE_RADIUS = 60;

/**
 * @param {string} stripped
 * @param {number} start
 * @param {number} end
 * @returns {string}
 */
function phraseAround(stripped, start, end) {
  const from = Math.max(0, start - PHRASE_RADIUS);
  const to = Math.min(stripped.length, end + PHRASE_RADIUS);
  let phrase = stripped.slice(from, to).replace(/\s+/g, " ").trim();
  if (from > 0) phrase = "…" + phrase;
  if (to < stripped.length) phrase += "…";
  return phrase;
}

/**
 * The word immediately before the match, lowercased and stripped of punctuation.
 * @param {string} stripped
 * @param {number} start
 */
function precedingWord(stripped, start) {
  const before = stripped.slice(Math.max(0, start - 40), start);
  const m = before.match(/([A-Za-z#]+)[\s\-/(]*$/);
  return m ? m[1].toLowerCase() : "";
}

/**
 * The word immediately after the match, lowercased.
 * @param {string} stripped
 * @param {number} end
 */
function followingWord(stripped, end) {
  const after = stripped.slice(end, end + 40);
  const m = after.match(/^[\s\-]*([A-Za-z]+)/);
  return m ? m[1].toLowerCase() : "";
}

const UNIT_SET = new Set(UNITS);

/**
 * Extract every quantitative claim from a case-study body, in document order.
 *
 * Deterministic and idempotent: the same input always yields the same array,
 * and the function holds no state between calls.
 *
 * Digit-bearing claims only. Spelled-out quantities ("six members") are out of
 * scope: matching them literally against a source that writes "6" would need
 * a number-word normaliser whose failure mode is a false "grounded", which is
 * exactly the verdict this suite must never produce by accident.
 *
 * @param {string} body  Raw MDX body (frontmatter tolerated).
 * @returns {Claim[]}
 */
export function extractClaims(body) {
  const stripped = stripMarkdown(body);
  /** @type {Claim[]} */
  const claims = [];
  const seen = new Set();

  for (const match of stripped.matchAll(NUMBER_RE)) {
    const start = match.index ?? 0;
    const raw = match[0];
    const end = start + raw.length;
    const groups = /** @type {Record<string, string | undefined>} */ (match.groups ?? {});
    const number = groups.number ?? "";
    const currency = groups.currency ?? "";
    const suffixRaw = (groups.suffix ?? "").trim();
    const suffix = suffixRaw.toLowerCase();

    const prev = precedingWord(stripped, start);
    const next = followingWord(stripped, end);

    // --- exclusions -------------------------------------------------

    // Software version numbers ("Python 3.12", "Gemini 1.5 Flash").
    if (VERSION_CONTEXT.has(prev)) continue;
    // "3.10+" / "v2" style versions where the marker follows.
    if (/^\d+\.\d+$/.test(number) && VERSION_CONTEXT.has(next)) continue;

    // Document scaffolding ("Stage 3", "Table 2", "channels 0-3").
    if (ENUMERATION_CONTEXT.has(prev)) continue;

    // A lone 0 or 1 is almost always an index, a label or a boolean, never a
    // measurable claim. Keep them only when they carry a unit or a symbol.
    if (!currency && !suffix && (number === "0" || number === "1")) continue;

    // The tail of a fiscal-year or year range: the "26" of "FY2025-26" is half
    // a year label, not a count.
    if (!currency && !suffix && /(?:19|20)\d{2}\s?[-]\s?$/.test(stripped.slice(Math.max(0, start - 12), start))) {
      continue;
    }

    // A label mapping ("0 = background, 1 = edema, 2 = tumor"): the number is
    // the key of a legend, not a quantity. Currency and unit-bearing numbers
    // are exempt so that an arithmetic line ("₹2.4 L + ₹2.9 L = ₹5.3 L") keeps
    // all three of its figures.
    if (!currency && !suffix && /^\s*=/.test(stripped.slice(end, end + 4))) continue;

    // --- classification --------------------------------------------

    /** @type {ClaimKind} */
    let kind;
    /** @type {string} */
    let canonical;

    if (currency) {
      kind = "currency";
      canonical = normalise(`${currency}${number} ${suffixRaw}`);
    } else if (suffix === "%") {
      kind = "percentage";
      canonical = normalise(`${number}%`);
    } else if (suffix === "°") {
      kind = "measurement";
      canonical = normalise(`${number}°`);
    } else if (suffix && UNIT_SET.has(suffix)) {
      kind = "measurement";
      canonical = normalise(`${number}${suffix}`);
    } else if (RANK_CONTEXT.has(prev)) {
      kind = "rank";
      canonical = normalise(number);
    } else if (/^(?:19|20)\d{2}$/.test(number) && !suffix) {
      kind = "year";
      canonical = normalise(number);
    } else {
      kind = "count";
      // Magnitude words ("1M+", "5 million") stay attached: the magnitude is
      // part of the quantity, not a unit of measure.
      canonical = normalise(suffix ? `${number}${suffix}` : number);
    }

    const value = raw.replace(/\s+/g, " ").trim();
    const claim = {
      value,
      normalised: canonical,
      kind,
      phrase: phraseAround(stripped, start, end),
      index: start,
    };

    // Deduplicate identical claims within a document: the same number repeated
    // is one claim to verify, and one baseline entry if it needs one.
    const key = `${kind}:${canonical}`;
    if (seen.has(key)) continue;
    seen.add(key);

    claims.push(claim);
  }

  return claims;
}

/* ------------------------------------------------------------------ *
 * Grounding
 * ------------------------------------------------------------------ */

/** Escape a string for literal use inside a RegExp. */
function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Is this claim traceable to the source text?
 *
 * Normalised literal match. A unit-bearing or currency claim must match with
 * its unit attached — "1.4 cm" is not grounded by an unrelated "1.4" — while a
 * bare count matches the standalone number, since the source is free to name
 * the counted thing differently ("462 instances" vs "462 payments").
 *
 * Number boundaries are enforced so that "14" is not grounded by "142" or
 * "3.14".
 *
 * @param {Claim | string} claim
 * @param {string} sourceText
 * @returns {boolean}
 */
export function isGrounded(claim, sourceText) {
  if (!sourceText) return false;
  const needle = typeof claim === "string" ? normalise(claim) : claim.normalised;
  if (!needle) return false;

  const haystack = normalise(sourceText);

  // Left boundary: not preceded by a digit, a decimal point or a comma.
  // Right boundary: not followed by a digit, and not followed by a decimal
  // point that itself precedes a digit.
  const pattern = new RegExp(
    `(?<![\\d.,])${esc(needle)}(?![\\d])(?!\\.\\d)`,
    "u",
  );
  return pattern.test(haystack);
}
