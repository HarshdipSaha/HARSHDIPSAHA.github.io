# Requirements delta — 039-og-images

## NEW

- **R-OG-1** Every project case study must have a dedicated Open Graph card generated at
  build time: `public/img/og/<slug>.png`, 1200×630, one per `content/projects/*.mdx`, slug
  = the lowercased MDX filename (same rule as the route slug).
- **R-OG-2** The card must use only the site's three palette colours (`--color-ink`
  #171519 ground, `--color-paper` #ebe5e1 text, `--color-tangerine` #f49752 accent), the
  display face (Instrument Serif italic) for the title, and the body face (Commissioner)
  for the summary and domain mark — no ad-hoc colours or fonts.
- **R-OG-3** `generateMetadata` in `src/app/projects/[slug]/page.tsx` must point
  `openGraph.images` and `twitter.images` at the per-slug card with explicit
  width/height/alt and an absolute URL (via `metadataBase`/`person.siteUrl`, never a
  hardcoded host), and must fall back to the project's existing banner image, then (by
  inheriting from the root layout) to the site-wide `og.jpg`, for any project without a
  generated card.
- **R-OG-4** The generator must run on `predev`/`prebuild` in the same process as
  `scripts/build-images.mjs`, be idempotent, and skip re-rendering a card whose inputs
  (title, summary, year, the generator's own source, the font files) are unchanged from
  the last run, via a `.cache/` fingerprint file — mirroring `build-images.mjs`'s existing
  cache contract so a warm build stays fast.
- **R-OG-5** Fonts must be sourced as licensable TTF/OTF/WOFF files satori can consume
  directly (not WOFF2, not Google Fonts' CSS `@font-face` delivery), under an OFL or
  equivalent redistributable licence, with the licence origin traceable — met here via
  `@fontsource/instrument-serif` and `@fontsource/commissioner` as devDependencies (both
  OFL), the same two faces the site already ships via `next/font/google`.

## CHANGED

- **R-OG-6** (extends the OG setup verified complete in effort 032) The site-wide
  `public/img/og.jpg` (built by `build-images.mjs` from `me.jpg`) remains the fallback
  image for `/`, `/story`, `/gallery`, `/process`, and any project page whose per-slug
  card is missing — it is not replaced, only superseded per-project where a card exists.
- **R-OG-7** `generateMetadata` in `[slug]/page.tsx` previously emitted `openGraph.images`
  only, with no `openGraph.type` and no `twitter` block at all (silently inheriting the
  root layout's `website`/`summary_large_image` twitter card but never overriding
  title/description/image for the article itself). Now emits `openGraph.type: "article"`
  plus a complete per-project `twitter: { card: "summary_large_image", title,
  description, images }` block.

## UNCHANGED / constraints honoured

- `output: "export"` — the existence check (`existsSync`) and all image generation happen
  at build time inside `generateMetadata`/the `prebuild` script, never at request time;
  there is no server runtime to do this in.
- `public/img/**` stays gitignored and generated-only; `public/img/og/` is a new
  subdirectory under that existing boundary, not a new top-level exception.
- No change to `src/content/site.ts` copy, no new route, no `nav` entry — this effort
  touches only build tooling and metadata generation for the existing `/projects/[slug]`
  route.
- Card copy (title, summary) is read verbatim from each project's existing MDX
  frontmatter — no new prose is authored by this effort, so the factuality evidence rule
  is unaffected (nothing new to fact-check; the summary already appears verbatim on the
  page itself).
