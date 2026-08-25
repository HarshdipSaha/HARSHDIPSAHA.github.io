# Evals

## What these are for

Two things:

1. **The repo's conventions actually hold.** `AGENTS.md` asserts a set of invariants — images are built not hand-copied, copy lives in `src/content/site.ts` or project MDX, every route is a page plus a `nav` entry, `public/img/**` and `src/data/images.json` are generated, every animated component honours reduced motion. Assertions decay. These checks catch the decay.
2. **An agent reading `AGENTS.md` would do the right thing.** The checks are written so that a violation points at the instruction that failed to prevent it. A repeated failure is a bug in the documentation, not just in the commit.

These are not unit tests. There is no application logic to unit-test here — the site is content plus layout plus motion. What is worth testing is whether the *pipeline and the conventions* are intact.

## Honest status: no runner

**There is no test runner wired up.** These are markdown-defined checks: a table of assertions, each with a command or a manual procedure. Nothing executes them automatically, and nothing fails a build if one regresses — with one exception: process integrity is partly enforced by `aidlc-check` in CI (`scripts/check-aidlc-sync.mjs`). Everything else is manual.

## How to run them

Open [repo-conventions.eval.md](repo-conventions.eval.md) and work down the table. Each row has a shell one-liner where one is practical, or `manual` where it is not. Run them from the repo root.

Do this before closing an AI-DLC effort that touched content, images, routes, motion components or the build script.

## How they would slot into CI

Two options, both straightforward when the checks become scripts:

- **A step in `.github/workflows/deploy.yml`**, after `npm install` and before `npm run build`. Fails the deploy on a violation. Strongest, and the most disruptive.
- **A step in `.github/workflows/aidlc-check.yml`**, which already runs on pull requests only, so `main` deploys are never blocked by a convention check. Safer starting point.

Either way the prerequisite is the same: turn each row into a script with an exit code. Until then, `Automatable` in the check table marks which rows are ready for that and which need a human.

## Check categories

| Category | What it covers |
| --- | --- |
| Build integrity | Type-check passes, `npm run build` succeeds, `out/` produced |
| Content contract | Required frontmatter fields present in every project MDX; every `images[0]` resolves to a manifest key |
| Asset pipeline | Drop-zone files reach `public/img/`; manifest counts match the drop-zones; `PROJECT_MAP` entries have sources |
| Routing | Every `nav` href has a page; every top-level page is in `nav`; no dead internal references from `site.ts` |
| Motion | Every component importing `motion/react` handles `useReducedMotion`; no scroll-driven range outside `[0, 1]` |
| Secrets hygiene | No committed credentials; `.env.example` only |
| Process integrity | Every effort folder is well-formed; the registry matches the filesystem; `aidlc-check` passes |
