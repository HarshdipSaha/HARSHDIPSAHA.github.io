# 0016 — The résumé as a generated artefact: LaTeX source, split content boundary, review-only automation

**Status:** Accepted · **Date:** 2026-09-01 · **Supersedes:** —

## Context

`resume.pdf` — the file `/resume.pdf` links to — was a manually maintained PDF (effort 022): someone
edited it in a separate tool, exported, and dropped the new file into the drop-zone at the repo root,
which `AGENTS.md` then instructed be copied to `public/resume.pdf` and committed. It carried no
relationship to `src/content/site.ts`, which already holds the same `experience` and `education`
facts as typed, version-controlled data that `/story` and `/` render from. Two sources of truth for
the same facts drift by construction — GitHub issue #24 named this directly, and it is the same
problem the drop-zone image pipeline (ADR 0005) and `llms.txt` (ADR 0014) both solved for their own
artefacts: one source of truth, a build step, and a record of what changed and why.

Three tickets (#32, #33, #34) broke the work into a tracer-bullet chain: a template + data-mapping
renderer with tests; CI compilation via an established LaTeX action with PDF text verification; a
change-triggered automation that opens a review-only PR. This ADR records the decisions spanning all
three, made while implementing them as one effort (026) and one PR closing all four tickets.

**The scope question that shaped everything else:** `site.ts`'s `person`, `experience`, and
`education` shapes map faithfully only to the résumé's **Header, Education, and Experience** sections.
The chosen template's **Projects, Technical Skills, and Key Achievements** sections carry
résumé-specific detail — exact metrics, named tools, hackathon placements — with no corresponding
typed field in `site.ts` today. Inventing a new content schema to force-fit that detail was
out of scope: it would be guessing at a shape nobody asked for, for content that already exists and is
accurate.

## Decision

**1. `resume/resume.tex` is the committed source, seeded from Jake's Resume (Jake Gutierrez, MIT
licence) filled with the owner's real current content.** The owner supplied two real résumés
(`jake.tex` — current, ATS-friendly, the canonical one; and an NSUT/TnP campus-placement variant with
two stale facts and a filename typo) and named `jake.tex` canonical. It becomes `resume/resume.tex`
verbatim as the starting point, not reinvented.

**2. Only Header, Education, and Experience are generated; everything else is hand-maintained LaTeX
in the same file, seeded from the existing content.** Three regions in `resume/resume.tex` are marked
`% AUTO-GENERATED:<NAME>-START` / `-END`. `scripts/build-resume.mjs` reads `person`, `experience`, and
`story.education` from `src/content/site.ts` — loaded by transpiling it in memory, the same technique
`scripts/build-llms-txt.mjs` already uses, so there is no second copy of the copy — renders three LaTeX
fragments in the pure module `scripts/lib/resume-tex.mjs`, and splices them between the markers,
leaving everything outside them untouched. A `git diff` on `resume/resume.tex` after a `site.ts` edit
shows exactly what changed and why: the generated regions move, the hand-maintained regions don't.
Projects, Technical Skills, and Key Achievements stay hand-maintained LaTeX, copied forward from
`jake.tex` unchanged — editing them still means editing `resume/resume.tex` directly, same as before
this pipeline existed. This is the one instruction in the tickets deliberately not followed to the
letter: "content is generated" is true for the sections `site.ts` actually types, and false, by
design, for the rest.

**3. `site.ts`'s `story.education` entries (`{ name, detail }`, free text) don't carry the discrete
dates/degree/location fields the template's `\resumeSubheading{}{}{}{}` expects, and neither does
`experience.items` carry a location field.** Rather than inventing new `site.ts` fields to fill those
slots, the renderer leaves them blank (`{}`) and puts the institution/detail or role/company pair in
the two slots that do have data. This is a real information-loss trade-off, not a hidden one: it is
asserted directly in `scripts/resume-tex.test.mjs` and stated here so a later reader doesn't mistake
it for an oversight.

**4. Every LaTeX special character (`& % $ # _ { } ~ ^ \`) is escaped wherever `site.ts` data is
interpolated**, by a single-pass `escapeLatex()` in the pure renderer, asserted against a fixture
containing all eight characters. This is load-bearing, not decorative: an unescaped `&` inside this
template's `tabular*`-based `\resumeSubheading` doesn't degrade gracefully — it throws a fatal
"Runaway argument" LaTeX error, which a scratch test in this effort reproduced and reverted (see the
effort record's Verification section). An unescaped `%` would silently comment out the rest of a
physical line instead — the case `scripts/verify-resume-pdf.mjs`'s PDF-text check exists to catch,
for the narrower set of breakages that compile without erroring.

**5. Compilation uses `xu-cheng/latex-action` in CI, and `pdflatex`/`latexmk` locally if present.**
Same reasoning that picked `@lhci/cli` and `@playwright/test` over hand-rolled equivalents (ADR 0012):
an established, high-adoption action means the pipeline isn't something only one person can debug.
`npm run resume:build` detects the toolchain's absence and prints a clear message rather than an
`ENOENT`; none of the renderer's own tests require a toolchain to run.

**6. The compiled `public/resume.pdf` is committed, not gitignored.** This is the one place this
effort's output does *not* follow `public/img/`'s pattern (generated + gitignored). `deploy.yml`'s
runner installs no LaTeX toolchain and this effort deliberately did not add one — doing so would
slow every deploy for a file that changes rarely. `public/resume.pdf` instead follows `public/brain/`'s
pattern (ADR: committed render output, regenerated by a script or CI, not by hand): CI compiles it in
`resume-ci.yml` and in `resume-auto-refresh.yml`, and the committed file is what `deploy.yml` ships
unchanged. The old root `resume.pdf` drop-zone (copy-and-commit by hand) is retired; `AGENTS.md`
records this as a second instance of "images are built, never hand-copied."

**7. Compilation is made reproducible with `SOURCE_DATE_EPOCH=0`.** Discovered during this effort:
pdfTeX stamps `/CreationDate`, `/ModDate` and `/ID` into every PDF, so two compiles of
byte-identical `.tex` input are never byte-identical output — which would have made ticket #34's
"only open a PR when the compiled PDF actually differs" gate fire on every push, defeating its
purpose. Setting the reproducible-builds environment variable (respected by pdfTeX since TeX Live
2016+) fixes this; verified locally by compiling the same `resume.tex` twice and diffing the output.

**8. The automation (`resume-auto-refresh.yml`) triggers on `push` to `main` touching
`src/content/site.ts` (the whole file, not a narrower path — GitHub Actions path filters operate on
file paths, and `person`/`experience`/`education` are plain exports with no separate file to filter
on), AND only opens a PR when the recompiled PDF is byte-different from the committed one.** Both
conditions are necessary: the path filter alone would fire on any `site.ts` edit, including ones that
touch `hero`/`passage`/`nav` and leave the résumé's generated sections untouched; the byte-diff check
alone would require running on every push regardless of what changed, wasting CI budget. The workflow
drafts its own AI-DLC effort-record skeleton (`scripts/resume-auto-effort.mjs`) so `aidlc-check`
passes on the PR it opens, and its `permissions:` block grants only `contents: write` and
`pull-requests: write` — enough to push a branch and open a PR, nothing that could merge one. No step
in the workflow calls a merge API.

## Consequences

- The résumé's Header, Education, and Experience can no longer silently disagree with `/story` and
  `/` — they are generated from the same `site.ts` export those pages read.
- The Projects, Technical Skills, and Key Achievements sections remain a manual-edit surface, exactly
  as they were before this effort. A reviewer of a future résumé-content PR needs to know this
  boundary to know where to look for a change.
- `public/resume.pdf` is a committed, generated file — an exception to the `public/img/`-style
  "generated implies gitignored" pattern that a future reader needs `resume/` and this ADR to explain,
  not just `AGENTS.md`'s boundaries table.
- The auto-refresh workflow can open a PR the owner didn't ask for, on every push that changes a
  career fact. This is the intended behaviour (ticket #34's whole point), but it means `main`'s commit
  history can carry résumé-refresh PRs the owner has to actively review and merge or close, not just
  ignore.
- The rendered PDF in this effort came out two pages, not the one-pager the template targets — the
  fuller Experience bullet text carried over from `site.ts` (versus the thinner placeholder text the
  original `jake.tex` had for the Optum role) is more content than the template's spacing was tuned
  for. Recorded honestly in the effort record rather than trimmed silently; a follow-up on spacing or
  bullet length is a legitimate next effort, not a blocker on this one.

## Alternatives considered

- **Generate Projects/Technical Skills/Key Achievements from a new `site.ts` schema.** Rejected per
  the tickets' own scope note: `site.ts` has no field for exact metrics or named tools at that
  granularity, and inventing one risks guessing at a shape nobody asked for. Revisit only if the owner
  asks for a typed projects-for-résumé schema explicitly.
- **Regenerate `public/resume.pdf` on every `npm run build` (add it to `prebuild`).** Rejected:
  `deploy.yml`'s runner has no LaTeX toolchain, so this would either fail every deploy or require
  installing TeX Live in that workflow — a much heavier dependency for a file that changes rarely. The
  chosen design keeps `resume.pdf` compiled by dedicated workflows (CI verification, auto-refresh) and
  committed, same shape as `public/brain/**`.
- **Gitignore `public/resume.pdf` and compile it fresh on every deploy.** Same rejection as above,
  plus it would mean the live site's résumé depends on `deploy.yml` never failing a LaTeX compile —
  a much larger blast radius than a manual review gate.
- **A narrower path filter on the trigger workflow** (e.g., a separate JSON file for résumé-relevant
  facts). Rejected: it would mean maintaining two copies of `person`/`experience`/`education` shape
  knowledge (the TypeScript export and the filter config), and the byte-diff check already prevents
  the workflow from doing anything on a `site.ts` edit that doesn't move the résumé.
- **Let the automation workflow merge its own PR when checks pass.** Rejected outright — the tickets
  and the owner's standing rule (every AI-DLC change is human-reviewed) require it; the workflow's
  `permissions:` block was written to make this structurally impossible, not just policy.

## What would reverse this

- `deploy.yml` gaining a LaTeX toolchain (e.g. if `next build` needed to embed résumé data some other
  way) would remove the reason `public/resume.pdf` is committed rather than gitignored.
- `site.ts` gaining typed fields for project-level résumé detail would move the boundary in decision 2
  — more of `resume/resume.tex` could become generated.
- Jake's Resume template being abandoned in favour of a different one is a content change, not an
  architectural one — it would not need a new ADR unless the generated/hand-maintained boundary moved.

## Evidence

- The `\resumeSubheading` "Runaway argument" failure from an unescaped `&`, and its revert, both shown
  in the effort record's Verification section — real compile output, not a description.
- `SOURCE_DATE_EPOCH=0` reproducibility: two compiles of `resume/resume.tex` with unchanged `site.ts`
  data produced byte-identical PDFs; without it they did not, confirmed with the same test.
- Trial of both branches of the ticket #34 gate: a real `experience` edit produced a byte-different
  PDF; an unrelated `site.ts` edit (`hero.left`) produced a byte-identical one. Both shown with real
  `cmp` output in the effort record.
- Effort record: `aidlc-docs/efforts/026-latex-resume-pipeline/effort-state.md`.
