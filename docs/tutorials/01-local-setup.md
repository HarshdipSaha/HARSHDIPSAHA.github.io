# Tutorial 1: Get the site running locally

By the end of this tutorial you will have the portfolio running on your own machine at `http://localhost:3000`, a clean type-check, and a production build in `out/`.

No prior knowledge of this repo is assumed.

## Prerequisites

- Node.js 20 or newer (`node --version`). CI runs Node 20, so match it.
- git.
- A terminal. Windows PowerShell, macOS Terminal, or any Linux shell all work.

## 1. Clone the repo

```
git clone https://github.com/HarshdipSaha/HARSHDIPSAHA.github.io.git
cd HARSHDIPSAHA.github.io
```

## 2. Install dependencies

```
npm install
```

This takes a couple of minutes the first time. It installs Next.js 16, React 19.2, TypeScript 5.8, `@once-ui-system/core`, MDX tooling and Biome.

## 3. Start the dev server

```
npm run dev
```

Before `next dev` starts, npm automatically runs the `predev` script, which is three sync scripts in a row:

```
node scripts/sync-me.mjs && node scripts/sync-gallery.mjs && node scripts/sync-project-images.mjs
```

You will see their output scroll past first:

```
Synced me.jpg from root → public/images/me.jpg and og/home.jpg
Synced 8 gallery images from gallery/ → public/images/gallery, wrote gallery.json
Synced 18 project images from project_images/ → public/images/projects/
```

That is the image pipeline doing its job. `me.jpg`, `gallery/` and `project_images/` at the repo root are the *sources*; everything under `public/images/` is *generated* from them. You never hand-edit `public/images/`. See [../reference/build-scripts.md](../reference/build-scripts.md).

## 4. Open the site

Go to `http://localhost:3000`.

Four routes are live:

- `/` — home, headline and featured badge
- `/about` — intro, work experience, studies, tech stack, research interests
- `/work` — the project index, newest first
- `/gallery` — the 8 synced gallery images

There is a fifth route, `/blog`, which is **switched off**. Its posts still exist in `src/app/blog/posts/`, but `"/blog": false` in `src/resources/once-ui.config.ts` keeps it out of the nav. That toggle object is the on/off switch for every route.

Click a project card on `/work` to see its detail page. Each of those pages is one `.mdx` file in `src/app/work/projects/`.

## 5. Type-check

Stop the dev server (`Ctrl+C`) and run:

```
npx tsc --noEmit -p tsconfig.json
```

No output means no type errors. Site copy in `src/resources/content.tsx` is typed, so a malformed entry fails here rather than in the browser.

## 6. Build

```
npm run build
```

`prebuild` re-runs the three sync scripts plus `node scripts/generate-static.mjs`, then `next build` produces a fully static site in `out/`. That folder is exactly what gets deployed to GitHub Pages — no server involved. See [../explanation/why-static-export.md](../explanation/why-static-export.md).

## What you have now

- The site running locally on port 3000.
- An understanding that images flow drop-zone → `public/images/` via sync scripts.
- An understanding that routes are toggled in `once-ui.config.ts`.
- A clean type-check and a static build in `out/`.

## Next

[Tutorial 2: Add your first project](02-add-your-first-project.md).
