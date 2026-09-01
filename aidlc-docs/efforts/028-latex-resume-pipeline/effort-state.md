# Effort 028 — LaTeX résumé pipeline: generated renderer, CI compilation, review-only automation

| Field | Value |
|-------|-------|
| Ref | 028-latex-resume-pipeline |
| Status | complete |
| Depth | standard |
| Opened | 2026-09-01 |
| Closed | 2026-09-01 |
| Baseline | `main` at the branch point of `feat/latex-resume-pipeline-v2` |
| ADRs | 0016 — the résumé as a generated artefact: LaTeX source, split content boundary, review-only automation |
| Commits | branch `feat/latex-resume-pipeline-v2` |
| Reconstructed | no — recorded live |
| Closes | spec #24; tickets #32, #33, #34 |

## Intent

Spec #24: `resume.pdf` was a manually maintained PDF (effort 022) with no relationship to
`src/content/site.ts`, which already holds the same `experience`/`education` facts as typed data
every other page reads. This effort gives the résumé the same treatment the site's other artefacts
already have (drop-zone images, ADR 0005; `llms.txt`, ADR 0014): one source of truth
(`resume/resume.tex`), a build step (`scripts/build-resume.mjs`), CI compilation and verification
(`resume-ci.yml`), and a review-only automation that regenerates it when the underlying data changes
(`resume-auto-refresh.yml`). Full decisions and rationale are in ADR 0016; this record is the
stage-by-stage account and the verification evidence.

The issue's suggested effort number was 027. The registry's actual next-free number moved twice while
this effort was in flight: it was **026** when construction started (025 — "README polish" — had
already landed), but by the time this branch rebased onto `main` to open its PR, two more efforts had
landed concurrently on other branches — 026 (AI-crawler access policy, ADR 0015, PR #31) and 027
(skills bubble cluster on `/process`, PR #36) — making **028** the actual next-free number. This
effort was renumbered from 026 to 028 during the rebase, and its ADR from 0015 to 0016 (0015 was
likewise taken by the AI-crawler-access-policy effort), rather than fighting a number that had already
shipped. 028 and ADR 0016 are used throughout this record.

## Stages

| Stage | Outcome |
|-------|---------|
| Read tickets #24/#32/#33/#34, `AGENTS.md`, `CONTEXT.md`, `jake.tex` (canonical) and the NSUT/TnP variant | Established the scope boundary: `site.ts`'s `person`/`experience`/`story.education` map to the résumé's Header/Education/Experience only; Projects/Technical Skills/Key Achievements stay hand-maintained (see ADR 0016, decision 2) |
| Ticket #32 | `scripts/lib/resume-tex.mjs` (pure renderer: `escapeLatex`, `renderHeaderFragment`, `renderEducationFragment`, `renderExperienceFragment`, `spliceSection`, `renderResumeTex`) + `scripts/resume-tex.test.mjs` (26 `node --test` cases) + `resume/resume.tex` seeded from `jake.tex` with three `% AUTO-GENERATED:*` marker regions + `scripts/build-resume.mjs` (I/O + local compile) |
| Compile debugging | First local `npm run resume:build` failed with a fatal LaTeX error reproducible on the **unmodified** `jake.tex` too — a real mismatched-nesting bug in the supplied template's Projects section (an extra `\resumeSubHeadingListEnd`/`\resumeItemListEnd` pair before "Accurate Precise Timely"). Fixed in `resume/resume.tex` (not a MiKTeX quirk — confirmed by reproducing on the pristine template first) |
| Ticket #33 | `scripts/verify-resume-pdf.mjs` (`pdf-parse`, imported via its `lib/pdf-parse.js` submodule to avoid the package root's debug-mode self-test bug under ESM dynamic import) + `.github/workflows/resume-ci.yml` (`xu-cheng/latex-action`) + `AGENTS.md`/`CONTEXT.md`/`README.md`/`docs/reference/build-scripts.md` sync |
| Reproducibility bug found and fixed | Discovered pdfTeX stamps a fresh `/CreationDate` into every compile, so byte-comparing two compiles of *identical* `.tex` always reports "differ" — which would break ticket #34's "only PR when the PDF actually changed" gate. Fixed with `SOURCE_DATE_EPOCH=0`, verified by compiling twice and diffing |
| Ticket #34 | `.github/workflows/resume-auto-refresh.yml` (push-to-`main` trigger on `src/content/site.ts`, byte-diff gate, `peter-evans/create-pull-request`) + `scripts/resume-auto-effort.mjs` (drafts the opened PR's own effort-record skeleton, a registry row, an audit row) |
| Docs, ADR, AI-DLC | ADR 0016; this effort record; registry + audit; `AGENTS.md` "Images are built" section gains the résumé as a second instance |

## Units of work

- [x] `scripts/lib/resume-tex.mjs` — pure renderer, no I/O (asserted by a dedicated unit test).
- [x] `scripts/resume-tex.test.mjs` — 26 `node --test` cases: every LaTeX special character escaped
      individually and in a combined fixture, header/education/experience content presence, splice
      idempotency, splice touching only the changed region, missing-marker error handling.
- [x] `resume/resume.tex` — Jake's Resume template, seeded verbatim from `H:\mywebsite\latex\jake.tex`
      for Projects/Technical Skills/Key Achievements; Header/Education/Experience under
      `% AUTO-GENERATED:*` markers; the Projects-section nesting bug (see Stages) fixed.
- [x] `scripts/build-resume.mjs` — loads `site.ts` (in-memory transpile, same technique as
      `build-llms-txt.mjs`), splices the three fragments, writes `resume/resume.tex`, compiles via
      `latexmk`/`pdflatex` if present (else prints a clear message, doesn't hard-fail), copies the
      result to `public/resume.pdf`. `SOURCE_DATE_EPOCH=0` on the compile subprocess.
- [x] `scripts/verify-resume-pdf.mjs` — extracts a compiled PDF's text (`pdf-parse`) and asserts it
      contains the person's name, every experience company/role, every education institution name,
      and the GPA figure from `site.ts`.
- [x] `.github/workflows/resume-ci.yml` — on PR touching résumé-relevant paths: renderer unit tests,
      regenerate-and-diff-check (fails if `resume/resume.tex` is out of sync with `site.ts`), compile
      via `xu-cheng/latex-action`, PDF text verification, upload the PDF as an artifact.
- [x] `.github/workflows/resume-auto-refresh.yml` — on push to `main` touching `src/content/site.ts`
      (or manual dispatch): regenerate, compile, verify, byte-diff against the committed PDF, and only
      then open a PR via `peter-evans/create-pull-request` carrying an auto-drafted effort record.
      `permissions: contents: write, pull-requests: write` — quoted and explained in the PR body; no
      merge step anywhere in the file.
- [x] `scripts/resume-auto-effort.mjs` — drafts `aidlc-docs/efforts/NNN-resume-auto-refresh-*/`
      (`effort-state.md` + `requirements-delta.md`), a `registry.md` row, and an `audit.md` row, so
      `aidlc-check` passes on the PR the automation opens.
- [x] `scripts/check-aidlc-sync.mjs` — dropped the stale `/^resume\.pdf$/` exemption (that drop-zone
      is retired) and added `/^resume\//` to the substantive-path list, so a hand-edit to
      `resume/resume.tex`'s hand-maintained sections still requires an effort record.
- [x] `.gitignore` — LaTeX build byproducts (`resume/*.aux|.log|.out|.fls|.fdb_latexmk|.synctex.gz`).
      `public/resume.pdf` itself is **not** gitignored — see ADR 0016, decision 6.
- [x] Root `resume.pdf` deleted — the drop-zone it fed is retired.
- [x] `AGENTS.md`, `CONTEXT.md`, `README.md`, `docs/reference/build-scripts.md` synced. `AGENTS.md`
      also had a long-standing unresolved git merge-conflict marker in its "Definition of done"
      section at the branch point (visible with `grep -n '<<<<<<<' AGENTS.md`, 304de89); resolved
      locally on this branch as part of editing that section, then found already independently fixed
      on `main` by PR #35 when this branch rebased — both resolutions kept the same complementary
      bullets, so the rebase merged cleanly with no further edit needed there.
- [x] `docs/adr/0015-resume-as-generated-artefact.md` + a row in `docs/adr/README.md`.
- [ ] NSUT/TnP secondary résumé (`resume-nsut.pdf`) — **deferred**, see Notes.

## Verification

### Commands (real output, this session)

| Check | Result |
|---|---|
| `npm run typecheck` | clean (no output) |
| `npm run build` | succeeds — see PR body for the full pasted output |
| `npm run test:unit` | 58 pass, 0 fail (includes the pre-existing `llms-txt` suite + 26 new `resume-tex` cases) |
| `npm run resume:build` | regenerates `resume/resume.tex`, compiles `public/resume.pdf` via `latexmk` (this sandbox has MiKTeX installed) |
| `npm run resume:verify` | `resume: verifying public/resume.pdf (2 pages, 7308 chars extracted) ... found all 10 expected strings` |
| `npm run check:aidlc` | OK (see PR body) |

### The escaping scratch test (ticket #33's proof requirement)

Temporarily set the `&` entry in `escapeLatex`'s map to the identity (`"&": "&"`) and temporarily
added `& Research` to the Optum experience entry's company name in `site.ts`, then ran
`npm run resume:build`:

```
Runaway argument?
Optum (UnitedHealth Group) \unskip \relax \d@llarend \do@row@strut \hfil \ETC.
! Forbidden control sequence found while scanning use of \check@nocorr@.
...
!  ==> Fatal error occurred, no output PDF file produced!
```

A raw `&` inside this template's `tabular*`-based `\resumeSubheading` is not silent corruption — it is
a hard LaTeX compile failure, an even stronger guarantee than the PDF-text check catching it after the
fact. Both changes were reverted (`git checkout -- src/content/site.ts` and restoring the escape map),
and `npm run resume:build` + `npm run resume:verify` were re-run to confirm a clean pass — see the
"reverted OK: matches baseline" line in the session transcript.

### The `SOURCE_DATE_EPOCH` reproducibility bug (found during ticket #34's implementation)

First discovery: compiling `resume/resume.tex` twice in a row, with **no data change at all**,
produced a different `public/resume.pdf` each time (`differ: char 154137, line 1492` from `cmp`).
Root cause: pdfTeX stamps `/CreationDate`/`/ModDate`/`/ID` on every compile. This would have broken
ticket #34's core gate — "only open a PR when the compiled PDF actually differs" — by making it fire
on every push regardless of content. Fixed by setting `SOURCE_DATE_EPOCH=0` on the compile subprocess
(`scripts/build-resume.mjs`) and the CI compile step (`resume-ci.yml`, `resume-auto-refresh.yml`);
confirmed with `cmp` that two compiles of unchanged input are now byte-identical.

### Both branches of the ticket #34 trigger (real local trial, `cmp` output)

**Trial A — a real career-fact change (edited the Optum role title in `site.ts`):**

```
committed-resume-baseline.pdf public/resume.pdf differ: char 1029, line 44
TRIAL A RESULT: differs -> PR WOULD OPEN (expected)
```

**Trial B — an unrelated `site.ts` change (edited `hero.left`, not `person`/`experience`/`education`):**

```
TRIAL B RESULT: byte-identical -> NO PR (expected)
```

Both changes to `site.ts` were reverted after their trial (`git checkout -- src/content/site.ts`);
`public/resume.pdf` was rebuilt from the reverted, real data before committing. This is a **local**
simulation of the workflow's own gate logic (build → compile → `cmp`), not a real GitHub Actions run —
the real run is what `gh pr checks` on the opened PR will show, watched after push per the task
instructions. A genuine end-to-end trigger (pushing a real `site.ts` change to `main` and watching
`resume-auto-refresh.yml` fire) cannot happen before this PR merges, since the workflow only exists on
this branch.

## Notes

- **The seeded `jake.tex` template had a real pre-existing bug**, unrelated to this effort's own code:
  a mismatched `\resumeSubHeadingListEnd`/`\resumeItemListEnd` pair in the Projects section prevented
  even the pristine, unmodified template from compiling. Confirmed by compiling the original
  `H:\mywebsite\latex\jake.tex` standalone before touching anything in this repo — it produced the
  identical fatal error. Fixed in `resume/resume.tex` as part of making ticket #32's acceptance
  criterion ("compiles locally... paste the command and confirm it worked") actually true.
- **The compiled résumé is two pages, not the one-pager the template targets.** The `site.ts`-sourced
  Experience bullets (especially the Optum entry, which `jake.tex` had left as a single thin
  placeholder line — "I will be working on large real healthcare datasets and LLMs.") are
  substantially fuller than what the template's spacing was tuned for. This is disclosed honestly
  rather than trimmed silently to force one page; a follow-up on bullet length or `\vspace` tuning is a
  legitimate next effort. `npm run resume:verify` confirms correctness of content; it does not assert
  page count.
- **The NSUT/TnP secondary résumé (`resume-nsut.pdf`) is deferred, not shipped.** The primary pipeline
  consumed the effort's full budget once the two real bugs above (template nesting, PDF
  non-reproducibility) were found and fixed — both were necessary to make the *primary* deliverable's
  acceptance criteria genuinely true, not optional polish. Shipping a second, half-verified renderer
  output on top of that would have been exactly the "something half-working" the task's own
  instructions said to avoid. Follow-up: unzip `H:\mywebsite\latex\ansusut.zip`, correct its stale GPA
  (8.71 → 8.78) and Optum end date (Jul → Aug 2026) against `site.ts`, fix the `harshdip.pn` →
  `harshdip.png` typo, commit `NSUT_logo.png`/`harshdip.png` as real source images under
  `resume/assets/`, and reuse `scripts/build-resume.mjs`'s compile step for a second `.tex` file. Not
  linked from `site.ts`/nav either way, per the ticket's own instruction.
- **CI compilation itself (ticket #33's acceptance criterion, and the true test of `xu-cheng/latex-action`)
  has not run yet at the time of writing this record** — it runs once this PR is pushed and opened;
  its result is reported in the PR body's verification table, filled in after `gh pr checks --watch`.
