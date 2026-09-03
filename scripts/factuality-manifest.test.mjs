import assert from "node:assert/strict";
import test from "node:test";
import { diffFactualityManifest } from "./lib/factuality-manifest.mjs";

/**
 * Pure diff, no filesystem: committed manifest in, fresh run in, mismatches
 * out. Effort 036.
 */

test("in-sync manifests produce no mismatches", () => {
  const committed = { atomnet: { grounded: 1, baselined: 1, unverifiable: 0 } };
  const fresh = { atomnet: { grounded: 1, baselined: 1, unverifiable: 0 } };
  assert.deepEqual(diffFactualityManifest(committed, fresh), []);
});

test("a real count drift is reported", () => {
  const committed = { atomnet: { grounded: 1, baselined: 1, unverifiable: 0 } };
  const fresh = { atomnet: { grounded: 2, baselined: 1, unverifiable: 0 } };
  const mismatches = diffFactualityManifest(committed, fresh);
  assert.equal(mismatches.length, 1);
  assert.match(mismatches[0], /atomnet/);
  assert.match(mismatches[0], /grounded: 1/);
  assert.match(mismatches[0], /grounded: 2/);
});

test("a slug unverifiable in the fresh run only is excluded, even with different counts committed", () => {
  // The pySdf case: grounded+baselined locally (owner's gh token), fully
  // unverifiable in CI (workflow token, 404). Must not flap the gate.
  const committed = { pysdf: { grounded: 2, baselined: 1, unverifiable: 0 } };
  const fresh = { pysdf: { grounded: 0, baselined: 0, unverifiable: 3 } };
  assert.deepEqual(diffFactualityManifest(committed, fresh), []);
});

test("a slug unverifiable in the committed manifest only is also excluded", () => {
  const committed = { pysdf: { grounded: 0, baselined: 0, unverifiable: 3 } };
  const fresh = { pysdf: { grounded: 2, baselined: 1, unverifiable: 0 } };
  assert.deepEqual(diffFactualityManifest(committed, fresh), []);
});

test("a slug unverifiable on both sides is excluded even when the counts differ", () => {
  // e.g. a private-source project whose claim count changed between the two
  // runs' content — still not a factuality regression on its own.
  const committed = { saakshi: { grounded: 0, baselined: 0, unverifiable: 18 } };
  const fresh = { saakshi: { grounded: 0, baselined: 0, unverifiable: 19 } };
  assert.deepEqual(diffFactualityManifest(committed, fresh), []);
});

test("a slug missing from the committed manifest is reported, unless it's unverifiable fresh", () => {
  const fresh = { newproject: { grounded: 3, baselined: 0, unverifiable: 0 } };
  const mismatches = diffFactualityManifest({}, fresh);
  assert.equal(mismatches.length, 1);
  assert.match(mismatches[0], /newproject/);
  assert.match(mismatches[0], /missing from the committed manifest/);

  const freshUnverifiable = { newproject: { grounded: 0, baselined: 0, unverifiable: 5 } };
  assert.deepEqual(diffFactualityManifest({}, freshUnverifiable), []);
});

test("a slug missing from the fresh run is reported, unless it's unverifiable in the committed copy", () => {
  const committed = { oldproject: { grounded: 3, baselined: 0, unverifiable: 0 } };
  const mismatches = diffFactualityManifest(committed, {});
  assert.equal(mismatches.length, 1);
  assert.match(mismatches[0], /oldproject/);
  assert.match(mismatches[0], /missing from the fresh run/);

  const committedUnverifiable = { oldproject: { grounded: 0, baselined: 0, unverifiable: 5 } };
  assert.deepEqual(diffFactualityManifest(committedUnverifiable, {}), []);
});

test("multiple slugs report multiple mismatches, sorted", () => {
  const committed = {
    zeta: { grounded: 1, baselined: 0, unverifiable: 0 },
    alpha: { grounded: 1, baselined: 0, unverifiable: 0 },
  };
  const fresh = {
    zeta: { grounded: 2, baselined: 0, unverifiable: 0 },
    alpha: { grounded: 2, baselined: 0, unverifiable: 0 },
  };
  const mismatches = diffFactualityManifest(committed, fresh);
  assert.equal(mismatches.length, 2);
  assert.match(mismatches[0], /^alpha:/);
  assert.match(mismatches[1], /^zeta:/);
});

test("empty manifests on both sides are in sync", () => {
  assert.deepEqual(diffFactualityManifest({}, {}), []);
});
