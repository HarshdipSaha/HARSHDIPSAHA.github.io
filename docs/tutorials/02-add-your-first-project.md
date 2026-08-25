# Tutorial 2: Add your first project

By the end of this tutorial the site will show a new project card on `/projects` and a working detail page at `/projects/my-project`, built from an image you dropped in and one MDX file you wrote.

Prerequisite: you have finished [Tutorial 1](01-local-setup.md) and the site runs locally.

A project in this repo is exactly three things:

1. An image in the `project_images/` drop-zone.
2. An entry in `PROJECT_MAP` inside `scripts/build-images.mjs`.
3. One `.mdx` file in `content/projects/`.

There is no database and no admin panel. That is deliberate — see [../explanation/content-as-code.md](../explanation/content-as-code.md).

## 1. Drop the image in

Copy an image into the `project_images/` folder at the repo root. Call it something human, spaces are fine:

```
project_images/My Project Diagram.png
```

Any format sharp can read works — `.jpg`, `.jpeg`, `.png`, `.webp`. The output is always WebP, so the source format does not matter. Don't leave non-image files in the folder; every file there is processed.

`project_images/` is a **drop-zone**: a source folder you edit by hand. Its published counterpart, `public/img/projects/`, is generated and gitignored. Never put a file directly into `public/img/` — the next build overwrites it and git never sees it.

## 2. Add a PROJECT_MAP entry

Open `scripts/build-images.mjs`. Near the top is a `PROJECT_MAP` object mapping source filenames to slugs. Add your line:

```js
const PROJECT_MAP = {
  // ...existing entries...
  "My Project Diagram.png": "my-project",
};
```

No extension on the right-hand side: the script always writes `<slug>.webp`.

You could skip this — unmapped files fall through to an automatic rename (extension dropped, lowercased, every run of non-alphanumerics becomes a dash, so `My Project Diagram.png` would become `my-project-diagram`). But then the slug is decided by an algorithm rather than by you, and you have to guess it correctly in your MDX. Be explicit.

## 3. Write the MDX file

Create `content/projects/My-Project.mdx`. The filename, lowercased, becomes the URL slug: `/projects/my-project`.

```mdx
---
title: "My Project: A Short Descriptive Title"
publishedAt: "2026-08-23"
summary: "One or two sentences. This shows on the /projects card and under the title on the page."
images:
  - "/img/projects/my-project.webp"
link: "https://github.com/HARSHDIPSAHA/my-project"
---

## Overview

What the project is and why it exists.

## Approach

How it works. Standard markdown: headings, lists, code fences, links, tables.

## Results

What came out of it.
```

Four things matter in that frontmatter block:

- `title` and `summary` are what the card and the page show. `src/lib/projects.ts` parses frontmatter with `gray-matter`.
- `publishedAt` must be `YYYY-MM-DD`. It sorts `/projects` newest first and supplies the year on the card. Leave it out and the project is dated 2024-01-01 and sinks to the bottom.
- `images[0]` is a **public path**, `/img/projects/<slug>.webp`. It is not a path into `project_images/`. The `<slug>` must match the `PROJECT_MAP` value from step 2 — the code strips the folder and `.webp` and looks the slug up in `src/data/images.json`.
- `link` is optional; it is normally the GitHub repo and renders as the orange "Repository" pill.

## 4. Build the images

The dev server does not watch the drop-zones. Either restart it (`Ctrl+C`, `npm run dev` — `predev` runs the build) or, without stopping anything:

```
npm run images
```

You should see:

```
images: 8 gallery, 20 projects, 1 encoded
```

Projects went from 19 to 20, and exactly one file was encoded — yours. If the count did not move, the file is not where you think it is. Open `src/data/images.json` and confirm a `"my-project"` key now sits under `"projects"` with a `src`, `w` and `h`.

## 5. Look at it

- `http://localhost:3000/projects` — your card should appear, positioned by `publishedAt`, with a 16:10 crop of your image.
- `http://localhost:3000/projects/my-project` — the detail page: title, summary, the Repository pill, your image, your MDX body.

If the card shows a single letter instead of your image, `images[0]` and the `PROJECT_MAP` slug disagree. Check what key actually landed in `images.json`.

## 6. Type-check and build

```
npm run typecheck
npm run build
```

Both must be clean. `npm run build` re-runs the image build through `prebuild`, so `out/projects/my-project/index.html` exists whether or not you remembered step 4. The sitemap picks the new page up automatically.

## 7. (Optional) Feature it on the home page

Add `"my-project"` to `selectedProjects.slugs` in `src/content/site.ts`. The home page shows those slugs, in that order.

## What you learned

- Images flow drop-zone → `build-images.mjs` → `public/img/` + `images.json`, one direction only.
- `PROJECT_MAP` is the explicit naming contract; the kebab fallback is what happens when you skip it.
- A project is a single MDX file whose frontmatter is a contract with `src/lib/projects.ts`.
- `publishedAt` is ordering, not decoration.
- The image build runs at `predev`, `prebuild` and `npm run images` — not continuously.

## Next

For the version without the explanations, see [../how-to/add-a-project.md](../how-to/add-a-project.md). For every frontmatter field, see [../reference/content-schema.md](../reference/content-schema.md).
