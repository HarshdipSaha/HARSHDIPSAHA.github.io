# Inception — Component Inventory

Every component, script and module that ships in this repo, grouped by role.
Paths are relative to the repo root.

## Pages (App Router)

| Component | File | Responsibility | Notes |
| --- | --- | --- | --- |
| Root layout | `src/app/layout.tsx` | HTML shell, fonts, providers, header/footer, analytics | Mounts `@vercel/analytics` + `@vercel/speed-insights` |
| Home | `src/app/page.tsx` | Headline, subline, featured link | Driven by `content.home` |
| About | `src/app/about/page.tsx` | Intro, work experience, studies, tech stack, research interests | Composes the three hand-written about components |
| Work index | `src/app/work/page.tsx` | Lists all projects | Reads MDX via `getPosts()` |
| Work detail | `src/app/work/[slug]/page.tsx` | Renders one project | Static params over the 17 MDX slugs |
| Blog index | `src/app/blog/page.tsx` | Lists posts | Route disabled (`routes["/blog"] === false`) |
| Blog detail | `src/app/blog/[slug]/page.tsx` | Renders one post | Route disabled; 3 MDX posts exist |
| Gallery | `src/app/gallery/page.tsx` | Image grid | Reads `src/data/gallery.json` |
| Not found | `src/app/not-found.tsx` | Custom 404 | Emitted as a static `404.html` |
| Process | `src/app/process/page.tsx` | Documents the owner's working method | **Being added by the current effort**; needs both the `routes` toggle and a `Header.tsx` entry |

## Layout & chrome

| Component | File | Responsibility | Notes |
| --- | --- | --- | --- |
| Header | `src/components/Header.tsx` | Top nav, theme control mount, optional location/time display | Nav links are **hand-wired**; the `routes` toggle alone does not add a link |
| Footer | `src/components/Footer.tsx` | Social links, attribution | Renders `content.social[]` through `icons.ts` |
| ThemeToggle | `src/components/ThemeToggle.tsx` | Light/dark switch | Gated by `display.themeSwitcher` |
| Providers | `src/components/Providers.tsx` | Once UI + theme context wrapper | Client component |
| RouteGuard | `src/components/RouteGuard.tsx` | Blocks disabled and protected routes client-side | Reads `routes` / `protectedRoutes` |
| ScrollToHash | `src/components/ScrollToHash.tsx` | Scrolls to `#anchor` on navigation | Pairs with `HeadingLink` |
| Mailchimp | `src/components/Mailchimp.tsx` | Newsletter subscribe form | Driven by `content.newsletter`; external endpoint |

## About-page components

All three are **hand-written for this site — not part of the upstream template.**

| Component | File | Responsibility | Notes |
| --- | --- | --- | --- |
| TableOfContents | `src/components/about/TableOfContents.tsx` | Section index for the about page | Depends on stable heading ids |
| TechStackStrip | `src/components/about/TechStackStrip.tsx` (+ `.scss`) | Renders the technical-skills strip | Sourced from `content.about.technical` |
| ResearchInterestsBlock | `src/components/about/ResearchInterestsBlock.tsx` (+ `.scss`) | Renders research interest groupings | Sourced from `content.about.researchInterests` |
| About styles | `src/components/about/about.module.scss` | Page-scoped styling | Module scope; no globals |

## Work components

| Component | File | Responsibility | Notes |
| --- | --- | --- | --- |
| Projects | `src/components/work/Projects.tsx` (+ `.scss`) | Maps a project list to cards, handles ordering/range | Takes `getPosts()` output |
| ProjectCard | `src/components/ProjectCard.tsx` | Single project tile: images, title, summary, link | Consumes MDX frontmatter fields |

## Blog components

Route is disabled; these are live code but unreachable in production.

| Component | File | Responsibility | Notes |
| --- | --- | --- | --- |
| Posts | `src/components/blog/Posts.tsx` | Lists posts | Same `getPosts()` mechanism as work |
| Post | `src/components/blog/Post.tsx` | Single post preview/tile | — |
| ShareSection | `src/components/blog/ShareSection.tsx` | Share links for a post | — |

## Gallery

| Component | File | Responsibility | Notes |
| --- | --- | --- | --- |
| GalleryView | `src/components/gallery/GalleryView.tsx` | Renders the image grid | Data comes from the generated `src/data/gallery.json` (8 images) |

## MDX rendering

| Component | File | Responsibility | Notes |
| --- | --- | --- | --- |
| MDX component map | `src/components/mdx.tsx` | Maps MDX elements to Once UI / local components | Rendered through `next-mdx-remote`; requires `transpilePackages` |
| HeadingLink | `src/components/HeadingLink.tsx` | Anchored, linkable headings | Supplies the ids the about TOC and `ScrollToHash` rely on |

## Utilities

| Module | File | Responsibility | Notes |
| --- | --- | --- | --- |
| `getPosts()` | `src/utils/utils.ts` | Reads an MDX directory, parses frontmatter with `gray-matter`, returns `{ metadata, content }` | Tolerates `subtitle`, `team`, `tag` beyond the core contract |
| `formatDate` | `src/utils/formatDate.ts` | Human-readable dates from `publishedAt` | — |
| meta helpers | `src/utils/meta.ts` | Builds per-page metadata / OG tags | Feeds Next.js `metadata` exports |

## Build scripts

| Script | File | Reads | Writes |
| --- | --- | --- | --- |
| Sync me | `scripts/sync-me.mjs` | root `me.jpg` | `public/images/me.jpg`, `public/images/og/home.jpg` |
| Sync gallery | `scripts/sync-gallery.mjs` | `gallery/` | `public/images/gallery/`, `src/data/gallery.json` (8 images) |
| Sync project images | `scripts/sync-project-images.mjs` | `project_images/` via an explicit `FILE_MAP` | `public/images/projects/` (18 images) |
| Generate static | `scripts/generate-static.mjs` | build inputs | Build-time static generation; wired to `prebuild` only, not `predev` |

## Content & config modules

| Module | File | Responsibility | Notes |
| --- | --- | --- | --- |
| Content | `src/resources/content.tsx` | **Single source of truth for site copy**: `person`, `social[]`, `newsletter`, `home`, `about` (intro / work / studies / technical / researchInterests), `blog`, `work`, `gallery` | Typed against `content.types.ts` |
| Once UI config | `src/resources/once-ui.config.ts` | `baseURL`, `routes`, `display`, `protectedRoutes`, `fonts`, `style`, `schema`, `effects` | `"/blog"` is `false`; all other routes true |
| Icon registry | `src/resources/icons.ts` | Maps icon names to `react-icons` components | Referenced by `social[]` and MDX |
| Custom CSS | `src/resources/custom.css` | Accent span classes `.intro-cyan`, `.intro-amber`, `.intro-violet`, `.intro-emerald`, `.intro-coral` | Used inside `content.tsx` copy |
| Content types | `src/types/content.types.ts` | `Person`, `Social`, `Home`, `About`, `Blog`, `Work`, `Gallery` | The main seam between content and presentation |
| Config types | `src/types/config.types.ts` | Typed contracts for the Once UI config | — |

## Extension points

| To add… | Do this |
| --- | --- |
| A project | Create `src/app/work/projects/<slug>.mdx` with frontmatter `title`, `publishedAt`, `summary`, `images[]`, `link`. Drop its image into `project_images/` and register it in the `FILE_MAP` in `scripts/sync-project-images.mjs`. |
| A gallery image | Drop the file into `gallery/`, then run `npm run predev` (or any build) — `sync-gallery.mjs` copies it and regenerates `src/data/gallery.json`. Do not edit that JSON. |
| A route | Add `src/app/<route>/page.tsx`, set the flag in `routes` in `src/resources/once-ui.config.ts`, **and** add the nav link in `src/components/Header.tsx`. |
| An about section | Add the typed field to `src/types/content.types.ts`, populate it in `src/resources/content.tsx`, build a component under `src/components/about/`, render it from `src/app/about/page.tsx`, and register its heading with the `TableOfContents`. |
| A new accent colour | Add an `.intro-*` class to `src/resources/custom.css` and use the span in `content.tsx`. |

_Baseline reverse-engineered from the existing codebase on 2026-08-23 (brownfield inception). Depth: standard._
