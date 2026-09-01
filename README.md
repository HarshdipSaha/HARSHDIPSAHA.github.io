# Harshdip Saha — Portfolio

[![Deploy to GitHub Pages](https://github.com/HarshdipSaha/HARSHDIPSAHA.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/HarshdipSaha/HARSHDIPSAHA.github.io/actions/workflows/deploy.yml)
[![AI-DLC sync check](https://github.com/HarshdipSaha/HARSHDIPSAHA.github.io/actions/workflows/aidlc-check.yml/badge.svg)](https://github.com/HarshdipSaha/HARSHDIPSAHA.github.io/actions/workflows/aidlc-check.yml)
[![Evals](https://github.com/HarshdipSaha/HARSHDIPSAHA.github.io/actions/workflows/evals.yml/badge.svg)](https://github.com/HarshdipSaha/HARSHDIPSAHA.github.io/actions/workflows/evals.yml)
[![MIT license](https://img.shields.io/badge/license-MIT-8ad7b6.svg)](./LICENSE)

Personal portfolio site: **[harshdipsaha.tech](https://harshdipsaha.tech/)** · [harshdipsaha.github.io](https://harshdipsaha.github.io)

Next.js 16 (App Router, static export) · React 19 · TypeScript · Tailwind CSS v4 · Motion · Lenis · MDX · deployed to GitHub Pages.

**Four gates run on every pull request before anything ships:** a record gate that fails a PR
missing its AI-DLC paperwork, a browser gate that loads every route and fails on any console
error, a Lighthouse gate that fails if accessibility/SEO/performance regress, and a factuality
gate that fetches each project's source repository and fails if a case study states a number that
repository doesn't support. All four are wired below and explained on
**[/process](https://harshdipsaha.tech/process)**.

---

## This repo is also a worked example

The site is built with **AI-DLC** (AI-Driven Development Lifecycle) on top of the agent-repo
structure playbook. Every change after the baseline is a numbered *effort*; every structural
decision is an *ADR*. The build story is published on the site itself at
**[/process](https://harshdipsaha.tech/process)**.

Why bother: this repo's first ~20 commits have messages like `lets see`, `hmmm`, `okays`, `soz` —
including one 12,517-line commit. None of them recorded *why*. Every structural decision had to be
reverse-engineered from diffs in August 2026. ADRs 0001–0007 and efforts 001–004 are honest
reconstructions from that archaeology; everything after is recorded as it happens.

```
Context      AGENTS.md · CLAUDE.md · CONTEXT.md · AGENT_WORKFLOWS.md   how agents behave here
Capabilities .claude/skills · AGENT_WORKFLOWS.md                       what agents can do
Knowledge    docs/ (tutorials · how-to · reference · explanation · adr) decisions that persist
Product      src/ · content/ · scripts/ · public/                      the software
Quality      evals/ · .github/workflows/                               what must hold to ship
```

## Run locally

```bash
npm install
npm run dev          # predev builds images into public/img/ and llms.txt into public/; serves on :3000
```

## Build & deploy

```bash
npm run typecheck        # tsc --noEmit — the record gate's prerequisite
npm run build             # prebuild builds images + llms.txt, then exports to out/
npm run test:unit         # node --test evals scripts — pure-function tests, no network
npm run test:smoke        # Playwright: every route loads, renders, scrolls, zero errors
npm run eval:factuality   # every number in a case study, checked against its source repo
npm run lighthouse:desktop  # and :mobile — Lighthouse CI against category floors
```

Output: `out/`. Pushing to `main` deploys via GitHub Actions to GitHub Pages. All four gates in
`.github/workflows/` run the same commands on every pull request.

## Project layout

| Path | Purpose |
|------|---------|
| `AGENTS.md` | Front door for any agent: commands, conventions, boundaries |
| `CONTEXT.md` | Durable project context + domain glossary |
| `AGENT_WORKFLOWS.md` | Named multi-skill recipes this repo actually runs |
| `aidlc-docs/inception/` | The baseline — requirements, architecture, components, stack |
| `aidlc-docs/efforts/` | One folder per unit of work, with state + requirements delta |
| `docs/adr/` | Architecture decision records — the "why" log |
| `docs/` | Tutorials, how-to guides, reference, explanation (Diátaxis) |
| `evals/` | Behaviour checks that the repo's conventions still hold |
| `src/app/` | Routes: `/`, `/story`, `/projects`, `/projects/[slug]`, `/gallery`, `/process`, 404, sitemap, robots; `globals.css` holds the design tokens |
| `src/content/site.ts` | Single source of truth for all site copy that isn't a project; the `nav` array drives Nav, Footer and sitemap |
| `content/projects/` | One `.mdx` per project (20); lowercased filename = URL slug |
| `content/writing/` | Three old blog posts, kept as content — not rendered |
| `src/components/` | `Nav`, `Footer`, `ui` (Pill/Label/Container/Arrow), `SmoothScroll`, `ProjectGrid`, `Gallery`, `motion/*`, `home/*` |
| `src/lib/projects.ts` | Reads project MDX + the image manifest |
| `scripts/build-llms-txt.mjs` | Writes the agent-facing `public/llms.txt` and `public/llms-full.txt` on `prebuild` (gitignored; ADR 0014) |
| `src/data/images.json` | **Generated** image manifest (committed) — do not hand-edit |
| `gallery/`, `project_images/`, `me.jpg` | Image drop-zones — `scripts/build-images.mjs` publishes them |
| `scripts/` | `build-images.mjs` (sharp, predev/prebuild), `render-brain-frames.py` (manual), `check-aidlc-sync.mjs` (CI gate) |
| `public/` | `img/` is **generated** (gitignored); `brain/` frames and `resume.pdf` are committed |

## Contributing to this repo (or asking an agent to)

Start at [`AGENTS.md`](./AGENTS.md). For a change of any size, open an effort — see
[`docs/how-to/run-an-aidlc-effort.md`](./docs/how-to/run-an-aidlc-effort.md). Decisions go in
[`docs/adr/`](./docs/adr/).
