# Evals

## What these are for

This directory holds two different things. Read the distinction before adding to either.

## 1. `factuality/` — an executable gate (spec #12)

A regression gate over the **project case studies**. It extracts every quantitative claim from each
`content/projects/*.mdx`, fetches that project's source repository README through the GitHub API, and
fails when a claim is not traceable to that source.

```bash
npm run test:unit          # node --test evals — the pure core, no network, milliseconds
npm run eval:factuality    # the real thing: fetches READMEs, prints a report, sets an exit code
```

| File | What it is |
| --- | --- |
| `factuality/claims.mjs` | Pure core: `extractClaims(body)`, `isGrounded(claim, source)`, `normalise`, `stripMarkdown`. Imports nothing. |
| `factuality/verdict.mjs` | Pure classification: grounded / baselined / ungrounded / unverifiable, plus the stale-baseline rule. |
| `factuality/sources.mjs` | The only network code: GitHub README fetch, token resolution, retry with backoff. |
| `factuality/judge.mjs` | Optional LLM tier. Advisory, skipped when no API key is set. |
| `factuality/run.mjs` | The CLI behind `npm run eval:factuality`. |
| `factuality/baseline.json` | Committed record of accepted ungrounded claims, each with a written reason. |
| `factuality/fixtures/` | The synthetic case study and source the unit tests run against. |
| `factuality/*.test.mjs` | `node --test` suites. No network, no GitHub. |

**Exit codes are the contract.** `0` every claim grounded, baselined or unverifiable · `1` a
factuality failure (ungrounded claim, stale baseline entry, malformed baseline entry) · `2` network
exhaustion — deliberately distinct, so a red check is never ambiguous between "the network broke" and
"you published a false claim" · `3` the harness itself is broken.

**Four verdicts.**

- **grounded** — the claim's normalised numeric core appears in the source README.
- **baselined** — ungrounded, but recorded in `baseline.json` with a reason naming its real source
  (a résumé line, an effort record, a figure from a paper). The gate fails on any ungrounded claim
  *absent* from the baseline, which is what makes this a regression gate rather than a purity gate.
- **ungrounded** — not in the source and not baselined. This fails the run.
- **unverifiable** — no source to check against. Two case studies (BrainwavesFinland, SAAKSHI) have no
  `link` because their repositories are private. A `link` that returns 404 — repository gone, renamed,
  or not readable with the available token — lands here too, with the reason printed. In CI,
  `pySdf`'s source (`ComPhysGroup/PyAMorph`) is one: the workflow's `GITHUB_TOKEN` can only read this
  repository, so that file's claims are `unverifiable` in CI and `grounded`/`baselined` locally.
  Reported by name either way, never skipped silently.

**Adding a baseline entry.** Run `node evals/factuality/run.mjs --write-baseline` to regenerate the
skeleton, then write the reason by hand. The `TODO` placeholder the skeleton leaves behind fails the
gate — an unexplained baseline entry is a mute button, and the baseline must not become one. An entry
whose claim no longer appears in any case study fails the gate as **stale**, so the baseline cannot
silently rot.

**Scope.** Case-study content only, and digit-bearing claims only. Prose assertions without numbers
are out of scope for the deterministic tier — a regex cannot judge them, and pretending otherwise
would produce false confidence. That is what the optional judge tier is for, and its verdicts are
advisory: they never change the exit code.

CI: `.github/workflows/evals.yml` runs both scripts on pull requests to `main`, filtered to diffs
that touch `content/projects/**` or `evals/**`, and uploads the JSON report as an artifact.

## 2. `repo-conventions.eval.md` — markdown-defined checks, no runner

Assertions that the repo's own conventions hold: images are built not hand-copied, copy lives in
`src/content/site.ts` or project MDX, every route is a page plus a `nav` entry, every animated
component honours reduced motion. Assertions decay; these checks catch the decay.

**There is no runner for these.** They are a table of assertions, each with a shell one-liner or a
manual procedure. Open [repo-conventions.eval.md](repo-conventions.eval.md) and work down the table
from the repo root, before closing an AI-DLC effort that touched content, images, routes, motion
components or the build script. The one exception is process integrity, partly enforced by
`aidlc-check` in CI (`scripts/check-aidlc-sync.mjs`). Turning a row into a script with an exit code is
the prerequisite for CI-ing it — `Automatable` in the check table marks which rows are ready.

### Check categories (`repo-conventions.eval.md`)

| Category | What it covers |
| --- | --- |
| Build integrity | Type-check passes, `npm run build` succeeds, `out/` produced |
| Content contract | Required frontmatter fields present in every project MDX; every `images[0]` resolves to a manifest key |
| Asset pipeline | Drop-zone files reach `public/img/`; manifest counts match the drop-zones; `PROJECT_MAP` entries have sources |
| Routing | Every `nav` href has a page; every top-level page is in `nav`; no dead internal references from `site.ts` |
| Motion | Every component importing `motion/react` handles `useReducedMotion`; no scroll-driven range outside `[0, 1]` |
| Secrets hygiene | No committed credentials; `.env.example` only |
| Process integrity | Every effort folder is well-formed; the registry matches the filesystem; `aidlc-check` passes |
