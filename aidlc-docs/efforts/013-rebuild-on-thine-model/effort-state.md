# Effort 013 — Rebuild from scratch on the thine.com model

| Field | Value |
|-------|-------|
| Ref | 013-rebuild-on-thine-model |
| Status | complete |
| Depth | comprehensive |
| Opened | 2026-08-25 |
| Closed | 2026-08-25 |
| Baseline | aidlc-docs/inception/ (now historical — see ADR 0011) |
| ADRs | 0011 |
| Commits | branch `extremechange` |
| Reconstructed | no — recorded live |

## Intent

Owner's brief, verbatim in spirit: make a separate branch `extremechange`, remove all of the
current website, start from scratch, and build a portfolio like https://www.thine.com/ — no
obligation to keep static export or any existing style.

## Stages

| Stage | Outcome |
|-------|---------|
| Effort planning | Brief received in chat. Reference material already on hand from effort 011: a byte-level teardown of thine.com (stack, palette, type, every motion technique, measured frame-sequence cost). Fresh screenshots of thine.com captured with Playwright at 14 scroll depths for visual reference. |
| Functional design | Single long-scroll home in thine's order — split serif hero → scroll-scrubbed sequence with three copy stages → scroll-lit passage → section header → sticky card stack → experience → selected projects → serif closing → footer. Secondary pages at a 640px measure (`/story`, `/process`), a project index and case-study template, a gallery with a native-dialog lightbox. |
| NFRs | Static export retained; reduced-motion path for every animated component; AA contrast on paper-over-ink; sequence payload under 4 MB; typecheck and build clean; every route reachable from the nav. |
| Code | See units of work. |
| Build & test | `npx tsc --noEmit -p tsconfig.json` clean. `npm run build` succeeds: 27 static pages, `out/` 9.5 MB including 3.9 MB of brain frames. Every route (including a 404) probed at 200/404 on the dev server. Playwright screenshots of every page at 1440px and the home page at 390px reviewed. |

## Units of work

- [x] Teardown — `src/`, `css/`, `js/`, root `index.html` (a pre-Next static site left in the repo), `public/images/**`, all four sync/optimise scripts, `generate-static.mjs`, `capture-screens.mjs`, `PRODUCT.md`, Biome/ESLint/lint-staged configs removed. Project MDX moved to `content/projects/`, blog MDX to `content/writing/`.
- [x] `package.json` rewritten: Next 16.3, React 19.2, Tailwind v4, Motion 13, Lenis 1.3, next-mdx-remote 6, remark-gfm, gray-matter, clsx; sharp + playwright as dev deps. 204 packages, down from the Once UI tree.
- [x] `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `.gitignore`
- [x] `src/app/globals.css` — `@theme` tokens, `.display`, `.label`, `.glass`, `.hairline`, `.measure`, `.prose`, `.over-photo`
- [x] `src/content/site.ts` — every line of non-MDX copy, as plain data
- [x] `src/lib/projects.ts` — MDX frontmatter reader, slug = lowercase filename, image lookup via manifest
- [x] `scripts/build-images.mjs` — one sharp pass for gallery, projects, portrait and OG card; writes `src/data/images.json`; mtime-cached
- [x] `scripts/render-brain-frames.py` — 160 axial slices of ICBM 152 2009a at 1080 and 640 px, committed under `public/brain/`
- [x] Layout: `layout.tsx` (fonts, metadata, Lenis, nav, footer), `Nav.tsx` (progressive blur, pills, mobile menu), `Footer.tsx` (columns, 97 % hairline, colophon with the template's copyright notice)
- [x] Motion primitives: `Reveal`/`Group`/`Item`, `TextAnimate`, `ScrollWords`, `SmoothScroll`
- [x] Home: `Hero`, `BrainSequence`, `CardStack`, `Experience`, `Closing`, `ProjectGrid`
- [x] Pages: `/`, `/story`, `/projects`, `/projects/[slug]`, `/gallery` (+ `Gallery.tsx`), `/process`, 404, sitemap, robots
- [x] ADR 0011; ADRs 0001 and 0010 marked superseded; registry and audit rows
- [x] `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`, `README.md`, `AGENT_WORKFLOWS.md`, `docs/**`, `evals/**` rewritten for the new mechanics (delegated to a documentation agent, reviewed)
- [x] `scripts/check-aidlc-sync.mjs` exempt list updated for `src/data/images.json` and the removed Biome config

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit -p tsconfig.json` | clean |
| `npm run build` | 27 pages, exit 0 |
| Routes probed on dev server | `/`, `/story`, `/projects`, `/gallery`, `/process`, `/projects/atomnet` → 200; `/nope` → 404 |
| Brain frames | 160 × 2 tiers, 3,892,478 B total; 1080 tier 2.8 MB |
| `out/` size | 9,547,038 B |
| Runtime errors in browser (Playwright `pageerror`) | 0 after fix below |
| Screenshots reviewed | home ×15 @1440, home ×11 @390, story, projects, gallery, process, project detail |

## Notes

- **Motion 13 binds scroll-driven `useTransform`s to native scroll timelines**, so an input range
  that steps outside `[0, 1]` throws `Failed to execute 'animate' on 'Element': Offsets must be
  null or in the range [0,1]` at mount and unmounts the tree. The third overlay's fade-out range
  did exactly that (`0.96 + 0.06`). Caught by a Playwright `pageerror` listener, fixed by
  clamping. Recorded because it is a silent-until-runtime class of bug.
- The first render of the frame sequence started at the neck (jaw and sinuses read as a face).
  Re-rendered starting 34 slices higher, at the cerebellum. Caught only by looking at the
  screenshot.
- The hero's scroll hint overlapped the subline at 1440 × 900 — again a screenshot catch, fixed
  with bottom padding.
- Gallery photographs were identified from a contact sheet before assigning them to cards: the
  Daejeon Convention Center (MICCAI 2025's venue) backs the Research card.
- `content/writing/*.mdx` (three former blog posts) is retained but unrendered. Their `image`
  frontmatter pointed at deleted paths and was blanked.
- Old URLs (`/about`, `/work`, `/work/<Name>`) are not redirected — GitHub Pages cannot — and
  will 404. Accepted in ADR 0011.

## Follow-ups

- Descriptive `alt` text for the eight gallery photographs (currently "Photograph N").
- A `/writing` route if the three retained posts are ever wanted back.
- Consider `<ViewTransition>` for `/projects` → `/projects/[slug]` thumbnail morphs; zero-cost
  with the Next 16 / React 19 install, not attempted here.
