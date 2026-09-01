# Effort 025 — README polish: keep the evidence, fix a real staleness, add the hook

| Field | Value |
|-------|-------|
| Ref | 025-professional-readme |
| Status | complete |
| Depth | minimal |
| Opened | 2026-08-31 |
| Closed | 2026-08-31 |
| Baseline | effort 024 (`main`) |
| ADRs | none |
| Commits | branch `docs/professional-readme` |
| Reconstructed | no — recorded live |

## Intent

Issue #26 ("Use document bot skill"): make the README and docs read as professional, not
informal. A PR (#29) had already attempted this by deleting the concrete evidence throughout
(real commit hashes, the actual `lets see`/`hmmm` messages, exact line counts) and replacing it
with vague paraphrase, while also deleting the "Run locally" section and asserting the site has a
"3D/glassmorphism design aesthetic" it does not have. The owner flagged it as low quality, not
attention-grabbing, and missing local-dev instructions — all correct. Closed PR #29 without
merging (see its close comment for the full diff-by-diff reasoning) and redid the work here.

## Stages

| Stage | Outcome |
|-------|---------|
| Diagnosis | Diffed PR #29 against `main` file by file. Every file showed the same failure mode: deleting specifics for generic corporate phrasing. The README half additionally deleted "Run locally" and the project-layout table, and introduced a false visual-identity claim. |
| Fix | Kept the existing README's evidence and structure entirely — it already had a working "Run locally" section and an honest, specific worked-example pitch. Added: three CI badges (deploy, aidlc-check, evals) and a licence badge; a one-paragraph hook up top naming the four PR gates by what they actually catch, cross-linked to `/process`; corrected "18" projects to the real count, 20; expanded "Build & deploy" to list all four gate commands (it previously named only `typecheck`/`build`/`test:unit`, and `test:unit`'s comment was already stale after effort 024's merge fixed its scope to `evals scripts`). |
| Verify | `npm run typecheck` clean; `npm run build` succeeds; badge URLs point at workflow files confirmed present. |

## Units of work

- [x] `README.md` — badges, hook paragraph naming the four gates, "18" → "20" projects, `Build & deploy` command list corrected and completed
- [x] Closed PR #29 with a itemised explanation (not part of this diff — a GitHub action)

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run build` | succeeds, 30 static pages |
| Project count in README vs `content/projects/*.mdx` | 20 = 20 |
| "Run locally" section | present (was already correct; PR #29 would have deleted it) |
| Badge targets | `.github/workflows/{deploy,aidlc-check,evals}.yml` all exist |

## Notes

No evidence was removed from `README.md`, `aidlc-docs/audit.md`, `aidlc-docs/registry.md`,
`docs/adr/0008-*.md`, or `docs/explanation/ai-dlc-in-this-repo.md` — those four non-README files in
PR #29 are left untouched by this effort, since the diagnosis found nothing wrong with their
*pre-PR-29* content; the problem was specifically PR #29's edits to them, which are simply not
merged.
