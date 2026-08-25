# Requirements delta — 012-responsive-image-pipeline

## NEW

- **R-IMG-1** Every raster image published under `public/images/**` must also be emitted as an
  AVIF and a WebP ladder at 480 / 960 / 1440 px plus the source's intrinsic width (capped at
  1920 px), never upscaled.
- **R-IMG-2** A generated manifest (`src/data/image-manifest.json`) must expose, per public image
  path: intrinsic `width`/`height`, aspect ratio, fallback byte size, and ready-to-use `srcSet`
  strings per format, so components can set explicit dimensions and eliminate layout shift.
- **R-IMG-3** The pipeline must be idempotent and cached: an unchanged image must not be
  re-encoded on a subsequent `predev`/`prebuild`.
- **R-IMG-4** A ladder rung must never be published if it is larger than the fallback it replaces.

## CHANGED

- **R-SYNC-1** (effort 004) The drop-zone sync contract is unchanged for authors — dropping a file
  in `project_images/` or `gallery/` still Just Works — but `public/images/**` is now optimised
  output, not a byte-for-byte copy of the drop-zone file.

## UNCHANGED / constraints honoured

- `output: "export"` and `images.unoptimized: true` remain; no runtime image service is introduced.
- No new production dependency: `sharp` is a devDependency, used only at build time.
