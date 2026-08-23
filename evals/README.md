# Evals

## What these are for

Two things:

1. **The repo's conventions actually hold.** `AGENTS.md` asserts a set of invariants — images are synced not hand-copied, content lives in `content.tsx`, a live route has both a toggle and a nav entry, `public/images/**` is generated. Assertions decay. These checks catch the decay.
2. **An agent reading `AGENTS.md` would do the right thing.** The checks are written so that a violation points at the instruction that failed to prevent it. A repeated failure is a bug in the documentation, not just in the commit.

These are not unit tests. There is no application logic to unit-test here — the site is content plus layout. What is worth testing is whether the *pipeline and the conventions* are intact.

## Honest status: no runner

**There is no test runner wired up.** These are markdown-defined checks: a table of assertions, each with a command or a manual procedure. Nothing executes them automatically, and nothing fails a build if one regresses. That is the current state, stated plainly rather than implied otherwise.

## How to run them

Open [repo-conventions.eval.md](repo-conventions.eval.md) and work down the table. Each row has a shell one-liner where one is practical, or `manual` where it is not. Run them from the repo root.

Do this before closing an AI-DLC effort that touched content, images, routes or the sync scripts.

## How they would slot into CI

Two options, both straightforward when the checks become scripts:

- **A step in `.github/workflows/deploy.yml`**, after `npm install` and before `npm run build`. Fails the deploy on a violation. Strongest, and the most disruptive.
- **A separate workflow** on pull requests only, so `main` deploys are never blocked by a convention check. Safer starting point.

Either way the prerequisite is the same: turn each row into a script with an exit code. Until then, `Automatable` in the check table marks which rows are ready for that and which need a human.

## Check categories

| Category | What it covers |
| --- | --- |
| Build integrity | Type-check passes, `npm run build` succeeds, `out/` produced |
| Content contract | Required frontmatter fields present in every project MDX |
| Asset pipeline | Drop-zone files reach `public/images/`; no hand-placed assets; `gallery.json` matches `gallery/` |
| Routing | Every enabled route has a page and a nav entry; no orphans, no broken links |
| Icon registry | Every icon name referenced in content exists in `src/resources/icons.ts` |
| Secrets hygiene | No committed credentials; `.env.example` only |
| Process integrity | Every effort folder is well-formed; the registry matches the filesystem |
