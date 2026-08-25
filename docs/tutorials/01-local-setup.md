# Tutorial 1: Get the site running locally

By the end of this tutorial you will have the portfolio running on your own machine at `http://localhost:3000`, a clean type-check, and a production build in `out/`.

No prior knowledge of this repo is assumed.

## Prerequisites

- Node.js 20 or newer (`node --version`). CI runs Node 20, so match it.
- git.
- A terminal. Windows PowerShell, macOS Terminal, or any Linux shell all work.

## 1. Clone the repo

```
git clone https://github.com/HARSHDIPSAHA/HARSHDIPSAHA.github.io.git
cd HARSHDIPSAHA.github.io
```

## 2. Install dependencies

```
npm install
```

This takes a minute or two the first time. It installs Next.js 16, React 19.2, TypeScript 5.8, Tailwind CSS v4, Motion, Lenis, the MDX tooling, and — as dev dependencies — `sharp` (for the image build) and `playwright`.

## 3. Start the dev server

```
npm run dev
```

Before `next dev` starts, npm automatically runs the `predev` script:

```
node scripts/build-images.mjs
```

You will see one line scroll past first:

```
images: 8 gallery, 19 projects, 37 encoded
```

That is the image pipeline doing its job. `me.jpg`, `gallery/` and `project_images/` at the repo root are the *sources*; everything under `public/img/` is *generated* from them by sharp — resized, converted to WebP, and listed with its dimensions in `src/data/images.json`. The first run encodes everything (`37 encoded`: 8 gallery images × 2 sizes, 19 project images, the portrait and the Open Graph card); afterwards a cache in `.cache/` makes it near-instant (`0 encoded`). You never hand-edit `public/img/` or `images.json`. See [../reference/build-scripts.md](../reference/build-scripts.md).

## 4. Open the site

Go to `http://localhost:3000`.

Five routes are live, plus one page per project:

- `/` — home: the two-part hero, a brain you scrub through by scrolling, a passage that lights up word by word, three sticky cards, experience, six selected projects, a closing CTA
- `/story` — the about page: portrait, intro, education, achievements, skills
- `/projects` — all 18 projects, newest first
- `/projects/<slug>` — one page per `.mdx` file in `content/projects/`
- `/gallery` — the 8 built gallery images with a lightbox
- `/process` — how this site is made (AI-DLC)

The nav links come from one array — `nav` in `src/content/site.ts`. The footer and the sitemap read the same array. That is the whole routing "configuration".

Scroll the home page. If your OS has "reduce motion" turned on, you will see static sections instead of the animations — that is deliberate, every animated component checks for it.

## 5. Type-check

Stop the dev server (`Ctrl+C`) and run:

```
npm run typecheck
```

No output means no type errors. Site copy in `src/content/site.ts` is TypeScript, and the components destructure it, so removing a field a component needs fails here rather than in the browser.

## 6. Build

```
npm run build
```

`prebuild` re-runs the image build (instant, thanks to the cache), then `next build` produces a fully static site in `out/` — one folder per route, plus `sitemap.xml` and `robots.txt`. That folder is exactly what gets deployed to GitHub Pages; no server is involved. See [../explanation/why-static-export.md](../explanation/why-static-export.md).

Optional: `npm start` serves `out/` locally so you can check the exported site rather than the dev server.

## What you have now

- The site running locally on port 3000.
- An understanding that images flow drop-zone → `scripts/build-images.mjs` → `public/img/` + `src/data/images.json`.
- An understanding that routes are a page file plus a `nav` entry in `site.ts`.
- A clean type-check and a static build in `out/`.

## Next

[Tutorial 2: Add your first project](02-add-your-first-project.md).
