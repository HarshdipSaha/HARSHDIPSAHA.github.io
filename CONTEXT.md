# CONTEXT.md

Durable project context and shared vocabulary. Read this before writing an effort, an ADR, or new copy.

## What this site is

Harshdip Saha's personal portfolio and public research surface. It is both a CV-replacement and a showcase of how the work is produced — projects, research interests, and the AI-DLC practice applied to the repo itself.

- **Owner:** Harshdip Saha — CSE @ NSUT, undergraduate researcher at NexGenLab NSUT and IIT Madras, AI-DLC pilot team intern at Optum.
- **Audience:** research supervisors and lab admissions, recruiters and hiring engineers, collaborators, and agents maintaining this repo.
- **Hosting:** static export deployed to GitHub Pages. `https://harshdipsaha.github.io`, custom domain `https://harshdipsaha.tech/`.
- **Bias:** cinematic and motion-led, modelled on https://www.thine.com/ (ADR 0011) — one dark tinted page, serif-italic display type, a scroll-scrubbed brain, sticky scaling cards. Still static, still accessible: every animation honours `prefers-reduced-motion`, nothing needs a server.

## Information architecture

| Route | Source | State |
|---|---|---|
| `/` | `src/app/page.tsx`; `hero`, `sequence`, `passage`, `threads`, `experience`, `selectedProjects`, `closing` in `src/content/site.ts` | Live — hero, brain sequence with three overlays, scroll-lit passage, three-card stack, experience, six selected projects, closing CTA |
| `/story` | `src/app/story/page.tsx`; `story`, `publication`, `person` in `site.ts`; portrait from `images.json` | Live — the about page, 640px measure |
| `/projects` | `src/app/projects/page.tsx`; 18 MDX files in `content/projects/` | Live — grid of all projects, newest first |
| `/projects/[slug]` | `src/app/projects/[slug]/page.tsx`; slug = lowercased MDX filename | Live — one page per project, MDX body via `next-mdx-remote/rsc` |
| `/gallery` | `src/app/gallery/page.tsx`; `gallery[]` in `src/data/images.json` (generated) | Live — masonry grid + native `<dialog>` lightbox |
| `/process` | `src/app/process/page.tsx`; `process` in `site.ts` | Live — the AI-DLC / how-the-work-is-made page |
| 404 | `src/app/not-found.tsx` | Live |
| `/sitemap.xml`, `/robots.txt` | `src/app/sitemap.ts`, `src/app/robots.ts` (`force-static`) | Live — sitemap = `/` + `nav` + every project slug |
| — | `content/writing/*.mdx` (three old blog posts) | **Not rendered** — kept as content only; no route reads them |

A route is reachable when `src/app/<route>/page.tsx` exists **and** it has an entry in the `nav` array of `src/content/site.ts`. `Nav.tsx`, `Footer.tsx` and `sitemap.ts` all read that one array; there is no route toggle.

## Content pipeline

```
drop-zone            build step                          generated                     consumed by
---------            ----------                          ---------                     -----------
me.jpg           ->  scripts/build-images.mjs        ->  public/img/me.webp        ->  /story portrait (images.me)
                                                          public/img/og.jpg             Open Graph card (layout.tsx)
gallery/*.jpeg   ->  scripts/build-images.mjs        ->  public/img/gallery/NN.webp ->  /gallery, card-stack photos
                                                          public/img/gallery/NN-s.webp   (images.gallery[])
project_images/  ->  scripts/build-images.mjs        ->  public/img/projects/<slug>.webp -> project MDX `images[]`,
                     (explicit PROJECT_MAP)                                              /projects grid (images.projects)
                                                     ->  src/data/images.json (manifest, committed)
                                                     ->  .cache/images.json (mtime cache, gitignored)

ICBM 152 T1      ->  scripts/render-brain-frames.py  ->  public/brain/{1080,640}/NNN.webp  ->  home/BrainSequence.tsx
(63 MB, manual)      (Python; run by hand)               public/brain/manifest.json          (frames are committed)
```

Text follows a parallel path: `src/content/site.ts` (plain TypeScript objects, one export per section) and `content/projects/*.mdx` (frontmatter `title, publishedAt, summary, images[], link`), read by `src/lib/projects.ts` (`getProjects`, `getProject`, `getProjectsBySlugs`) with `gray-matter`, rendered through `next-mdx-remote/rsc` + `remark-gfm` inside `.prose`.

`build-images.mjs` runs automatically on `predev` and `prebuild` (or `npm run images`). That is why `public/img/**`, `.cache/` and `src/data/images.json` are never edited by hand — the next command regenerates them. `resume.pdf` at the root is copied to `public/resume.pdf` and committed directly.

## Glossary

| Term | Meaning |
|---|---|
| Effort | A numbered unit of work under `aidlc-docs/efforts/NNN-<ref>/`; the atom of AI-DLC in this repo. |
| Inception | The opening doc of an effort: intent, scope, non-goals, depth dial, approval gate. |
| Baseline | The recorded state of the code before an effort starts, so drift is provable afterwards. |
| ADR | Architecture Decision Record in `docs/adr/NNNN-*.md`: context, decision, consequences; immutable once accepted. ADR 0011 is the current design. |
| Drop-zone | A source-of-truth folder a human drops raw assets into — `gallery/`, `project_images/`, root `me.jpg`. |
| `site.ts` | `src/content/site.ts` — every word on the site that is not a project case study, as typed TypeScript exports (`person`, `nav`, `hero`, `sequence`, `passage`, `threads`, `experience`, `selectedProjects`, `closing`, `story`, `publication`, `footer`, `process`). |
| Content-as-code | The rule that site copy lives in `site.ts` / MDX, never inline in components. |
| Project MDX | A file in `content/projects/` with frontmatter `title, publishedAt, summary, images[], link`. Lowercased filename = URL slug. |
| `PROJECT_MAP` | The explicit `"source filename" -> "slug"` map at the top of `scripts/build-images.mjs`. Unmapped files fall back to a kebab-case of the filename. |
| `images.json` | `src/data/images.json` — the committed manifest `build-images.mjs` writes: `{ gallery: [{src, thumb, w, h}], projects: {slug: {src, w, h}}, me: {src, w, h} }`. Read via `src/lib/projects.ts`. |
| Static export | `output: "export"` — the whole site prerenders to `out/`; no server runtime, no API routes, no SSR. |
| Depth dial | The per-effort setting for how much ceremony to apply, from a quick edit to full inception + ADR + review. |
| Approval gate | An explicit human checkpoint in an effort; work does not proceed past it unsupervised. |
| Ink / paper / tangerine | The three colours. `--color-ink` (#171519) is the page; `--color-paper` (#ebe5e1) is text; `--color-tangerine` (#f49752) is the only accent (primary pill CTA, small marks). Every other neutral is paper/white at an alpha — no grey ramp. Defined in `@theme` in `src/app/globals.css`. |
| `.display` | The display type utility: Instrument Serif, always italic, -0.03em tracking, line-height 0.95, balanced wrapping. Headlines and the wordmark. |
| Label | The section eyebrow: `.label` (13px caps, 0.2em tracking, 45% paper), or the `<Label>` primitive in `src/components/ui.tsx`. |
| Pill | The only button shape on the site — `<Pill>` in `ui.tsx`, variants `glass` (default), `accent` (tangerine), `ghost`; used for nav links and every CTA. |
| Reveal / TextAnimate / ScrollWords | The three motion primitives in `src/components/motion/`. `Reveal` (+ `Group`/`Item`) is the blur-diagonal enter-on-view used by every section; `TextAnimate` is the per-word blur-in (hero); `ScrollWords` lights words up as the passage scrolls. All render static markup under `useReducedMotion()`. |
| Brain sequence | `src/components/home/BrainSequence.tsx` — 160 axial slices of the ICBM 152 template (`public/brain/`) scrubbed on scroll via a canvas, with three copy overlays from `sequence.stages`. Frames are committed; the footer carries the template's copyright notice. |
| Card stack | `src/components/home/CardStack.tsx` — three full-height sticky cards (`threads.cards`) that pin in turn and scale down a notch as the next arrives. |
| Progressive blur | The nav backdrop in `Nav.tsx`: eight stacked `backdrop-filter` layers, each masked to a band, so the blur ramps instead of stopping at an edge. |
| Lenis | `lenis/react` smooth scroll wrapped by `src/components/SmoothScroll.tsx`; disabled when `prefers-reduced-motion` is set. |
| aidlc-check | The CI gate (`.github/workflows/aidlc-check.yml` → `scripts/check-aidlc-sync.mjs`) that fails a PR whose substantive diff ships without an `aidlc-docs/` update. `[trivial]` in the PR title is the only escape hatch (ADR 0009). |
