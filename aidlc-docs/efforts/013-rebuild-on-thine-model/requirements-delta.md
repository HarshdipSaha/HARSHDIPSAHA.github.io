# Requirements delta — 013-rebuild-on-thine-model

## NEW

- **R-VIS-1** The home page is a single long-scroll narrative in this order: split italic-serif
  hero, scroll-scrubbed brain sequence with three copy stages, scroll-lit passage, section
  header, sticky card stack, experience, selected projects, serif closing, footer.
- **R-VIS-2** Palette discipline: one ink, one paper, one accent; all other neutrals are paper or
  white at an alpha. No grey ramp, no literal hex in components.
- **R-VIS-3** Display type is the italic serif (`.display`); everything else is the sans. Section
  labels are `.label`. Buttons are pills only (`Pill`).
- **R-MOT-1** Every animated component renders equivalent static markup when
  `prefers-reduced-motion: reduce` is set; Lenis is not mounted in that case.
- **R-MOT-2** Scroll-driven `useTransform` input ranges stay within `[0, 1]`.
- **R-SEQ-1** The brain sequence is committed under `public/brain/` with two size tiers, loads in
  chunks with the first chunk first, and draws the nearest loaded frame so scrubbing never blocks
  on the full download. Total payload ≤ 4 MB.
- **R-SEQ-2** The footer carries the ICBM 152 template's copyright notice.
- **R-IA-1** Routes: `/`, `/story`, `/projects`, `/projects/[slug]`, `/gallery`, `/process`.
  The nav and footer read the same `nav` array in `src/content/site.ts`.

## CHANGED

- **R-CONTENT-1** (effort 003) Content-as-code now means `src/content/site.ts` (plain data) plus
  `content/projects/*.mdx`. `src/resources/content.tsx` and `src/types/content.types.ts` no
  longer exist.
- **R-SYNC-1** (effort 004) The drop-zone contract is unchanged for authors; the publisher is a
  single script, `scripts/build-images.mjs`, writing `public/img/**` and `src/data/images.json`.
- **R-IMG-1..4** (effort 012) Superseded. There is no AVIF ladder or per-image manifest of
  `srcSet`s; images are published once as WebP at a sensible maximum width, with thumbnails for
  the gallery. Explicit `width`/`height` are still emitted from the manifest.
- **R-URL-1** Project URLs are `/projects/<lowercase-filename>`; the previous `/work/<FileName>`
  and `/about` are gone without redirects.

## UNCHANGED / constraints honoured

- `output: "export"`; GitHub Pages deploy workflow untouched.
- AI-DLC lifecycle and the `aidlc-check` CI gate.
- Drop-zone directories and the résumé path.
