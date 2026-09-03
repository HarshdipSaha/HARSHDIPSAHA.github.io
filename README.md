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

### Agent & context layer

| Path | Purpose |
|------|---------|
| `AGENTS.md` | Shared contract for every AI tool that touches this repo — setup commands, stack versions, architecture constraints, image pipeline rules, conventions, and the full change lifecycle (effort → registry → audit → ADR) |
| `CLAUDE.md` | Claude-specific overrides: skill routing table, AI-DLC rule, named recipes pointer, rules of engagement |
| `CONTEXT.md` | Durable project context — owner identity, affiliations, audience, design bias (cinematic, thine.com model), information architecture table mapping every route to its source and render state |
| `AGENT_WORKFLOWS.md` | Named multi-skill recipes: "Add a project" (7-step chain from brainstorming through MDX, image pipeline, and verification), "Add a route" (effort + page + nav array) |

### AI-DLC records

| Path | Purpose |
|------|---------|
| `aidlc-docs/inception/` | The baseline — `requirements.md`, `architecture.md`, `components.md`, `stack.md` — the starting point every effort is measured against |
| `aidlc-docs/efforts/` | 31 numbered effort folders (`001-onceui-template-adoption` → `031-improvement-ideation`), each with `effort-state.md` (status, depth, stages, verification) and optionally `requirements-delta.md` |
| `aidlc-docs/registry.md` | **Generated** — derived table of all efforts rebuilt from per-folder state files; includes status summary and next effort number |
| `aidlc-docs/audit.md` | Approval gate records — every effort's planning and completion gates with timestamps |
| `docs/adr/` | 16 Architecture Decision Records (`0001-onceui-nextjs-portfolio-template` → `0016-writing-route`) — the "why" log for every structural choice |

### Documentation (Diátaxis)

| Path | Purpose |
|------|---------|
| `docs/tutorials/` | Step-by-step walkthroughs: local setup, adding your first project |
| `docs/how-to/` | Task recipes: add a gallery image, add a project, add a route, run an AI-DLC effort, update site content |
| `docs/reference/` | Lookup tables: build scripts, commands, content schema |
| `docs/explanation/` | Background reading: AI-DLC in this repo, content-as-code, why static export |
| `docs/plans/` | Forward-looking ideas and improvement proposals |

### Product — source code

| Path | Purpose |
|------|---------|
| `src/app/` | Next.js App Router — 8 routes (`/`, `/story`, `/projects`, `/projects/[slug]`, `/writing`, `/writing/[slug]`, `/gallery`, `/process`) + `not-found.tsx`, `robots.ts`, `sitemap.ts`; `globals.css` holds Tailwind v4 `@theme` design tokens (ink, paper, tangerine) |
| `src/content/site.ts` | Single source of truth for all non-project copy — exports `person`, `nav`, `hero`, `sequence`, `passage`, `threads`, `experience`, `selectedProjects`, `closing`, `story`, `publication`, `process`, `writing`, `footer`; the `nav` array drives Nav, Footer, and sitemap generation |
| `src/components/` | 19 components across 5 groups: top-level (`Nav`, `Footer`, `Gallery`, `ProjectGrid`, `SmoothScroll`, `Morph`, `MatrixRibbon`, `Gutters`, `ui.tsx` primitives), `home/` (Hero, BrainSequence, CardStack, Experience, Closing), `motion/` (Reveal, ScrollWords, TextAnimate), `process/` (GatePipeline, SkillsBubbles), `story/` (ToolkitToy), `agent/` (WebMcpTools) |
| `src/lib/` | `projects.ts` (MDX loader + image manifest reader), `writing.ts` (writing-post MDX loader, mirrors `projects.ts`), `agentProjects.ts` (agent-facing project data), `useReducedMotionSafe.ts` (reduced-motion hook shared by every animated component) |
| `src/data/images.json` | **Generated** image manifest (committed so `tsc` works in a fresh clone) — do not hand-edit |

### Product — content

| Path | Purpose |
|------|---------|
| `content/projects/` | 20 MDX case studies (one per project, lowercased filename = URL slug) — each checked by the factuality eval gate against its source repo |
| `content/writing/` | 3 posts (LiveKit, Adobe hackathon, Sehat Sathee), rendered at `/writing` and `/writing/[slug]` since effort 038 — first-person accounts, outside the factuality gate (ADR 0016) |

### Build pipeline

| Path | Purpose |
|------|---------|
| `scripts/build-images.mjs` | Sharp-based image pipeline (runs on `predev`/`prebuild`) — reads drop-zones (`gallery/`, `project_images/`, `me.jpg`), writes optimized WebP to `public/img/`, generates `src/data/images.json`; cached in `.cache/` |
| `scripts/build-llms-txt.mjs` | Generates agent-facing `public/llms.txt` + `public/llms-full.txt` from `site.ts` and project MDX on every build (gitignored; ADR 0014) |
| `scripts/lib/llms-txt.mjs` | Pure rendering function (`renderLlmsTxt(site, projects, posts) → {index, full}`) following the llmstxt.org spec — unit-tested |
| `scripts/check-aidlc-sync.mjs` | The record gate — fails when a diff touches substantive paths without a matching `aidlc-docs/` update; powers the `aidlc-check` CI workflow |
| `scripts/postbuild-segments.mjs` | Static-export fix — flattens nested RSC segment prefetch paths to dot-separated filenames for GitHub Pages |
| `scripts/render-brain-frames.py` | Manual-run Python script (nibabel, numpy, Pillow) — renders 160 axial slices from the ICBM 152 template into `public/brain/` for the homepage scroll-scrubbed brain animation |

### Quality & evals

| Path | Purpose |
|------|---------|
| `evals/factuality/` | 10-file factuality gate: `claims.mjs` (numeric claim extractor), `sources.mjs` (GitHub API fetcher with retry/backoff), `verdict.mjs` (grounded/baselined/ungrounded classifier), `judge.mjs` (optional LLM advisory tier), `run.mjs` (CLI entry), `baseline.json` (8 accepted exceptions with reasons), plus unit tests and fixtures |
| `tests/smoke.spec.ts` | Playwright smoke suite — discovers every route in `out/`, asserts 200 + h1 + link home + full scroll + zero console errors; includes ToolkitToy click-reshuffle and reduced-motion tests |
| `tests/skills-bubbles.spec.ts` | Playwright tests for SkillsBubbles — per-skill text presence, click transform, drag displacement, reduced-motion fallback |
| `playwright.config.ts` | Desktop Chrome + Pixel 7 viewports, served from `out/` via `serve` on port 3100 |
| `lighthouserc.desktop.json` | Lighthouse CI thresholds: a11y/BP/SEO 1.0, perf 0.9 — 7 routes × 3 runs, median |
| `lighthouserc.mobile.json` | Same as desktop but perf floor 0.7 (mobile emulation) |

### Static assets & drop-zones

| Path | Purpose |
|------|---------|
| `gallery/` | 15 source JPEGs — `build-images.mjs` converts them to numbered WebP + thumbnails in `public/img/gallery/` |
| `project_images/` | 21 source images (PNG/JPG/WebP) — one per project, mapped to `public/img/projects/<slug>.webp` via `PROJECT_MAP` |
| `me.jpg` | Portrait drop-zone — published as `public/img/me.webp` + `public/img/og.jpg` |
| `public/brain/` | **Committed** — 160 rendered brain frames in two size tiers (1080, 640) + manifest; output of `render-brain-frames.py` |
| `public/resume.pdf` | Downloadable résumé (committed directly) |
| `public/img/` | **Generated** (gitignored) — all optimized images, rebuilt every `predev`/`prebuild` |
| `public/llms.txt`, `llms-full.txt` | **Generated** (gitignored) — agent-facing site summary and full case-study dump |

### CI/CD

| Path | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | On push to `main`: install → build → deploy `out/` to GitHub Pages |
| `.github/workflows/aidlc-check.yml` | On PR: the record gate — rejects PRs that touch code without effort records |
| `.github/workflows/quality-gates.yml` | On PR: Build (typecheck + export) → Smoke (Playwright, desktop + Pixel 7) + Lighthouse (desktop + mobile, parallel) |
| `.github/workflows/evals.yml` | On PR (path-filtered to `content/projects/**` and `evals/**`): unit tests + factuality eval; JSON report uploaded as artifact |

## Contributing to this repo (or asking an agent to)

Start at [`AGENTS.md`](./AGENTS.md). For a change of any size, open an effort — see
[`docs/how-to/run-an-aidlc-effort.md`](./docs/how-to/run-an-aidlc-effort.md). Decisions go in
[`docs/adr/`](./docs/adr/).
