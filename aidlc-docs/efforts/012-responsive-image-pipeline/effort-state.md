# Effort 012 — Build-time responsive image pipeline

| Field | Value |
|-------|-------|
| Ref | 012-responsive-image-pipeline |
| Status | complete |
| Depth | standard |
| Opened | 2026-08-25 |
| Closed | 2026-08-25 |
| Baseline | aidlc-docs/inception/ |
| ADRs | none (extends the ADR-covered sync pipeline; no new architectural decision) |
| Commits | see PR "Build-time responsive image pipeline" |
| Reconstructed | no — recorded live |

## Intent

`images.unoptimized: true` is forced by `output: "export"`, so `next/image` does no work and the
`sizes` props already scattered through the components are inert. The site therefore shipped
every image at full intrinsic resolution to every device — `public/images/projects/tinysafetynet.png`
alone was **6.0 MB** on the homepage, and the built export contained **zero** `srcset`.

Optimisation had to live *inside* the drop-zone sync step, not as a one-off conversion: the three
sync scripts re-copy `public/images/**` from the drop-zones on every `predev`/`prebuild`, so any
manual conversion is undone by the next build.

## Stages

| Stage | Outcome |
|-------|---------|
| Effort planning | Defect brief: 6 MB hero image, no `srcset` in `out/`, `sizes` props inert. |
| Functional design | New `scripts/optimize-images.mjs` runs after the three sync scripts. Emits an AVIF + WebP ladder into `public/images/responsive/**` and a manifest at `src/data/image-manifest.json`; rewrites each original in place as an optimised fallback. |
| NFRs | Idempotent and cached (no re-encode on an unchanged build); strictly no visible quality loss; drop-zone workflow unchanged; typecheck and build clean. |
| Code | See units of work. |
| Build & test | `npx tsc --noEmit -p tsconfig.json` clean; `npm run build` succeeds (29 static pages); pipeline run three times, second and third runs encode nothing; PSNR measured for every fallback and every top-rung variant against the pristine sources. |

## Units of work

- [x] `sharp@^0.35.3` added as a devDependency
- [x] `scripts/optimize-images.mjs` — ladder, fallback rewrite, manifest, cache, orphan prune
- [x] `package.json` — `optimize-images` wired into `predev` and `prebuild` after the sync scripts, before `generate-static`; standalone `npm run images:optimize`
- [x] `.gitignore` — `/.cache/` (pipeline state + cached fallbacks)
- [x] `src/data/image-manifest.json` — generated; consumed by components (separate effort)

## Verification

Measured on 33 source images.

| Metric | Before | After |
|---|---|---|
| `public/images/**` originals | 11,195,819 B (10.68 MiB) | 7,612,027 B (7.26 MiB) |
| Responsive ladder | none | 126 files, 8,063,878 B |
| `tinysafetynet.png` | 6,262,472 B | 3,276,212 B fallback (bit-exact) / **36,068 B** at 480w AVIF |
| Sum of all 33 images at ≤480w, best format | 11,195,819 B | 856,494 B (**−92%**) |
| Sum of all 33 images at ≤960w, best format | 11,195,819 B | 1,922,353 B (**−83%**) |
| Explicit `width`/`height` available to components | no | yes, for all 33 |
| Full pipeline run (cold) | — | 29.7 s |
| Re-run after a full sync (warm) | — | 0.23 s, 0 encodes |

Quality: every rewritten fallback is either **bit-exact** (all PNGs — `palette: false` is
load-bearing, sharp turns palette quantisation on implicitly at high `effort`) or ≥ 38.2 dB PSNR
(the three re-encoded JPEGs). Top-rung AVIF ranges 35.5–52.8 dB; top-rung WebP 32.0–46.6 dB.

## Notes

- **Idempotence has two paths.** `.cache/image-pipeline.json` stores, per file, the hash of the
  raw bytes the sync scripts write *and* the hash of the optimised output. If the file on disk
  matches the output hash, the file is skipped outright. If it matches the raw-source hash — which
  is what happens on every build, because the sync scripts re-copy the drop-zone file over our
  optimised one — the optimised fallback is restored from `.cache/images/` with a plain copy
  instead of a fresh encode. That is why a warm run takes 0.23 s and never re-encodes.
- **No compounding generation loss.** A JPEG or WebP fallback is only re-encoded when it must be
  downscaled, or when it is above 0.2 MP *and* wasteful for its pixel count (> 0.15 B/px) *and*
  the re-encode saves ≥ 10 %. Once optimised it falls below those thresholds, so a second lossy
  generation cannot occur even if the cache is deleted.
- **No pessimisation.** A ladder rung is discarded if it is not smaller than the fallback; if a
  format loses at the top rung it is dropped entirely for that image, so the browser is never
  forced to upscale a narrower variant. Nine rungs were rejected this way, and
  `alien-invasion-pygame.png` (already an optimal lossless PNG) legitimately gets no ladder.
- **The 6 MB PNG stays a 3.3 MB PNG on disk** because the fallback is held to bit-exact losslessness
  and a photographic screenshot does not compress further as PNG. It is a compatibility artefact
  only: any browser with AVIF or WebP fetches 36–183 KB instead. Changing the reference from
  `.png` to a lossy format would mean editing `content.tsx`/MDX, which is out of scope here.
- Components are **not** wired to the manifest in this effort — that is deliberate, to keep the
  generation step and the consumption step in separate diffs. `out/index.html` therefore still
  contains zero `srcset` after this change.

## Follow-ups

- Wire `ProjectCard` / gallery / publications to `src/data/image-manifest.json` (`<picture>` with
  the manifest `sources`, plus explicit `width`/`height` for CLS).
- Consider a `gallery.json` orientation field derived from real intrinsic dimensions — the sync
  script currently hardcodes `"horizontal"` for every gallery image.
