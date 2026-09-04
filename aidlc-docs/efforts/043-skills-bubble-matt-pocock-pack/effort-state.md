# Effort 043 — Skills table + bubble: add the Matt Pocock pack and llm-council/writing-plans

| Field | Value |
|-------|-------|
| Ref | 043-skills-bubble-matt-pocock-pack |
| Status | complete |
| Depth | minimal |
| Opened | 2026-09-05 |
| Closed | 2026-09-05 |
| Baseline | effort 027 (`main`) — the skills-bubble feature this effort extends |
| ADRs | none |
| Commits | branch `docs/engineering-skills-table` (PR #58) |
| Reconstructed | no — recorded live |

## Intent

Owner request (chat): add `ask-matt`, `to-spec`/`to-tickets`, `llm-council`, `writing-plans`, and
`impeccable` to `CLAUDE.md`'s "Skills worth reaching for" table, and add `to-tickets`, `ask-matt`,
`llm-council`, and `writing-plans` to the `/process` skills bubble cluster (`process.skills` in
`src/content/site.ts`).

**This is an explicit, acknowledged exception to effort 027's evidence rule**, not a correction of
its methodology. Effort 027 deliberately excluded `to-tickets` and `ask-matt` from the bubble list
for having zero citations anywhere in the repo, per the owner's own repeated instruction on issue
#27 not to let the list "quietly become a marketing list." Re-checked on this effort's date —
`grep -rn` across `aidlc-docs/`, `docs/`, and `.scratch/` still finds zero occurrences of
`to-tickets`, `ask-matt`, `llm-council`, or `writing-plans` being cited as actually used to build
this site; only effort 027's own record, which excluded them, mentions the names at all.

Surfaced this tension to the owner directly before editing (effort 027's exclusion, quoted) and
offered three options: add anyway overriding the rule, add with the exception noted here, or add
only names with real evidence. The owner chose **add anyway, override the rule this once** — direct,
informed instruction is the evidence for this effort's record, in place of the usual per-name
citation trail.

`to-spec` was already in both lists (added by effort 027, with real evidence). `impeccable` was
already in the bubble list (effort 027) but not yet in `CLAUDE.md`'s table; added there for
consistency. `llm-council` and `writing-plans` were never part of the original issue #27 seed list —
new additions, same override rationale.

## Stages

| Stage | Outcome |
|-------|---------|
| Grounding | Re-ran effort 027's evidence check; result unchanged (zero new citations). Presented the conflict to the owner via `AskUserQuestion`; owner chose to override. |
| Build | `CLAUDE.md`'s skills table: +5 rows (`ask-matt`, `to-spec`+`to-tickets`, `llm-council`, `writing-plans`, `impeccable`). `process.skills` in `src/content/site.ts`: +4 entries (`to-tickets`, `ask-matt`, `llm-council`, `writing-plans`), bringing the bubble count from 11 to 15. `tests/skills-bubbles.spec.ts`'s duplicated `EXPECTED_SKILLS` array kept in sync per its own header comment ("the test should fail loudly if the two drift"). |
| Verify | See table below. |

## Units of work

- [x] `CLAUDE.md` — 5 new rows in "Skills worth reaching for" (commit `80f3865`)
- [x] `src/content/site.ts` — `process.skills` +4 entries
- [x] `tests/skills-bubbles.spec.ts` — `EXPECTED_SKILLS` +4 entries

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run build` | succeeds — 30 static pages; `process-stats` regenerated to 42 efforts (001–043), 17 ADRs |
| `npm run check:aidlc` | `aidlc-check: OK — substantive changes are accompanied by an aidlc-docs update.` |
| `npx playwright test tests/skills-bubbles.spec.ts` | 8/8 passed (desktop + mobile): all 15 names present as DOM text, click nudge, drag displacement, reduced-motion static fallback with zero console errors |
| `npm run lighthouse:desktop` | 18/18 runs (6 routes × 3) passed every assertion; `/process` scored accessibility **1.0** and performance **1.0** on all 3 runs — the target-size fix effort 030 made at 11 bubbles holds at the new 15-bubble density, no regression |

## Notes

- The bubble cluster's container (`src/components/process/SkillsBubbles.tsx`) was tuned in effort 030
  (38% radius spread, 28rem/30rem height) specifically to clear Lighthouse's target-size audit at 11
  names. Going to 15 re-tightens spacing at the same container size — re-verified in this effort
  rather than assumed safe; see Verification.
- No skill *content* added anywhere — names only, matching every prior effort's constraint on this
  component.
