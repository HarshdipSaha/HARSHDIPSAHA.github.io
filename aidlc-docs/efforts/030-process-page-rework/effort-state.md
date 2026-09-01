# Effort 030 — /process page rework: skills up, gate pipeline, what's different

| Field | Value |
|-------|-------|
| Ref | 030-process-page-rework |
| Status | complete |
| Depth | standard |
| Opened | 2026-09-01 |
| Closed | 2026-09-01 |
| Baseline | effort 029 (`main`) |
| ADRs | none |
| Commits | branch `feat/process-rework` |
| Reconstructed | no — recorded live |

## Intent

Owner feedback: the skills bubble sits at the bottom of /process where nobody notices it, the CI
gates are explained in too many words, and the page doesn't surface what's genuinely different
about this site. Brainstorming skill used first; copydesk installed and a voice register
bootstrapped from the owner's own session messages for prose voice-matching.

## Stages

| Stage | Outcome |
|-------|---------|
| Brainstorming | Ran the brainstorming skill; two questions (placement, diagram style) answered via the structured question tool. Skills → after stats, before flow. Gates → horizontal pipeline with tangerine nodes. |
| Implementation | New section order: title → stats → skills → gate pipeline → flow → decisions → what's different → why → CTAs. New `GatePipeline` component (pure CSS, no Motion/canvas, responsive horizontal→vertical). New `facts` data in site.ts for the "what's different" section. Headline shortened. Verify step body shortened to one sentence referencing the pipeline above. Counts updated to 29/15. |
| Verify | `npm run typecheck` clean; `npm run build` succeeds (30 pages); both new sections present in `out/process.html`. |

## Units of work

- [x] `src/components/process/GatePipeline.tsx` — new: horizontal pipeline on desktop, vertical on mobile, tangerine nodes, linked labels
- [x] `src/content/site.ts` — `process.gates[]`, `process.facts[]`, `process.gatesLabel`, `process.factsLabel` added; headline shortened; Verify step body shortened; stats updated to 29/15
- [x] `src/app/process/page.tsx` — new section order (skills moved to position 3, gate pipeline at 4, what's different at 7); pill counts updated to 15/29

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run build` | succeeds, 30 static pages |
| Skills bubble position | after stats, before flow (verified in page source) |
| Gate pipeline renders | "What a PR has to pass" section present in output |
| "What's different" renders | 5 fact items present in output |
| Pill counts | "All 15 decisions", "All 29 change records" |
