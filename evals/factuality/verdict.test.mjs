/**
 * Tests for the classification layer — baseline handling, the stale-entry rule
 * and the no-source case. Network-free: sources are passed in as strings, which
 * is exactly the seam the spec asks for ("the harness's pure core, tested
 * without network").
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  baselineKey,
  classifyCaseStudy,
  indexBaseline,
  redundantBaselineEntries,
  staleBaselineEntries,
  summarise,
} from "./verdict.mjs";

const FILE = "content/projects/Fixture.mdx";
const BODY = "We measured 1.4 cm median error and reached 99.7 % accuracy.";
const SOURCE = "Median error came out at 1.4 cm.";

const emptyBaseline = () => indexBaseline({ entries: [] }).map;

const statusOf = (result, normalised) => result.claims.find((c) => c.normalised === normalised)?.status;

test("a claim found in the source is grounded", () => {
  const r = classifyCaseStudy({ file: FILE, body: BODY, source: SOURCE, baseline: emptyBaseline() });
  assert.equal(statusOf(r, "1.4cm"), "grounded");
});

test("a claim absent from the source is ungrounded", () => {
  const r = classifyCaseStudy({ file: FILE, body: BODY, source: SOURCE, baseline: emptyBaseline() });
  assert.equal(statusOf(r, "99.7%"), "ungrounded");
  assert.equal(r.counts.ungrounded, 1);
});

test("a claim present in the baseline is baselined, not ungrounded", () => {
  const { map } = indexBaseline({
    entries: [{ file: FILE, claim: "99.7%", value: "99.7 %", reason: "Table 3 of the published paper." }],
  });
  const r = classifyCaseStudy({ file: FILE, body: BODY, source: SOURCE, baseline: map });
  assert.equal(statusOf(r, "99.7%"), "baselined");
  assert.equal(r.counts.ungrounded, 0);
  assert.deepEqual(r.usedBaselineKeys, [baselineKey(FILE, "99.7%")]);
});

test("a baseline entry is scoped to its file", () => {
  const { map } = indexBaseline({
    entries: [{ file: "content/projects/Other.mdx", claim: "99.7%", reason: "elsewhere" }],
  });
  const r = classifyCaseStudy({ file: FILE, body: BODY, source: SOURCE, baseline: map });
  assert.equal(statusOf(r, "99.7%"), "ungrounded");
});

test("a baseline entry whose claim no longer exists is reported as stale", () => {
  const { map } = indexBaseline({
    entries: [
      { file: FILE, claim: "99.7%", reason: "Table 3 of the published paper." },
      { file: FILE, claim: "42kg", reason: "a claim that was deleted from the case study" },
    ],
  });
  const r = classifyCaseStudy({ file: FILE, body: BODY, source: SOURCE, baseline: map });
  const stale = staleBaselineEntries(map, r.presentKeys);
  assert.equal(stale.length, 1);
  assert.equal(stale[0].claim, "42kg");
  assert.equal(summarise([r], stale, []).ok, false);
});

test("an unfetchable source does not make its baseline entries stale", () => {
  // Regression: the first CI run of this gate went red because
  // ComPhysGroup/PyAMorph was unreadable with the workflow token, which turned
  // a baselined claim into an unverifiable one and then called its entry stale.
  // Staleness must mean "the claim is gone from the content", nothing else.
  const { map } = indexBaseline({
    entries: [{ file: FILE, claim: "99.7%", reason: "Table 3 of the published paper." }],
  });
  const r = classifyCaseStudy({
    file: FILE,
    body: BODY,
    source: null,
    unverifiableReason: "GitHub returned 404 — repository not readable",
    baseline: map,
  });
  assert.equal(r.counts.unverifiable, 2);
  assert.deepEqual(staleBaselineEntries(map, r.presentKeys), []);
  assert.equal(summarise([r], staleBaselineEntries(map, r.presentKeys), []).ok, true);
});

test("a baseline entry whose claim is now grounded is redundant, not an error", () => {
  const { map } = indexBaseline({
    entries: [{ file: FILE, claim: "1.4cm", reason: "was ungrounded before the README was updated" }],
  });
  const r = classifyCaseStudy({
    file: FILE,
    body: "We measured 1.4 cm median error.",
    source: SOURCE,
    baseline: map,
  });
  assert.equal(statusOf(r, "1.4cm"), "grounded");
  const redundant = redundantBaselineEntries(map, r.groundedKeys);
  assert.equal(redundant.length, 1);
  assert.equal(redundant[0].claim, "1.4cm");
  // Advisory only: not stale, and the run still passes.
  const stale = staleBaselineEntries(map, r.presentKeys);
  assert.deepEqual(stale, []);
  assert.equal(summarise([r], stale, []).ok, true);
});

test("a baseline entry with an empty reason is an error, not an accepted exception", () => {
  const { map, errors } = indexBaseline({
    entries: [{ file: FILE, claim: "99.7%", reason: "   " }],
  });
  assert.equal(map.size, 0);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /reason/);
  const r = classifyCaseStudy({ file: FILE, body: BODY, source: SOURCE, baseline: map });
  assert.equal(statusOf(r, "99.7%"), "ungrounded");
  assert.equal(summarise([r], [], errors).ok, false);
});

test("a baseline entry still carrying the TODO placeholder is an error", () => {
  const { map, errors } = indexBaseline({
    entries: [{ file: FILE, claim: "99.7%", reason: "TODO: state where this number actually comes from" }],
  });
  assert.equal(map.size, 0);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /TODO/);
});

test("duplicate baseline entries are rejected", () => {
  const { errors } = indexBaseline({
    entries: [
      { file: FILE, claim: "99.7%", reason: "one" },
      { file: FILE, claim: "99.7%", reason: "two" },
    ],
  });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /duplicate/);
});

test("a case study with no source link is unverifiable, by name, and does not fail the run", () => {
  const r = classifyCaseStudy({
    file: "content/projects/Private.mdx",
    body: BODY,
    source: null,
    unverifiableReason: "no `link` in frontmatter — the source repository is private",
    baseline: emptyBaseline(),
  });
  assert.equal(r.counts.unverifiable, 2);
  assert.equal(r.counts.ungrounded, 0);
  assert.match(r.unverifiableReason, /private/);
  assert.equal(summarise([r], [], []).ok, true);
});

test("the suite verdict is ok only when nothing is ungrounded, stale or malformed", () => {
  const good = classifyCaseStudy({
    file: FILE,
    body: "Median error 1.4 cm.",
    source: SOURCE,
    baseline: emptyBaseline(),
  });
  assert.equal(summarise([good], [], []).ok, true);
  assert.equal(summarise([good], [{ file: FILE, claim: "x", reason: "y" }], []).ok, false);
  assert.equal(summarise([good], [], ["malformed"]).ok, false);
});

test("failures name the file, the claim and the source", () => {
  const r = classifyCaseStudy({
    file: FILE,
    body: BODY,
    source: SOURCE,
    sourceRef: "example/fixture#README",
    baseline: emptyBaseline(),
  });
  const { failures } = summarise([r], [], []);
  assert.equal(failures.length, 1);
  assert.equal(failures[0].file, FILE);
  assert.equal(failures[0].value, "99.7 %");
  assert.match(failures[0].reason, /example\/fixture#README/);
  assert.ok(failures[0].phrase.includes("accuracy"));
});
