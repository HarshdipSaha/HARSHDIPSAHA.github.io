# AGENTS.md

Personal portfolio site for Harshdip Saha — Next.js App Router, statically exported to GitHub Pages.
Live: https://harshdipsaha.tech/ (`harshdipsaha.github.io` 301-redirects there; `person.siteUrl` is the `.tech` origin)

## Setup & commands

```bash
npm install

npm run dev            # predev runs the three generators, then next dev on :3000
npm run build          # prebuild runs the three generators, then next build -> out/
npm run typecheck      # tsc --noEmit -p tsconfig.json (run this before claiming done)
npm run images         # rebuild public/img/ + src/data/images.json without starting dev
npm run llms           # rebuild public/llms.txt + public/llms-full.txt without starting dev
npm run stats          # rebuild src/data/process-stats.json (the counts /process shows) without starting dev
npm run check:aidlc    # node scripts/check-aidlc-sync.mjs — the record gate, run locally
npm run check:factuality-manifest  # src/data/factuality.json vs a fresh eval:factuality run

npm run test:unit           # node --test evals scripts — every pure-function test: the factuality
                            # eval's core and the llms.txt renderer (no network, milliseconds)
npm run test:smoke          # playwright test — every route in out/ loads, renders, scrolls, zero errors (build first)
npm run lighthouse:desktop  # lhci autorun — Lighthouse CI over out/ against lighthouserc.desktop.json (build first)
npm run lighthouse:mobile   # same, mobile emulation, lighthouserc.mobile.json
npm run eval:factuality     # the content-correctness gate: every number in content/projects/*.mdx checked
                            # against its source repo's README, fetched live from the GitHub API
```

There is no lint or format script.

Stack: Next.js 16.3 (App Router, `output: "export"`), React 19.2, TypeScript 5.8, Tailwind CSS v4
(`@tailwindcss/postcss`; tokens in `@theme` inside `src/app/globals.css`), Motion 13 (`motion/react`),
Lenis (`lenis/react`), `next-mdx-remote/rsc` + `remark-gfm`, `gray-matter`, `clsx`. Dev-only: `sharp`
(build-time images), `playwright` (screenshots), `@playwright/test` (smoke gate, `tests/`), `@lhci/cli`
(Lighthouse CI gate), `serve` (static server both gates run against), `@anthropic-ai/sdk` (only the
factuality eval's optional judge tier, which is skipped when no API key is set). Fonts: Instrument Serif (italic
display) + Commissioner via `next/font/google` in `src/app/layout.tsx`. No Once UI, no Sass, no Biome, no ESLint config.

## Architecture constraints (static export)

| Constraint | Consequence |
|---|---|
| `output: "export"` | No server runtime at all |
| No API routes / route handlers | Fetch client-side or bake data at build time |
| No server actions, no SSR/ISR | Everything is prerendered into `out/` |
| `images.unoptimized: true` | No `next/image` optimization; `scripts/build-images.mjs` ships correctly-sized WebP |
| GitHub Pages host | Static files only; no redirects/rewrites middleware |
| Motion 13 scroll timelines | Every `useTransform` input range driven by `useScroll` must stay within `[0, 1]` — it throws otherwise |

CI (all Node 20):

- `.github/workflows/deploy.yml` — on push to `main`: `npm install`, `npm run build`, deploys `out/` to Pages.
- `.github/workflows/aidlc-check.yml` — on PR to `main`: the record gate (ADR 0009).
- `.github/workflows/quality-gates.yml` — on PR to `main`: **Build** (typecheck + export, `out/` as artifact) →
  **Smoke (Playwright)** (`tests/smoke.spec.ts`, desktop + Pixel 7) and **Lighthouse (desktop | mobile)**
  (`@lhci/cli`, thresholds in `lighthouserc.*.json`, median of 3 runs on six routes). ADR 0012.
  Lowering a Lighthouse threshold needs an effort record that says why.
- `.github/workflows/evals.yml` — on PR to `main`, **only** when the diff touches `content/projects/**`,
  `evals/**`, the workflow itself or the manifests: **Evals / factuality** (`npm run test:unit`, then
  `npm run eval:factuality`, then `npm run check:factuality-manifest`; JSON report uploaded as the
  `factuality-report` artifact). ADR 0013. Exit 1 = a claim is not traceable to its source; exit 2 =
  GitHub was unreachable, which is *not* a factuality failure. The manifest check (effort 036) fails
  the PR if the committed `src/data/factuality.json` — the per-project counts
  `src/app/projects/[slug]/page.tsx` renders its "verified" line from — disagrees with this run,
  except for a project unverifiable on either side (the known `pySdf` local-vs-CI divergence
  above; see `scripts/lib/factuality-manifest.mjs`).

## Conventions

**Content is code.** Every word that is not a project case study lives in `src/content/site.ts`
(exports: `person`, `nav`, `hero`, `sequence`, `passage`, `threads`, `experience`, `selectedProjects`,
`closing`, `story`, `publication`, `footer`, `process`). Components render it; they do not invent copy.
Project case studies are `content/projects/*.mdx`.

**Evidence rule — enforced, not advisory.** A case study may only state what its source can support.
The owner's rule, in his words: *"tell me if u can actually fetch their details using github api if
not then don't make up and write."* Since effort 023 this is a gate, not a request: `Evals /
factuality` extracts every number from every `content/projects/*.mdx`, fetches that project's source
repository README through the GitHub API, and **fails the PR** on any number it cannot trace. If a
number is true but comes from somewhere other than the README — a résumé line, a published paper, a
competition certificate — add it to `evals/factuality/baseline.json` **with a reason naming where it
does come from**; an entry left with the `TODO` placeholder fails the gate, and an entry whose claim
has been deleted from the content fails as stale. Run `npm run eval:factuality` before you push.
Case studies whose source cannot be read are reported as `unverifiable` **by name**, never skipped:
`BrainwavesFinland` and `SAAKSHI` have no `link` at all (private repositories), and in CI
`pySdf`'s source (`ComPhysGroup/PyAMorph`) returns 404 to the workflow token, which can only read
this repository. Expect that file's counts to differ between a local run (owner's `gh` token) and
CI; both are correct and both exit 0.

**The evidence rule is visible on the page it protects (effort 036).** Every case study renders one
quiet line under its header — `src/lib/factuality.ts`'s `factualityBadge`, reading per-project counts
from the generated `src/data/factuality.json` — stating how many claims were checked against the
source repository, how many needed a baseline reason, or that the source is private/unreadable, with
a link to `evals/factuality/`. The counts are computed, not authored, so this is a small typed helper
rather than copy in `site.ts`; see effort 036's record for why that doesn't break "content is code".

**Images are built, never hand-copied.** Drop files in the drop-zones; `scripts/build-images.mjs`
(sharp, runs on `predev`/`prebuild`, cached in `.cache/`) publishes them:

| Drop-zone | Destination | Manifest key |
|---|---|---|
| `me.jpg` (root) | `public/img/me.webp`, `public/img/og.jpg` | `me` |
| `gallery/*.jpeg` | `public/img/gallery/NN.webp` + `NN-s.webp` thumbs | `gallery[]` |
| `project_images/<source name>` | `public/img/projects/<slug>.webp` via `PROJECT_MAP` | `projects[slug]` |

The manifest is `src/data/images.json` (committed — `{ gallery: [{src, thumb, w, h}], projects: {slug: {src, w, h}}, me: {src, w, h} }`),
read through `src/lib/projects.ts` (`gallery`, `projectImages`, `portrait`). `PROJECT_MAP` at the top
of the script maps `"source name.png" -> "slug"`; add an entry when you add a project image (unmapped
files fall back to a kebab-case of the filename). `resume.pdf` at the root is copied to `public/resume.pdf` and committed directly.

**The agent-facing files are built too.** `scripts/build-llms-txt.mjs` runs in the same
`predev`/`prebuild` hook and writes `public/llms.txt` (a curated llmstxt.org index) and
`public/llms-full.txt` (the same map with every case study inlined). Both are **gitignored** —
absent from a fresh clone until the first build, exactly like `public/img/`. The rendering is a pure
function in `scripts/lib/llms-txt.mjs` (`renderLlmsTxt(site, projects) -> {index, full}`), unit-tested
by `npm run test:unit`; the script around it only does I/O. Content comes from `src/content/site.ts`
and `content/projects/*.mdx`, so adding a project updates both files with no manual step. Absolute
URLs come from `person.siteUrl` — never hardcode the host. ADR 0014.

**The /process counts are built too.** `scripts/build-process-stats.mjs` runs in the same
`predev`/`prebuild` hook and writes `src/data/process-stats.json` (committed, like `images.json`)
from the repo itself: `aidlc-docs/efforts/NNN-*/` directories, `docs/adr/NNNN-*.md` files, the
`Superseded` rows of `docs/adr/README.md`, and the workflows with a `pull_request` trigger.
`process.stats` and `process.links` in `site.ts` are **templates** — `"All {efforts} change records"` —
filled by `src/lib/process-stats.ts`; an unknown placeholder fails the build. Never type a count
into `site.ts`. The script exits 1 if any count went *down* against the committed JSON (the record
is append-only, so a decrease means a deleted effort or ADR); a deliberate removal passes once with
`ALLOW_STATS_DECREASE=1`. The gate count is `process.gates.length`, not the workflow count —
`quality-gates.yml` carries two gates.

**WebMCP is a capability-checked no-op.** `src/components/agent/WebMcpTools.tsx` registers one
`searchProjects` tool on `/projects` via `document.modelContext`, which Chrome ships behind an
origin trial from Chrome 149 (`navigator.modelContext`, the earlier community-explainer name, is
deprecated and kept only as a fallback). **Without this origin's own trial token it is undefined in
every real visitor's browser today.** It renders `null`, returns immediately when neither API is
present, never logs, and unregisters on unmount. Its data is the list `/projects` renders, passed
from the server component. `execute` returns a plain string — Chrome's shipped contract has no
`outputSchema` or structured-content return. Do not add tools speculatively and do not remove the
feature check. ADR 0014, ADR 0020.

**Adding a project** = one MDX file in `content/projects/` + one image in `project_images/` + one `PROJECT_MAP` entry.

```mdx
---
title: "Retinal Vessel Segmentation"
publishedAt: "2026-08-01"
summary: "U-Net variant benchmarked on DRIVE and STARE."
images:
  - "/img/projects/retinal-vessel-segmentation.webp"
link: "https://github.com/HARSHDIPSAHA/..."
---

Body copy in MDX (GFM).
```

```js
// scripts/build-images.mjs
const PROJECT_MAP = {
  "Retinal Vessel Seg.png": "retinal-vessel-segmentation",
};
```

The URL slug is the **lowercased MDX filename**; the image key is the basename of `images[0]` and must
match a `PROJECT_MAP` value. They need not be the same string.

**Routes need two edits.** Create `src/app/<route>/page.tsx` **and** add `{ label, href }` to the `nav`
array in `src/content/site.ts`. `Nav.tsx`, `Footer.tsx` and `sitemap.ts` all read that one array; there is
no route toggle. Current routes: `/`, `/story`, `/projects`, `/projects/[slug]`, `/gallery`, `/process`,
404, `/sitemap.xml`, `/robots.txt`. `/llms.txt` and `/llms-full.txt` are generated files, not routes —
they are deliberately **not** in `nav` and **not** in the sitemap.

**Design tokens** live in the `@theme` block of `src/app/globals.css`: `--color-ink` (#171519, page
background), `--color-ink-2/3`, `--color-paper` (#ebe5e1), `--color-tangerine` (#f49752 — the only
accent, used for the primary pill CTA and small marks), plus `--color-sunny/seafoam/cerulean` for tiny
marks only. Rule: every neutral is `paper` or white at an alpha (`text-paper/60`, `border-white/10`) —
there is no grey ramp and no ad-hoc hex. Utility classes: `.display` (serif italic, -0.03em, lh 0.95),
`.label` (13px caps, 0.2em tracking, 55% paper — the AA floor at that size), `.glass`, `.hairline`, `.measure` (40rem), `.prose`,
`.over-photo`. Shared primitives: `Pill`, `Label`, `Container`, `Arrow` in `src/components/ui.tsx`.

**Motion.** Enter-on-view is `Reveal` / `Group` / `Item` (`src/components/motion/Reveal.tsx`,
blur-diagonal default); per-word blur-in is `TextAnimate`; scroll-linked word highlight is `ScrollWords`.
Every animated component checks `useReducedMotion()` and renders static markup when set; `SmoothScroll`
(Lenis) disables itself on `prefers-reduced-motion`. Inline-block word spans must have their separating
space **outside** the span. Keep `useScroll`-driven `useTransform` ranges inside `[0, 1]`. Split-text
components give assistive tech the whole string once via a visually-hidden `<span class="sr-only">` and
mark the fragments `aria-hidden` — never `aria-label` on a `<p>`/`<span>` (prohibited ARIA; axe
`aria-prohibited-attr`, and it malforms the accessibility tree).

**Brain sequence.** `src/components/home/BrainSequence.tsx` scrubs 160 axial slices on a canvas. The
frames (`public/brain/1080/NNN.webp`, `public/brain/640/NNN.webp`, `public/brain/manifest.json`, ~3.8 MB)
**are committed** — regenerating them (`scripts/render-brain-frames.py`; nibabel, numpy, Pillow) needs a
63 MB download of the ICBM 152 Nonlinear Symmetric 2009a T1 template. The template's licence requires its
copyright notice, which the footer colophon (`footer.colophon` in `site.ts`) carries. Do not remove it.

**Secrets.** Never commit real values. `.env.example` only.

## Boundaries — do not edit by hand

| Path | Why |
|---|---|
| `public/img/**` | Generated by `scripts/build-images.mjs`; gitignored, regenerated every build |
| `public/img/og/**` | Generated by `scripts/build-og-images.mjs` (satori + sharp, one 1200×630 card per `content/projects/*.mdx`); gitignored under `public/img/`, cached in `.cache/og.json` |
| `public/llms.txt`, `public/llms-full.txt` | Generated by `scripts/build-llms-txt.mjs`; gitignored, regenerated every build |
| `.cache/` | Image pipeline cache; gitignored |
| `src/data/images.json` | Generated manifest (committed so `tsc` works in a fresh clone) |
| `src/data/process-stats.json` | Generated by `scripts/build-process-stats.mjs` from the record itself; committed for the same reason. To change a number, change the record |
| `src/data/factuality.json` | Generated by `evals/factuality/run.mjs --write-summary`; committed; CI's `scripts/check-factuality-manifest.mjs` fails a PR whose copy has drifted from a fresh run |
| `out/` | Build output |
| `.next/`, `node_modules/`, `tsconfig.tsbuildinfo` | Tooling artifacts |
| `public/brain/**` | Committed render output of `scripts/render-brain-frames.py`; rerun the script, don't hand-edit |

To change anything under those paths, change its source: the drop-zone, the script, or `site.ts`.

## Change lifecycle — applies to every AI tool, not just Claude

This repo runs **AI-DLC**: the record of a change ships *in the same PR* as the change. CI
(`.github/workflows/aidlc-check.yml` → `scripts/check-aidlc-sync.mjs`) fails any PR that
touches substantive paths (`src/`, `scripts/`, configs, workflows) without touching
`aidlc-docs/`. Do this **before opening the PR**, not after being asked:

1. **Effort record** — `aidlc-docs/efforts/NNN-<ref>/effort-state.md` (intent, stages, units
   of work, verification). Procedure: `docs/how-to/run-an-aidlc-effort.md`.
2. **Registry** — regenerate `aidlc-docs/registry.md` from the effort-state files (it is a
   derived view; never hand-patch it).
3. **Audit** — add this effort's gate rows to `aidlc-docs/audit.md`.
4. **ADR** — *only if* the change makes an architectural or IA decision → `docs/adr/NNNN-*.md`
   + a row in `docs/adr/README.md`. The current design is ADR 0011 (rebuild on the thine.com model);
   it supersedes ADR 0010.
5. **Docs sync** — *only if* facts stated in `CONTEXT.md`, `README.md`, or `docs/` drifted
   (route list, IA table, pipeline diagram, glossary). Don't touch them otherwise.

**Trivial escape hatch** (narrow, defined in ADR 0009): a typo or a one-line copy tweak that
deletes nothing, adds no route, and changes no structure. Mark the PR title `[trivial]`.
Deleting a file, moving content between sections, or changing a link target is **not** trivial
— those get an effort record, even a short one (`depth: minimal`).

## Definition of done

1. `npm run typecheck` — clean.
2. `npm run build` — succeeds and `out/` contains the affected route.
3. `npm run test:smoke` — passes against that `out/`. If you touched layout, images, motion, scripts or
   shared chrome, also `npm run lighthouse:desktop`. CI runs both on the PR (ADR 0012).
   If you touched `scripts/lib/`, `npm run test:unit` too. Touched `content/projects/*.mdx` or
   `evals/`? `npm run test:unit` and `npm run eval:factuality` must both exit 0. CI runs them as
   *Evals / factuality* (ADR 0013).
4. New/changed copy lives in `src/content/site.ts` or a `content/projects/*.mdx` file, not hardcoded in a component.
5. New route: `src/app/<route>/page.tsx` **and** a `nav` entry in `src/content/site.ts` both present.
6. New project image: `PROJECT_MAP` entry present; `images[0]` basename matches it.
7. No hand-edits under `public/img/`, `public/llms*.txt`, `.cache/`, `src/data/images.json`, `src/data/process-stats.json`, or `out/`.
8. Animated components honour `useReducedMotion()`; `useScroll`-driven ranges stay within `[0, 1]`.
9. **Change lifecycle complete** — effort record + registry + audit in the same PR; ADR and
   CONTEXT.md/docs sync done *iff* needed (see above). `npm run check:aidlc` passes locally.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
