# Harshdip Saha — Portfolio

[![Deploy to GitHub Pages](https://github.com/HarshdipSaha/HARSHDIPSAHA.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/HarshdipSaha/HARSHDIPSAHA.github.io/actions/workflows/deploy.yml)
[![AI-DLC sync check](https://github.com/HarshdipSaha/HARSHDIPSAHA.github.io/actions/workflows/aidlc-check.yml/badge.svg)](https://github.com/HarshdipSaha/HARSHDIPSAHA.github.io/actions/workflows/aidlc-check.yml)
[![Evals](https://github.com/HarshdipSaha/HARSHDIPSAHA.github.io/actions/workflows/evals.yml/badge.svg)](https://github.com/HarshdipSaha/HARSHDIPSAHA.github.io/actions/workflows/evals.yml)
[![Code: MIT · Content: All Rights Reserved](https://img.shields.io/badge/license-MIT_·_content_ARR-8ad7b6.svg)](./LICENSE)

Personal portfolio site: **[harshdipsaha.tech](https://harshdipsaha.tech/)** · [harshdipsaha.github.io](https://harshdipsaha.github.io)

## Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) — App Router, `output: "export"` (fully static) |
| Language | TypeScript · React 19 |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) — design tokens in `src/app/globals.css` |
| Motion | [Motion](https://motion.dev/) · [Lenis](https://lenis.darkroom.engineering/) smooth scroll |
| Content | MDX (`next-mdx-remote`) · `gray-matter` frontmatter |
| Hosting | GitHub Pages · custom domain (`harshdipsaha.tech`) via Cloudflare |

---

## This repo is also a worked example

The site is built with **AI-DLC** (AI-Driven Development Lifecycle) on top of the agent-repo
structure playbook. Every change after the baseline is a numbered *effort*; every structural
decision is an *ADR* (Architecture Decision Record). The full build story — including the
incidents that led to each of the quality gates further down — is published on the site itself at
**[/process](https://harshdipsaha.tech/process)**.

Why bother: this repo's first twenty-odd commits (`d9e0d8a` … `0814927`) carried no recorded
rationale, one of them a 12,517-line change with no explanation of what it chose or why. Every
structural decision behind them had to be reverse-engineered from diffs in August 2026. ADRs
0001–0007 and efforts 001–004 are honest reconstructions from that archaeology; everything after
is recorded as it happens, which is the entire point of what follows.

```
Context      AGENTS.md · CLAUDE.md · CONTEXT.md · AGENT_WORKFLOWS.md   how agents behave here
Capabilities .claude/skills · AGENT_WORKFLOWS.md                       what agents can do
Knowledge    docs/ (tutorials · how-to · reference · explanation · adr) decisions that persist
Product      src/ · content/ · scripts/ · public/                      the software
Quality      evals/ · .github/workflows/                               what must hold to ship
```

## Quality gates

Every pull request has to clear all four before it can merge into `main` — this is what "follows
AI-DLC" means in practice here, not just a claim in a document:

| # | Gate | Workflow | Checks | Fails when |
|---|---|---|---|---|
| 1 | **Record** | `aidlc-check` | Every substantive change carries its AI-DLC paperwork — an effort record, a registry row, an audit entry | The diff touches `src/`, `scripts/`, or configs with no matching `aidlc-docs/` update |
| 2 | **Build & Smoke** | `Quality gates` | Type-checks, exports the static site, then loads every route in a real browser (desktop + mobile) | Any route throws, fails to render, or logs a console error |
| 3 | **Lighthouse** | `Quality gates` | Accessibility, SEO, performance and best-practice scores, desktop + mobile, against fixed floors | Any category drops below where it stands today |
| 4 | **Factuality** | `Evals` | Every number in a project write-up, checked against that project's real source repository | A case study states a number its source can't support |

Badges above track the three that run as their own named checks; **Quality gates** is one
workflow with three jobs. All four are explained end-to-end, with the real incidents that
motivated each one, on **[/process](https://harshdipsaha.tech/process)**.

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
