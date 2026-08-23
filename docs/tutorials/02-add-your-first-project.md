# Tutorial 2: Add your first project

By the end of this tutorial the site will show a new project card on `/work` and a working detail page at `/work/My-Project`, built from an image you dropped in and one MDX file you wrote.

Prerequisite: you have finished [Tutorial 1](01-local-setup.md) and the site runs locally.

A project in this repo is exactly three things:

1. An image in the `project_images/` drop-zone.
2. An entry in `FILE_MAP` inside `scripts/sync-project-images.mjs`.
3. One `.mdx` file in `src/app/work/projects/`.

There is no database and no admin panel. That is deliberate — see [../explanation/content-as-code.md](../explanation/content-as-code.md).

## 1. Drop the image in

Copy an image into the `project_images/` folder at the repo root. Call it something human, spaces are fine:

```
project_images/My Project Diagram.png
```

Recognised extensions are `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`. Anything else is ignored by the sync script.

`project_images/` is a **drop-zone**: a source folder you edit by hand. Its published counterpart, `public/images/projects/`, is generated. Never put a file directly into `public/images/` — the next build overwrites it.

## 2. Add a FILE_MAP entry

Open `scripts/sync-project-images.mjs`. Near the top is a `FILE_MAP` object mapping source filenames to the published, kebab-case names. Add your line:

```js
const FILE_MAP = {
  // ...existing entries...
  "My Project Diagram.png": "my-project.png",
};
```

You could skip this — unmapped files fall through to an automatic kebab-case rename (spaces become dashes, non-alphanumerics are stripped, everything lowercased, so `My Project Diagram.png` would become `my-project-diagram.png`). But then the published filename is decided by an algorithm rather than by you, and you have to guess it correctly in your MDX. Be explicit.

## 3. Write the MDX file

Create `src/app/work/projects/My-Project.mdx`. The filename becomes the URL slug: `/work/My-Project`.

```mdx
---
title: "My Project: A Short Descriptive Title"
publishedAt: "2026-08-23"
summary: "One or two sentences. This is what shows on the /work card."
images:
  - "/images/projects/my-project.png"
link: "https://github.com/HarshdipSaha/my-project"
---

## Overview

What the project is and why it exists.

## Approach

How it works. Standard markdown: headings, lists, code fences, links.

## Results

What came out of it.
```

Four things matter in that frontmatter block:

- `title`, `publishedAt`, `summary` are required. `src/utils/utils.ts` parses frontmatter with `gray-matter` and the pages read these fields.
- `publishedAt` must be `YYYY-MM-DD`. It sorts the `/work` index, newest first. Get it wrong and your project lands in the wrong place.
- `images` entries are **public paths**, starting `/images/projects/`. They are not paths into `project_images/`. The value must match the `FILE_MAP` destination from step 2.
- `link` is optional; it is normally the GitHub repo.

## 4. Restart the dev server

Stop it with `Ctrl+C` and run `npm run dev` again.

The restart is required, not superstition: the copy from `project_images/` to `public/images/projects/` happens in `predev`, which only runs when you start the dev server. A running server never re-runs it. You should see:

```
Synced 19 project images from project_images/ → public/images/projects/
```

One higher than before. If the count did not move, your file extension is not in the recognised list, or the file is not where you think it is.

(If you would rather not restart, `node scripts/sync-project-images.mjs` on its own does the same copy.)

## 5. Look at it

- `http://localhost:3000/work` — your card should appear, positioned by `publishedAt`.
- `http://localhost:3000/work/My-Project` — the detail page, with your image and MDX body.

If the card renders but the image is a broken box, the `images:` path and the `FILE_MAP` destination disagree. Check what actually landed in `public/images/projects/`.

## 6. Type-check and build

```
npx tsc --noEmit -p tsconfig.json
npm run build
```

Both must be clean. `npm run build` re-runs the sync scripts through `prebuild`, so the built `out/` contains your image whether or not you remembered step 4.

## What you learned

- Images flow drop-zone → sync script → `public/images/`, one direction only.
- `FILE_MAP` is the explicit naming contract; the kebab fallback is what happens when you skip it.
- A project is a single MDX file whose frontmatter is a contract with `src/utils/utils.ts`.
- `publishedAt` is ordering, not decoration.
- Sync runs at `predev` and `prebuild` — not continuously.

## Next

For the version without the explanations, see [../how-to/add-a-project.md](../how-to/add-a-project.md). For every frontmatter field, see [../reference/content-schema.md](../reference/content-schema.md).
