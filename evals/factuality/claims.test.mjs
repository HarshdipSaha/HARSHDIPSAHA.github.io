/**
 * Tests for the pure core (ticket #14).
 *
 * No network, no GitHub, no fixtures beyond two local text files. Everything
 * asserted here is a verdict or an extraction result — never the wording of a
 * report, which is expected to change.
 *
 * Run: npm run test:unit   (node --test evals)
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { extractClaims, isGrounded, normalise, stripMarkdown } from "./claims.mjs";

const read = (name) => readFileSync(fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)), "utf8");

const CASE_STUDY = read("case-study.mdx");
const SOURCE = read("source.md");

/** All normalised claim strings extracted from the fixture case study. */
const fixtureClaims = extractClaims(CASE_STUDY);
const normalisedSet = new Set(fixtureClaims.map((c) => c.normalised));
const byNormalised = (n) => fixtureClaims.find((c) => c.normalised === n);

/* ------------------------------------------------------------------ *
 * Extraction
 * ------------------------------------------------------------------ */

test("extracts the quantitative claims from a case-study body", () => {
  for (const expected of ["1200", "30mm", "2°", "1.4cm", "45%", "₹1.19crore", "99.7%"]) {
    assert.ok(normalisedSet.has(expected), `expected claim ${expected}; got ${[...normalisedSet].join(", ")}`);
  }
});

test("keeps the surrounding phrase for the failure report", () => {
  const claim = byNormalised("99.7%");
  assert.ok(claim.phrase.includes("accuracy"), `phrase was: ${claim.phrase}`);
});

test("extraction is order-stable and idempotent", () => {
  const a = extractClaims(CASE_STUDY);
  const b = extractClaims(CASE_STUDY);
  assert.deepEqual(a, b);
  const indexes = a.map((c) => c.index);
  assert.deepEqual(indexes, [...indexes].sort((x, y) => x - y));
});

test("the module touches neither the network nor the filesystem", () => {
  const src = readFileSync(fileURLToPath(new URL("./claims.mjs", import.meta.url)), "utf8");
  assert.equal(/^\s*import\s/m.test(src), false, "claims.mjs must import nothing");
  for (const forbidden of ["node:fs", "node:https", "node:http", "node:net", "fetch(", "require("]) {
    assert.equal(src.includes(forbidden), false, `claims.mjs must not reference ${forbidden}`);
  }
});

/* ------------------------------------------------------------------ *
 * Markdown scaffolding is not a claim
 * ------------------------------------------------------------------ */

test("markdown syntax is not extracted as a claim", () => {
  // The link target contains 2024 and 99999; neither is a claim about the work.
  assert.equal(normalisedSet.has("99999"), false, "link URL digits were extracted");
  assert.equal(normalisedSet.has("2024"), false, "link URL year was extracted");
  // Inline code identifier.
  assert.equal(normalisedSet.has("128"), false, "inline code identifier was extracted");
  // Table separator row.
  assert.equal(stripMarkdown("| a | b |\n| --- | --- |\n").includes("---"), false);
  // Heading hashes and list markers never reach the extractor.
  const stripped = stripMarkdown("### 3 things\n\n1. first\n2. second\n");
  assert.equal(stripped.includes("#"), false);
  assert.equal(/^\s*1\./m.test(stripped), false);
});

test("software version numbers are not claims", () => {
  assert.equal(normalisedSet.has("3.12"), false, "Python 3.12 was extracted");
  assert.equal(normalisedSet.has("17"), false, "OpenJDK 17 was extracted");
});

test("document enumeration is not a claim", () => {
  assert.equal(extractClaims("Stage 3 — Calibration").length, 0);
  assert.equal(extractClaims("See Table 2 and Figure 4.").length, 0);
  assert.equal(extractClaims("Theme 05 (GovTech & Public Service Delivery)").length, 0);
});

test("a fiscal-year tail is not a count", () => {
  assert.deepEqual(
    extractClaims("Social audits covered 38.58 % of works in FY2025-26.").map((c) => c.value),
    ["38.58 %"],
  );
});

test("a legend key is not a quantity, but an arithmetic line keeps its figures", () => {
  assert.equal(extractClaims("labels 0 = background, 1 = edema, 2 = tumor").length, 0);
  assert.deepEqual(
    extractClaims("₹2.4 L + ₹2.9 L = ₹5.3 L, same panchayat").map((c) => c.value),
    ["₹2.4 L", "₹2.9 L", "₹5.3 L"],
  );
});

test("an Indian-magnitude currency claim keeps its magnitude", () => {
  const [claim] = extractClaims("a ₹4.2 lakh farm pond");
  assert.equal(claim.normalised, "₹4.2lakh");
  assert.equal(isGrounded(claim, "the pond cost Rs 4.2 L"), true);
  assert.equal(isGrounded(claim, "the pond cost Rs 4.2 crore"), false);
});

/* ------------------------------------------------------------------ *
 * Grounding — the four normalisation rules ticket #14 names
 * ------------------------------------------------------------------ */

test("a grounded number is grounded", () => {
  assert.equal(isGrounded(byNormalised("1.4cm"), SOURCE), true);
});

test("an ungrounded number is ungrounded", () => {
  assert.equal(isGrounded(byNormalised("99.7%"), SOURCE), false);
});

test("grounded only after thousands-separator normalisation (1,200 = 1200)", () => {
  const claim = byNormalised("1200");
  assert.equal(claim.value.includes(","), true, "fixture should write it with a separator");
  assert.equal(isGrounded(claim, "We collected 1200 samples."), true);
});

test("grounded only after unit-spacing normalisation (30 mm = 30mm, 2 ° = 2°)", () => {
  assert.equal(isGrounded(byNormalised("30mm"), "a 30mm target"), true);
  assert.equal(isGrounded(byNormalised("2°"), "held to 2 ° of nominal"), true);
  assert.equal(isGrounded({ normalised: normalise("2°") }, "held to 2° of nominal"), true);
});

test("grounded only after percent normalisation (45 % = 45 percent)", () => {
  assert.equal(isGrounded(byNormalised("45%"), "reached 45 percent of the ceiling"), true);
});

test("grounded only after currency normalisation (₹1.19 crore = Rs 1.19 crore)", () => {
  assert.equal(isGrounded(byNormalised("₹1.19crore"), "Recovered budget: Rs 1.19 crore."), true);
  assert.equal(isGrounded(byNormalised("₹1.19crore"), "Recovered budget: INR 1.19 cr."), true);
});

test("grounded only after unicode-punctuation normalisation", () => {
  // En dash, middle dot, curly quotes and a narrow no-break space in the source.
  assert.equal(isGrounded({ normalised: normalise("462 instances") }, "462 instances — “as published”"), true);
  assert.equal(normalise("462 · ₹1.19 crore"), normalise("462 · Rs. 1.19 crores"));
  // En dash and em dash both fold to a hyphen, so a range written either way matches.
  assert.equal(normalise("1.5–6.5 GHz"), normalise("1.5-6.5 ghz"));
  assert.equal(normalise("1.5—6.5 GHz"), normalise("1.5-6.5 ghz"));
  // Non-breaking space between number and unit.
  assert.equal(normalise("30 mm"), normalise("30mm"));
});

test("every fixture claim except the invented one is grounded in the fixture source", () => {
  const ungrounded = fixtureClaims.filter((c) => !isGrounded(c, SOURCE)).map((c) => c.normalised);
  assert.deepEqual(ungrounded, ["99.7%"]);
});

/* ------------------------------------------------------------------ *
 * Conservatism — a false "grounded" is the failure mode that matters
 * ------------------------------------------------------------------ */

test("a number is not grounded by a longer number containing it", () => {
  assert.equal(isGrounded({ normalised: "14" }, "we measured 142 events"), false);
  assert.equal(isGrounded({ normalised: "14" }, "pi is 3.14159"), false);
  assert.equal(isGrounded({ normalised: "12" }, "1200 samples"), false);
});

test("a unit-bearing claim is not grounded by the bare number", () => {
  assert.equal(isGrounded({ normalised: "1.4cm" }, "the score was 1.4 overall"), false);
  assert.equal(isGrounded({ normalised: "45%" }, "45 samples"), false);
});

test("an empty or missing source grounds nothing", () => {
  assert.equal(isGrounded({ normalised: "42" }, ""), false);
  assert.equal(isGrounded({ normalised: "42" }, null), false);
});
