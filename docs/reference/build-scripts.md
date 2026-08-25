# Reference: build scripts

Three files in `scripts/`. Two run under `node`, one under Python.

| Script | Reads | Writes | Runs in |
| --- | --- | --- | --- |
| `build-images.mjs` | `me.jpg`, `gallery/`, `project_images/`, `.cache/images.json` | `public/img/**`, `src/data/images.json`, `.cache/images.json` | `predev`, `prebuild`, `npm run images` |
| `render-brain-frames.py` | ICBM 152 NLIN SYM 2009a T1 + mask (`.nii`, downloaded by hand) | `public/brain/1080/NNN.webp`, `public/brain/640/NNN.webp`, `public/brain/manifest.json` | Manual only; output is committed |
| `check-aidlc-sync.mjs` | `git diff --name-only <base>...HEAD`, env `BASE_REF`, `PR_TITLE`, `TRIVIAL` | nothing (exit code) | `.github/workflows/aidlc-check.yml` on PRs to `main`; `npm run check:aidlc` |

## `build-images.mjs`

- **Dependencies:** `sharp` (devDependency), `node:fs/promises`, `node:crypto`, `node:path`.
- **Runs in:** `predev`, `prebuild`, `npm run images`. Standalone: `node scripts/build-images.mjs`.
- **Output line:** `images: 8 gallery, 19 projects, <n> encoded` — `encoded` is how many files were actually re-encoded this run (0 on a warm cache).

Three passes, then the manifest:

1. **Gallery.** Reads `gallery/`, keeps files matching `/\.(jpe?g|png|webp)$/i`, sorts by filename. For the `i`-th file (1-based, zero-padded to two digits) writes `public/img/gallery/NN.webp` (fit inside 1600×1600, q80) and `public/img/gallery/NN-s.webp` (inside 640×640, q74). Manifest entry: `{ src, thumb, w, h }` with the full image's encoded dimensions. Numbering is positional.
2. **Projects.** Reads every file in `project_images/` (no extension filter — sharp must be able to open it). Slug = `PROJECT_MAP[filename]`, else `basename(filename, ext).toLowerCase().replace(/[^a-z0-9]+/g, "-")`. Writes `public/img/projects/<slug>.webp` (inside 1400×1000, q80). Manifest entry: `projects[slug] = { src, w, h }`.
3. **Portrait.** `me.jpg` → `public/img/me.webp` (inside 960×960) with manifest `me = { src, w, h }`, and `public/img/og.jpg` (cover 1200×630, mozjpeg q82) for Open Graph. `og.jpg` is not in the manifest; `layout.tsx` references it by path.

Then writes `src/data/images.json` (pretty-printed, committed) and `.cache/images.json` (gitignored).

- **Cache.** Each output is keyed by `<dest>@<w>x<h>` and fingerprinted by SHA-1 of `path:size:mtimeMs` of the source. If the fingerprint matches and the destination exists, the encode is skipped and cached `{w, h}` reused. Touching a source file re-encodes it.
- **`sharp(src).rotate()`** applies EXIF orientation, so phone photos land upright. `withoutEnlargement: true` — small sources are not upscaled.
- **`PROJECT_MAP`** is a plain object at the top of the file: `"source name.png": "slug"`. It is the naming contract between `project_images/` and `content/projects/*.mdx` `images[]`. Add an entry per project image.
- **Nothing is deleted.** Stale `.webp` files remain in `public/img/` until the folder is cleared. The manifest is rewritten in full, so it never carries stale keys.
- **If a drop-zone is missing** the script throws (`readdir` on a non-existent directory). All three drop-zones are expected to exist.

## `render-brain-frames.py`

- **Dependencies:** Python 3, `nibabel`, `numpy`, `Pillow`.
- **Usage:** `python scripts/render-brain-frames.py <path-to-mni_icbm152_nlin_sym_09a>` (default `.ref/mni/mni_icbm152_nlin_sym_09a`). The folder must contain `mni_icbm152_t1_tal_nlin_sym_09a.nii` and `..._mask.nii` — a 63 MB download from the McConnell Brain Imaging Centre that is **not** in the repo and **not** fetched by CI.
- **Behaviour:** finds the axial extent of the brain mask, trims 34 slices off the bottom (jaw/sinus) and 2 off the top, windows intensities at the 0.5–99.7 percentiles, and renders 160 evenly spaced slices with a gamma of 0.9, composited onto the page background `#171519` (RGB 23,21,25), padded square, resized with Lanczos to each tier, unsharp-masked, and saved as WebP q80.
- **Writes:** `public/brain/1080/000.webp` … `159.webp`, `public/brain/640/000.webp` … `159.webp` (~3.8 MB total), and `public/brain/manifest.json` = `{"frames": 160, "tiers": {"1080": 1080, "640": 640}, "source": "ICBM 152 NLIN SYM 2009a T1"}`.
- **Committed output.** Unlike `public/img/`, `public/brain/` is checked in, because regenerating it needs the template download. `src/components/home/BrainSequence.tsx` hard-codes `FRAMES = 160` and the `/brain/<tier>/NNN.webp` path — change both together if you change the script.
- **Licence.** The template's licence permits redistribution with its copyright notice. That notice is `footer.colophon[1]` in `src/content/site.ts`. Do not remove it while the frames are shipped.

## `check-aidlc-sync.mjs`

- **Dependencies:** `node:child_process` only.
- **Usage:** `node scripts/check-aidlc-sync.mjs [baseRef]`; `baseRef` defaults to env `BASE_REF`, then `origin/main`. `npm run check:aidlc` is the alias.
- **Behaviour:** lists files changed between `baseRef` and `HEAD`. If any match a *substantive* pattern (`src/`, `scripts/`, `package.json`, `package-lock.json`, `next.config.*`, `tsconfig.json`, `.github/workflows/`) and are not *exempt* (`public/`, `out/`, `gallery/`, `project_images/`, `me.jpg`, `resume.pdf`), then at least one changed path must start with `aidlc-docs/` — otherwise exit 1 with the list of offending files and the five-step lifecycle.
- **Escape hatch:** env `TRIVIAL=1`, or `[trivial]` (case-insensitive) in `PR_TITLE` → exit 0 with a warning. ADR 0009 defines what qualifies.
- **In CI:** `.github/workflows/aidlc-check.yml` runs it on `pull_request` to `main` with `fetch-depth: 0`, `BASE_REF=origin/<base>`, `PR_TITLE=<title>`.

## Generated paths — never hand-edit

| Path | Owner | In git? |
| --- | --- | --- |
| `public/img/me.webp`, `public/img/og.jpg` | `build-images.mjs` | no (gitignored) |
| `public/img/gallery/**` | `build-images.mjs` | no |
| `public/img/projects/**` | `build-images.mjs` | no |
| `src/data/images.json` | `build-images.mjs` | **yes** — so `tsc` resolves the import in a fresh clone |
| `.cache/images.json` | `build-images.mjs` | no |
| `public/brain/**` | `render-brain-frames.py` | **yes** — regeneration needs a 63 MB download |
| `out/` | `next build` | no |
| `.next/`, `node_modules/`, `tsconfig.tsbuildinfo` | tooling | no |

To change any of these, change the source: the drop-zone, the script, or `src/content/site.ts`. `public/resume.pdf` is the one hand-placed file under `public/` — copy the root `resume.pdf` there and commit it.
