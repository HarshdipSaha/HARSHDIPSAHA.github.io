# Requirements delta — 028-latex-resume-pipeline

## NEW

- `resume/resume.tex` — the résumé's LaTeX source (Jake's Resume template), Header/Education/Experience
  sections marked `% AUTO-GENERATED:*` and generated from `src/content/site.ts`; Projects/Technical
  Skills/Key Achievements hand-maintained.
- `scripts/lib/resume-tex.mjs` — pure data→LaTeX renderer (`escapeLatex`, per-section render
  functions, marker-splicing), unit-tested without a LaTeX toolchain.
- `scripts/build-resume.mjs` — I/O + local compile (`npm run resume:build`).
- `scripts/verify-resume-pdf.mjs` — PDF text verification against `site.ts` facts (`npm run resume:verify`).
- `scripts/resume-auto-effort.mjs` — drafts an AI-DLC effort-record skeleton for an automated PR.
- `.github/workflows/resume-ci.yml` — CI compilation + verification on PRs touching résumé paths.
- `.github/workflows/resume-auto-refresh.yml` — review-only automation triggered by `site.ts` changes.
- `docs/adr/0016-resume-as-generated-artefact.md`.
- `npm run resume:build`, `npm run resume:verify` scripts in `package.json`.
- `pdf-parse` devDependency (PDF text extraction, used only by `verify-resume-pdf.mjs`).

## CHANGED

- `AGENTS.md` — "Images are built, never hand-copied" section gains the résumé as a second instance
  of the generated-artefact convention; CI table gains the two new workflows; setup & commands gains
  the two new scripts; also resolved a pre-existing unresolved git merge-conflict marker in the
  "Definition of done" section (both sides were complementary, not conflicting).
- `CONTEXT.md` — content pipeline diagram and the images paragraph gain the résumé pipeline.
- `README.md` — repo-map table gains `resume/resume.tex` and the new `scripts/` entries.
- `docs/reference/build-scripts.md` — table gains the four new scripts; the "generated paths" note
  updated for `public/resume.pdf`'s new source.
- `scripts/check-aidlc-sync.mjs` — dropped the stale `/^resume\.pdf$/` exemption (drop-zone retired);
  added `/^resume\//` to the substantive-path list.
- `.gitignore` — LaTeX build byproducts under `resume/`.

## REMOVED

- Root `resume.pdf` — the manual drop-zone it fed (copy into `public/resume.pdf` by hand, committed)
  is retired in favour of `resume/resume.tex` as the source and the build pipeline above.
