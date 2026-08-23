# Inception — Architecture Baseline

## Summary

The site is a **build-time content compiler with no runtime backend**. Authored
content (a single typed TypeScript module plus MDX files) and raw image
drop-zones are normalised by prebuild Node scripts into `public/` and
`src/data/gallery.json`; Next.js 16 App Router then compiles everything to a
fully static `out/` directory via `output: "export"`; GitHub Actions uploads
that directory to GitHub Pages. Every page is HTML at rest — there is no server
to call, no database, and no request-time rendering.

## Pipeline

```
 DROP-ZONES                    AUTHORED CONTENT
 +--------------+              +------------------------------+
 | gallery/     |              | src/resources/content.tsx    |
 | project_     |              | src/app/work/projects/*.mdx  |
 |   images/    |              | src/app/blog/posts/*.mdx     |
 | me.jpg       |              | src/resources/once-ui.config |
 +------+-------+              +--------------+---------------+
        |                                     |
        v  npm run predev / prebuild          |
 +-------------------------------+            |
 | scripts/sync-me.mjs           |            |
 | scripts/sync-gallery.mjs      |            |
 | scripts/sync-project-images   |            |
 | scripts/generate-static.mjs   |            |
 +------+------------------------+            |
        v                                     |
 +------------------------------+             |
 | public/images/**             |             |
 | src/data/gallery.json        |             |
 +------+-----------------------+             |
        +--------------+----------------------+
                       v
          +----------------------------+
          | next build (Turbopack)     |
          | output: "export"           |
          +------------+---------------+
                       v
                    +------+
                    | out/ |
                    +--+---+
                       v
     +-----------------------------------------+
     | .github/workflows/deploy.yml            |
     | push:main -> Node 20 -> npm install     |
     | -> npm run build -> upload out/         |
     | -> actions/deploy-pages@v4              |
     +-----------------+-----------------------+
                       v
        GitHub Pages -> harshdipsaha.github.io
                     -> harshdipsaha.tech
```

## Layers

| Layer | Artifacts | Role |
| --- | --- | --- |
| Content | `src/resources/content.tsx`, `src/app/work/projects/*.mdx`, `src/app/blog/posts/*.mdx`, `src/data/gallery.json` | The only place site copy and project write-ups live |
| Type | `src/types/content.types.ts`, `src/types/config.types.ts` | Contracts / seams: `Person`, `Social`, `Home`, `About`, `Blog`, `Work`, `Gallery`, plus config shapes. Compile-time enforcement of the content schema |
| Presentation | Once UI primitives (`@once-ui-system/core`) + `src/components/**` + `*.scss` | Renders content; owns no content of its own |
| Config | `src/resources/once-ui.config.ts`, `src/resources/icons.ts`, `src/resources/custom.css` | `baseURL`, `routes`, `display`, `protectedRoutes`, `fonts`, `style`, `schema`, `effects`; icon registry; accent classes |
| Build | `scripts/*.mjs` (pre-phase) + `next build` | Normalises assets, then compiles the static site |
| Delivery | `.github/workflows/deploy.yml`, GitHub Pages | Concurrency group `pages`; permissions `contents: read`, `pages: write`, `id-token: write` |

## Key data flows

### (a) A project MDX becomes a rendered page

1. Author drops `src/app/work/projects/<slug>.mdx` with frontmatter `title`,
   `publishedAt`, `summary`, `images[]`, `link` (optionally `subtitle`, `team`,
   `tag`).
2. `src/utils/utils.ts` `getPosts()` reads the directory, parses frontmatter via
   `gray-matter`, and returns `{ metadata, content }` per file.
3. `src/app/work/page.tsx` calls `getPosts()` and hands the list to
   `src/components/work/Projects.tsx`, which renders one
   `src/components/ProjectCard.tsx` per entry.
4. `src/app/work/[slug]/page.tsx` generates static params over the same slug set,
   so all 17 projects are emitted as static routes at build time.
5. The MDX body is rendered through `src/components/mdx.tsx` (component map,
   `HeadingLink` for anchored headings) via `next-mdx-remote`.

### (b) An image becomes a URL

1. Drop the file into `project_images/` (or `gallery/`, or root `me.jpg`).
2. `scripts/sync-project-images.mjs` copies it into `public/images/projects/`
   using its explicit `FILE_MAP` (18 images); `scripts/sync-gallery.mjs` copies
   into `public/images/gallery/` and rewrites `src/data/gallery.json` (8 images);
   `scripts/sync-me.mjs` produces `public/images/me.jpg` and
   `public/images/og/home.jpg`.
3. The resulting `/images/...` path is referenced from MDX frontmatter `images[]`
   or from `content.tsx`.
4. Because a `FILE_MAP` entry is required, adding a project image is a two-step
   change: drop the file **and** register it in the script.

### (c) A route becomes visible

1. Add the page under `src/app/<route>/page.tsx`.
2. Set the flag in `src/resources/once-ui.config.ts` `routes` (`"/blog"` is
   currently `false`, which is why the blog is dark despite being built).
3. Add the nav entry by hand in `src/components/Header.tsx`.
4. Both steps are required; either alone yields a reachable-but-unlinked page or
   a nav link into a blocked route.

## Cross-cutting concerns

| Concern | Mechanism |
| --- | --- |
| Theming | `src/components/Providers.tsx` + `src/components/ThemeToggle.tsx` driving Once UI design tokens; `display.themeSwitcher` gates the control |
| Route guarding | `src/components/RouteGuard.tsx` enforces `routes` / `protectedRoutes` from `once-ui.config.ts` on the client |
| Scroll / anchors | `src/components/ScrollToHash.tsx` + `src/components/HeadingLink.tsx` for in-page deep links (used by the about-page TOC) |
| SEO & structured data | `src/utils/meta.ts` for per-page metadata; `schema` block in `once-ui.config.ts`; OG image generated by `sync-me.mjs` |
| Analytics | `@vercel/analytics` and `@vercel/speed-insights` mounted in `src/app/layout.tsx` |
| Fonts | Geist and Geist Mono via `next/font/google`, wired through `once-ui.config.ts` `fonts` |
| Styling | Sass 1.86 with the modern compiler (`sassOptions` in `next.config.mjs`); component-scoped `.module.scss` |

## Architectural invariants

1. **No server runtime.** No API routes, server actions, ISR, or request-time
   data fetching. A feature that needs a server does not belong in this repo.
2. **`public/images/` and `src/data/gallery.json` are generated.** Never
   hand-edit them; edit the drop-zone or the sync script.
3. **Content is typed.** Every content shape has a contract in
   `src/types/content.types.ts`; `tsc --noEmit` must stay clean.
4. **A route needs both.** The `routes` toggle in `once-ui.config.ts` *and* a nav
   entry in `Header.tsx`.
5. **Sync precedes build.** `predev` / `prebuild` must run before `next dev` /
   `next build`; skipping them ships stale or missing assets.
6. **`content.tsx` is the only home for site copy.** Components must not inline
   prose.

## Known trade-offs

| Trade-off | Why accepted | ADR ref |
| --- | --- | --- |
| Static export only — no server capabilities, ever | Zero-ops, zero-cost, minimal attack surface; the site has no dynamic requirement | `docs/adr/0002-static-export-github-pages.md` |
| `images.unoptimized: true` — no `next/image` resizing | Mandatory under `output: "export"`; image weight is managed manually at the drop-zone instead | `docs/adr/0002-static-export-github-pages.md` |
| Site copy as typed TSX rather than a CMS | Compile-time safety and static-export compatibility; costs non-technical editability | `docs/adr/0004-content-as-code-typed-schema.md` |
| Image drop-zones + explicit `FILE_MAP` instead of authoring straight into `public/` | Keeps source images and shipped assets separable and reproducible; costs one extra registration step | `docs/adr/0005-drop-zone-image-sync-pipeline.md` |
| Blog fully built but route-disabled | Keeps the surface small for a recruiter audience while preserving the code path for later re-enablement | `docs/adr/0006-prune-template-demo-content.md` |
| Two content systems — `content.tsx` for copy, MDX for long-form bodies | Long-form case studies do not belong in a TS literal; costs a split an author must learn | `docs/adr/0007-mdx-per-project-content-model.md` |
| Direct coupling to the Once UI component API | Speed of build-out; the cost is that a major bump becomes a migration project | `docs/adr/0001-onceui-nextjs-portfolio-template.md` |

_Baseline reverse-engineered from the existing codebase on 2026-08-23 (brownfield inception). Depth: standard._
