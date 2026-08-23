# Reference: build scripts

Four plain `.mjs` files in `scripts/`, run by `node`. No bundler, no TypeScript, no dependencies beyond `node:fs`, `node:path`, `node:url`.

| Script | Reads | Writes | Runs in |
| --- | --- | --- | --- |
| `sync-me.mjs` | `me.jpg` (repo root) | `public/images/me.jpg`, `public/images/og/home.jpg` | `predev`, `prebuild` |
| `sync-gallery.mjs` | `gallery/` | `public/images/gallery/`, `src/data/gallery.json` | `predev`, `prebuild` |
| `sync-project-images.mjs` | `project_images/` | `public/images/projects/` | `predev`, `prebuild` |
| `generate-static.mjs` | `src/app/work/projects/*.mdx` | files under `public/` (sitemap, robots) | `prebuild` only |

All four can be run standalone: `node scripts/<name>.mjs`.

## `sync-me.mjs`

- **Reads:** `me.jpg` at the repo root.
- **Writes:** `public/images/me.jpg` and `public/images/og/home.jpg` — the same file copied twice, avatar and Open Graph image.
- **Runs in:** `predev`, `prebuild`.
- **Behaviour:** creates `public/images/` and `public/images/og/` if missing. If `me.jpg` is absent it logs `sync-me: me.jpg not found at repo root, skipping.` and exits without error.
- **Output line:** `Synced me.jpg from root → public/images/me.jpg and og/home.jpg`

## `sync-gallery.mjs`

- **Reads:** `gallery/`, filtered to extensions `.jpeg` `.jpg` `.png` `.webp` `.gif`, sorted by `localeCompare` with `{ numeric: true }`.
- **Writes:** `public/images/gallery/gallery-N.<ext>` (N is 1-based position after sort) and `src/data/gallery.json`, rewritten in full.
- **Runs in:** `predev`, `prebuild`.
- **Behaviour:** every JSON entry is `{ src, alt: "Gallery", orientation: "horizontal" }`. `alt` and `orientation` are hard-coded — the script does not inspect image dimensions. If `gallery/` does not exist it writes an empty array to `gallery.json`. Destination names are positional, so inserting an earlier-sorting file renumbers the rest.
- **Current count:** 8 images.
- **Output line:** `Synced 8 gallery images from gallery/ → public/images/gallery, wrote gallery.json`

## `sync-project-images.mjs`

- **Reads:** `project_images/`.
- **Writes:** `public/images/projects/`.
- **Runs in:** `predev`, `prebuild`.
- **Current count:** 18 images.
- **Output line:** `Synced 18 project images from project_images/ → public/images/projects/`

Two-pass copy:

1. **`FILE_MAP` pass.** A `const FILE_MAP` at the top of the file maps source filename → destination filename, e.g. `"agentic loan.png": "agentic-loan.png"`. Each mapped source that exists is copied to its mapped name and marked as seen. Mapped entries whose source file is missing are silently skipped.
2. **Fallback pass.** Every remaining file in `project_images/` with a recognised extension is copied under an automatic kebab-case name produced by `toKebab`:
   - whitespace runs → `-`
   - characters outside `[a-z0-9.-]` (case-insensitive) stripped
   - lowercased
   - original extension re-appended

   So `My Project Diagram.PNG` becomes `my-project-diagram.png`.

- **Recognised extensions:** `.jpg` `.jpeg` `.png` `.webp` `.gif`. Anything else is ignored by both passes.
- **If `project_images/` is missing:** logs `sync-project-images: project_images/ not found, skipping.`
- **Nothing is deleted.** Removing a file from `project_images/` does not remove its published copy; delete that by hand or clear the directory.

Add a `FILE_MAP` entry for every new project image. The fallback works, but it makes the published filename a function of the algorithm rather than a stated contract, and your MDX `images:` path has to match it exactly.

## `generate-static.mjs`

- **Reads:** `src/app/work/projects/*.mdx` filenames (slugs only, not frontmatter).
- **Writes:** static build artifacts under `public/` — a `sitemap.xml` over `/`, `/about`, `/work`, `/gallery` plus one URL per project slug, and a `robots.txt`.
- **Runs in:** `prebuild` only — **not** `predev`. Dev servers do not regenerate the sitemap.
- **Behaviour:** `baseURL` is hard-coded as `https://harshdipsaha.github.io`; `lastmod` on every URL is today's date at build time. `/blog` is absent from the route list, matching the toggled-off route.

## Generated paths — never hand-edit

| Path | Owner |
| --- | --- |
| `public/images/me.jpg` | `sync-me.mjs` |
| `public/images/og/home.jpg` | `sync-me.mjs` |
| `public/images/gallery/**` | `sync-gallery.mjs` |
| `src/data/gallery.json` | `sync-gallery.mjs` |
| `public/images/projects/**` | `sync-project-images.mjs` |
| `public/sitemap.xml`, `public/robots.txt` | `generate-static.mjs` |
| `out/` | `next build` |
| `.next/`, `node_modules/`, `tsconfig.tsbuildinfo` | tooling |

To change any of these, change the source: the drop-zone, the script, or `src/resources/content.tsx`.
