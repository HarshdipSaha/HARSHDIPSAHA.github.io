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

- [x] `docs/plans/2026-09-01-site-improvement-ideas.md` — new (10 ideas)
- [x] Second pass, owner-requested: ideas 11–14 appended (/story polish set) — interests as pills
  (old `ResearchInterestsBlock` had colored pills, current is one muted joined line), the AIR-14 /
  top-30 / "open to internships" duplication between `story.more[1]` and the achievements list,
  education as a journey timeline (old site's `journey-timeline` idiom), and the publication photo
  — verified recoverable from git (`7eba8fd:public/images/publications/miccai.jpg`, 415,657 bytes).
  Suggested order updated: the five /story items form the first wave as one effort/PR.

## Verification

| Check | Result |
|---|---|
| Old icons claim | verified against `git show 7eba8fd:src/app/about/page.tsx` |
| simple-icons version/gaps | `npm view` 16.29.0; slug availability flagged as verify-at-implement |
| No code touched | docs-only diff |
