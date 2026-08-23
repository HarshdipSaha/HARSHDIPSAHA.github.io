# CONTEXT.md

Durable project context and shared vocabulary. Read this before writing an effort, an ADR, or new copy.

## What this site is

Harshdip Saha's personal portfolio and public research surface. It is both a CV-replacement and a showcase of how the work is produced — projects, research interests, and the AI-DLC practice applied to the repo itself.

- **Owner:** Harshdip Saha — CSE @ NSUT, undergraduate researcher at NexGenLab NSUT, AI-DLC pilot team intern at Optum.
- **Audience:** research supervisors and lab admissions, recruiters and hiring engineers, collaborators, and agents maintaining this repo.
- **Hosting:** static export deployed to GitHub Pages. `https://harshdipsaha.github.io`, custom domain `https://harshdipsaha.tech/`.
- **Bias:** substance over motion. Fast, legible, accessible, no server dependency.

## Information architecture

| Route | Source | State |
|---|---|---|
| `/` | `home` in `src/resources/content.tsx`, `src/app/page.tsx` | Live — intro, accent-span headline, featured work |
| `/about` | `about` in `content.tsx` + `src/components/about/*` | Live — TableOfContents, TechStackStrip, ResearchInterestsBlock |
| `/work` | 18 MDX files in `src/app/work/projects/` | Live — index + one page per project |
| `/gallery` | `src/data/gallery.json` (generated) | Live |
| `/blog` | `src/app/blog/posts/*.mdx` | **Disabled** — route toggled off; posts retained |
| `/process` | `process` in `content.tsx`, `src/app/process/page.tsx` | Live — the AI-DLC / how-the-work-is-made page |
| 404 | `src/app/not-found.tsx` | Live |

A route is live only when it is enabled in the `routes` map of `src/resources/once-ui.config.ts` **and** linked from `src/components/Header.tsx`.

## Content pipeline

```
drop-zone            sync script                     generated               consumed by
---------            -----------                     ---------               -----------
me.jpg           ->  scripts/sync-me.mjs          -> public/images/me.jpg  -> content.tsx (person.avatar)
                                                     public/images/og/home.jpg
gallery/         ->  scripts/sync-gallery.mjs     -> public/images/gallery/ -> /gallery page
                                                     src/data/gallery.json
project_images/  ->  scripts/sync-project-images  -> public/images/projects/ -> project MDX `images[]`
                     (explicit FILE_MAP)
```

Text follows a parallel path: `src/resources/content.tsx` (typed by `src/types/content.types.ts`) and project MDX frontmatter, read by `src/utils/utils.ts` (`getPosts`), rendered through `src/components/mdx.tsx` into Once UI primitives. `scripts/generate-static.mjs` runs at `prebuild` for build-time static generation.

All three sync scripts run automatically on `predev` and `prebuild`. That is why `public/images/**` and `src/data/gallery.json` are never edited by hand — the next command regenerates them.

## Glossary

| Term | Meaning |
|---|---|
| Effort | A numbered unit of work under `aidlc-docs/efforts/NNNN-<slug>/`; the atom of AI-DLC in this repo. |
| Inception | The opening doc of an effort: intent, scope, non-goals, depth dial, approval gate. |
| Baseline | The recorded state of the code before an effort starts, so drift is provable afterwards. |
| ADR | Architecture Decision Record in `docs/adr/NNNN-*.md`: context, decision, consequences; immutable once accepted. |
| Drop-zone | A source-of-truth folder a human drops raw assets into — `gallery/`, `project_images/`, root `me.jpg`. |
| Sync script | A `scripts/sync-*.mjs` file that copies drop-zone assets into `public/` and emits derived data. |
| Content-as-code | The rule that site copy lives in typed `src/resources/content.tsx` / MDX, never inline in components. |
| Once UI | `@once-ui-system/core` — the design-system primitives and tokens this site renders through. |
| Static export | `output: "export"` — the whole site prerenders to `out/`; no server runtime, no API routes, no SSR. |
| Depth dial | The per-effort setting for how much ceremony to apply, from a quick edit to full inception + ADR + review. |
| Approval gate | An explicit human checkpoint in an effort; work does not proceed past it unsupervised. |
| Project MDX | A file in `src/app/work/projects/` with frontmatter `title, publishedAt, summary, images[], link`. |
| Route toggle | The `routes` map entry in `src/resources/once-ui.config.ts` that enables a path; needs a matching Header link. |
| FILE_MAP | The explicit source-name-to-kebab-destination map at the top of `scripts/sync-project-images.mjs`. |
| Accent span | A `.intro-*` class in `src/resources/custom.css` (cyan/amber/violet/emerald/coral) used to color headline words. |
| aidlc-check | The CI gate (`.github/workflows/aidlc-check.yml` → `scripts/check-aidlc-sync.mjs`) that fails a PR whose substantive diff ships without an `aidlc-docs/` update. `[trivial]` in the PR title is the only escape hatch (ADR 0009). |
