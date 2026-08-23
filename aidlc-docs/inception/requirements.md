# Inception — Requirements Baseline

## Purpose & audience

This is the personal portfolio site of Harshdip Saha, deployed at
<https://harshdipsaha.github.io> and <https://harshdipsaha.tech/>. Its job is to
present, in one static, fast-loading place: who the owner is, what he has built
(17 project write-ups), what he researches, and how to contact or hire him. The
owner is a pre-final-year B.Tech CSE (AI) student at NSUT Delhi (GPA 8.78,
graduating 2027), UG researcher at NexGenLab NSUT, and AI Engineer Intern on
Optum's AI-DLC pilot team.

The primary audience is recruiters and hiring managers screening for SDE and
research internships; the secondary audience is research collaborators and
peers. Every requirement below is reverse-engineered from code that already
exists — this is a brownfield baseline, not a forward plan.

## Functional requirements

| ID | Requirement | Status | Where it lives |
| --- | --- | --- | --- |
| FR-01 | Landing page renders a headline, subline and a featured link driven entirely by config, not hard-coded JSX | Implemented | `src/app/page.tsx`, `src/resources/content.tsx` (`home`) |
| FR-02 | About page renders an intro section | Implemented | `src/app/about/page.tsx`, `content.tsx` (`about.intro`) |
| FR-03 | About page renders work experience entries | Implemented | `src/app/about/page.tsx`, `content.tsx` (`about.work`) |
| FR-04 | About page renders studies/education entries | Implemented | `src/app/about/page.tsx`, `content.tsx` (`about.studies`) |
| FR-05 | About page renders a technical skills strip | Implemented | `src/components/about/TechStackStrip.tsx`, `content.tsx` (`about.technical`) |
| FR-06 | About page renders a research-interests block | Implemented | `src/components/about/ResearchInterestsBlock.tsx`, `content.tsx` (`about.researchInterests`) |
| FR-07 | About page provides a table of contents for its sections | Implemented | `src/components/about/TableOfContents.tsx` |
| FR-08 | Work index lists all projects sourced from MDX files | Implemented | `src/app/work/page.tsx`, `src/components/work/Projects.tsx`, `src/utils/utils.ts` |
| FR-09 | Per-project detail pages generated statically from MDX slugs | Implemented | `src/app/work/[slug]/page.tsx`, `src/app/work/projects/*.mdx` (17 files) |
| FR-10 | Gallery page displays a curated image set | Implemented | `src/app/gallery/page.tsx`, `src/components/gallery/GalleryView.tsx`, `src/data/gallery.json` (8 images) |
| FR-11 | Blog index and per-post pages | **Deferred** — built but route disabled (`routes["/blog"] === false`) | `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/blog/posts/*.mdx` (3 posts) |
| FR-12 | Light/dark theme switching, user-toggleable | Implemented | `src/components/ThemeToggle.tsx`, `src/components/Providers.tsx`, `once-ui.config.ts` (`display.themeSwitcher`) |
| FR-13 | Responsive layout across viewport sizes | Implemented | Once UI primitives + `*.module.scss` / component `.scss` files |
| FR-14 | Résumé available as a direct download | Implemented | `public/resume.pdf`, linked from `content.tsx` |
| FR-15 | Social/contact links rendered from a single typed list | Implemented | `content.tsx` (`social[]`), `src/resources/icons.ts`, `src/components/Footer.tsx` |
| FR-16 | Per-page SEO metadata, Open Graph images and structured-data schema | Implemented | `src/utils/meta.ts`, `once-ui.config.ts` (`schema`), `public/images/og/home.jpg` |
| FR-17 | Custom 404 page | Implemented | `src/app/not-found.tsx` |
| FR-18 | `/process` page documenting the owner's working method | **Partial** — current effort; requires both the `routes` toggle and a `Header.tsx` nav entry | `src/resources/once-ui.config.ts`, `src/components/Header.tsx` |

## Non-functional requirements

| ID | Requirement | Target | How it's met |
| --- | --- | --- | --- |
| NFR-01 | Zero-ops hosting cost | $0/month, no servers to patch | GitHub Pages serving a prebuilt `out/` directory |
| NFR-02 | No server runtime | 100% static assets | `next.config.mjs` `output: "export"`; no API routes, no server actions |
| NFR-03 | CI build duration | A few minutes on a GitHub-hosted runner | `npm install` + `npm run build` on Node 20; Turbopack build |
| NFR-04 | Type safety is a release gate | `npx tsc --noEmit -p tsconfig.json` exits clean | TypeScript 5.8 strict contracts in `src/types/content.types.ts` and `src/types/config.types.ts` |
| NFR-05 | Accessibility | Semantic heading order, alt text on images, keyboard-reachable nav | Once UI primitives, `HeadingLink`, MDX `images[]` with alt text |
| NFR-06 | Performance | Static delivery over CDN; image optimization deliberately traded away | `images.unoptimized: true` (required by static export); no client data fetching on first paint |
| NFR-07 | Maintainability / content-as-code | One edit site per content shape | `src/resources/content.tsx` is the single source of site copy; projects and posts are MDX files |
| NFR-08 | Portability | No vendor lock beyond GitHub Pages | Plain Next.js static export; `out/` is deployable to any static host |
| NFR-09 | Consistent formatting and lint | No style drift across contributors | Biome 1.9 (`npm run biome-write`), ESLint 9 (`npm run lint`) |
| NFR-10 | Deterministic assets | Generated assets always match their drop-zone sources | `predev`/`prebuild` run the three sync scripts before every dev/build |

## Constraints

- Static export forbids API routes, server actions, ISR, middleware-driven
  rewrites, and `next/image` optimization. Anything dynamic must be client-side
  or precomputed at build time.
- GitHub Pages serves the contents of `out/`; nothing outside that directory
  reaches production.
- Any content change — including a typo in `content.tsx` — requires a full
  rebuild and redeploy via the `main`-branch workflow.
- Once UI (`@once-ui-system/core ^1.5.6`) is an external dependency whose API
  shape the presentation layer depends on directly; upstream churn is a
  maintenance liability (see ADR 0001).
- Images must enter through the drop-zones (`gallery/`, `project_images/`,
  root `me.jpg`) — files written directly into `public/images/` are liable to be
  overwritten by the sync scripts.
- A new route is not live until it is toggled in `once-ui.config.ts` **and**
  hand-wired into `src/components/Header.tsx`.

## Out of scope

- CMS or admin UI — content is edited as code.
- Authentication, user accounts, gated content.
- Comments, reactions, or any user-generated content.
- Server-side search or a search index API.
- Internationalisation / multi-locale routing.
- E-commerce, payments, or any transactional flow.

_Baseline reverse-engineered from the existing codebase on 2026-08-23 (brownfield inception). Depth: standard._
