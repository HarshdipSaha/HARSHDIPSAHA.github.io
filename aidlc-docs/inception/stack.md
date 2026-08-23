# Inception — Stack Baseline

## Runtime & framework

| Package | Version | Role |
| --- | --- | --- |
| `next` | 16.0.10 | App Router, Turbopack, static export (`output: "export"`) |
| `react` / `react-dom` | 19.2 | UI runtime; React Server Components by default |
| `typescript` | 5.8 | Type layer; `tsc --noEmit` is the release gate |
| Node.js | 20 (CI) | Build runtime in GitHub Actions |

## Content & docs

| Package | Version | Role |
| --- | --- | --- |
| `@next/mdx` | 3.1 | MDX integration; `pageExtensions` includes `md`/`mdx` |
| `next-mdx-remote` | 5 | Renders MDX bodies at build time; needs `transpilePackages` |
| `gray-matter` | — (not pinned in the facts on record) | Frontmatter parsing inside `src/utils/utils.ts` `getPosts()` |
| `transliteration` | — | Slug/text normalisation |

## Styling

| Package | Version | Role |
| --- | --- | --- |
| `@once-ui-system/core` | ^1.5.6 | Design system: layout primitives, tokens, theming |
| `sass` | 1.86 | `.scss` / `.module.scss` compilation, modern compiler via `sassOptions` |
| `classnames` | — | Conditional class composition |
| `react-icons` | 5.5 | Icon set behind `src/resources/icons.ts` |
| `next/font/google` | (Next 16) | Geist and Geist Mono |
| `src/resources/custom.css` | — | Accent classes `.intro-cyan` / `-amber` / `-violet` / `-emerald` / `-coral` |

## Tooling & quality

| Package | Version | Role |
| --- | --- | --- |
| `@biomejs/biome` | 1.9 | Formatting (`npm run biome-write`) |
| `eslint` | 9 | Linting (`npm run lint`) |
| `typescript` | 5.8 | Type-check gate |
| `cookie` | — | Cookie handling utility (transitive usage in the app shell) |

## Infrastructure & delivery

| Component | Detail | Role |
| --- | --- | --- |
| GitHub Actions | `.github/workflows/deploy.yml` | On push to `main`: Node 20 → `npm install` → `npm run build` → upload `out/` |
| `actions/deploy-pages` | v4 | Publishes the uploaded artifact |
| GitHub Pages | concurrency group `pages` | Hosting; permissions `contents: read`, `pages: write`, `id-token: write` |
| Domains | `harshdipsaha.github.io`, `harshdipsaha.tech` | Public entry points |
| `@vercel/analytics`, `@vercel/speed-insights` | — | Client-side telemetry (works independently of Vercel hosting) |
| `next.config.mjs` | `output: "export"`, `pageExtensions: ts/tsx/md/mdx`, `transpilePackages: ["next-mdx-remote"]`, `images.unoptimized: true` + `remotePatterns` for `www.google.com`, modern Sass compiler | Build configuration |

## Version pins that matter

- **Next 16 + React 19.2.** App Router with Turbopack; Server Components are the
  default, so anything using hooks, `window`, or event handlers must carry
  `"use client"`. This pairing also dictates the static-export constraints.
- **`@once-ui-system/core ^1.5.6`.** Minor-pinned on purpose. The presentation
  layer binds directly to this component API, so a **major** bump is a migration
  project, not a dependency update (see `docs/adr/0001-onceui-nextjs-portfolio-template.md`).
- **Node 20 in CI.** The workflow pins Node 20; local development should match to
  avoid build-only differences.
- **`sass` 1.86.** Configured with the modern compiler through `sassOptions`.

## Upgrade notes / risks

- **Once UI API churn is the primary upgrade risk.** Component props and token
  names can shift between releases; because there is no adapter layer between
  Once UI and the pages, breakage surfaces across the whole `src/components/`
  tree at once. Upgrade behind an effort, not incidentally.
- **`next-mdx-remote` requires `transpilePackages`.** Removing that entry from
  `next.config.mjs` breaks the MDX build. Keep it when editing the config.
- **Sass legacy JS API deprecation is silenced, not fixed.** The modern-compiler
  `sassOptions` suppress the warning path; a future Sass major could still
  require real migration work.
- **`images.unoptimized: true` is not optional** while `output: "export"` is in
  effect. Re-enabling optimization means abandoning the static-export/Pages
  delivery model.
- **`npm install` (not `ci`) in the workflow** means the lockfile is not strictly
  enforced at deploy time; a transitively-loosened dependency can drift between
  local and CI builds.

## Commands

```bash
npm run predev     # sync-me.mjs + sync-gallery.mjs + sync-project-images.mjs
npm run dev        # next dev (Turbopack); predev runs automatically

npm run prebuild   # the three sync scripts + scripts/generate-static.mjs
npm run build      # next build -> out/ ; prebuild runs automatically
npm run export     # static export step
npm run start      # serve the built output

npm run lint       # ESLint 9
npm run biome-write # Biome 1.9 format + safe fixes

npx tsc --noEmit -p tsconfig.json   # type-check gate
```

_Baseline reverse-engineered from the existing codebase on 2026-08-23 (brownfield inception). Depth: standard._
