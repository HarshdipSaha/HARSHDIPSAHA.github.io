# Effort 031 — Site improvement ideation document

| Field | Value |
|-------|-------|
| Ref | 031-improvement-ideation |
| Status | complete |
| Depth | minimal |
| Opened | 2026-09-01 |
| Closed | 2026-09-01 |
| Baseline | effort 030 (`main`) |
| ADRs | none |
| Commits | branch `docs/improvement-ideas` |
| Reconstructed | no — recorded live |

## Intent

Owner ran the brainstorming skill to ideate on making the site better, starting from one concrete
observation: the /story tools lost their official brand icons in the rebuild (the pre-rebuild
/about page, commit `7eba8fd`, showed them via the Once-UI icon set). Deliverable: a markdown
ideas document with implementation steps for each, not code.

## Stages

| Stage | Outcome |
|-------|---------|
| Explore | Verified the old icon usage in `7eba8fd`, the current 17-tool `story.skills` list, `simple-icons@16.29.0` availability (and its trademark-removed gaps: MATLAB, likely AWS; MONAI/SQL never had marks), and the standing backlog (mobile perf 0.82, orphaned `content/writing/`, hardcoded /process counts, `Photograph N` alt text). |
| Write | `docs/plans/2026-09-01-site-improvement-ideas.md`: 10 ideas ordered by impact-per-effort, each with what/why/how/cost/risk; a considered-and-rejected list; a table of owner inputs that block specific ideas; a suggested order. |

## Units of work

- [x] `docs/plans/2026-09-01-site-improvement-ideas.md` — new

## Verification

| Check | Result |
|---|---|
| Old icons claim | verified against `git show 7eba8fd:src/app/about/page.tsx` |
| simple-icons version/gaps | `npm view` 16.29.0; slug availability flagged as verify-at-implement |
| No code touched | docs-only diff |
