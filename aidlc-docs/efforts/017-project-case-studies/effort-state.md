# Effort 017 — Project case studies written from their READMEs

| Field | Value |
|-------|-------|
| Ref | 017-project-case-studies |
| Status | complete |
| Depth | minimal |
| Opened | 2026-08-26 |
| Closed | 2026-08-26 |
| Baseline | effort 016 (branch `extremechange`) |
| ADRs | none — content only |
| Commits | branch `extremechange` |
| Reconstructed | no — recorded live |

## Intent

Fifteen of the eighteen project pages were one to three lines while the index promised "a short
write-up of what it does and why". Owner's rule: expand them to the level of the AtoM-Net page, and
**do not make anything up** — if the source doesn't say it, the page doesn't say it.

## Method

Each project's `link` points at a GitHub repository. The README of every repository was fetched
through the GitHub API (`gh api repos/<owner>/<repo>/readme`) and saved under `.ref/readmes/`. Bodies
were rewritten from the README only; frontmatter untouched.

| Group | Files | Treatment |
|---|---|---|
| Already detailed | AtoM-Net, BrandDiffusion, PyAMorph | unchanged |
| Substantive README (2–29 KB) | Agentic Loan Assistant, AI-Enhanced Healthcare, AI-generated text detector, APT, Aquila Optimiser, Missing-person identification, Museum ticketing chatbot, tinySafetyNet, Zombies PGGAN | full case study: overview, what it does, how it's built, results only where the README states numbers |
| One-line README (115–580 B) | alien-invasion-pygame, gui-CANSAT, Object-tracking tennis, Tomato disease detection, youtubeproj-langchain, Anime Recommender | short honest body: what the README states (stack, deploy link, demo video), with an explicit note that details live in the code |

## Verification

- Frontmatter keys unchanged on all 15 files (checked with gray-matter).
- `npm run typecheck` clean; `npm run build` succeeds; `/projects/<slug>` pages render.

## Follow-ups

- The six one-line READMEs can only improve at the source. Adding a paragraph to each repository's
  README would flow through here on the next edit.
