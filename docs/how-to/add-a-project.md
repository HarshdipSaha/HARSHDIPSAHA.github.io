# How to add a project

Goal: a new card on `/projects` and a detail page at `/projects/<slug>`.

## Steps

1. Put the image in `project_images/`. Any format sharp can read (`.jpg` `.jpeg` `.png` `.webp`). Every file in that folder is processed, so don't leave non-images there.

2. Add the naming entry to `PROJECT_MAP` in `scripts/build-images.mjs`:

   ```js
   "My Project Diagram.png": "my-project",
   ```

   The value is the slug, without extension. The published file will be `public/img/projects/my-project.webp`.

3. Create `content/projects/My-Project.mdx` (lowercased filename = URL slug, so `/projects/my-project`):

   ```mdx
   ---
   title: "My Project: A Short Descriptive Title"
   publishedAt: "2026-08-23"
   summary: "One or two sentences; shown on the /projects card and as the page lede."
   images:
     - "/img/projects/my-project.webp"
   link: "https://github.com/HARSHDIPSAHA/my-project"
   ---

   ## Overview

   Body copy in MDX. GitHub-flavoured markdown (tables, task lists) works.
   ```

4. Build the images:

   ```
   npm run images
   ```

   or restart `npm run dev` (`predev` runs it).

## Verify

```
npm run images                              # "images: 8 gallery, 20 projects, 1 encoded"
grep '"my-project"' src/data/images.json    # manifest has the slug
npm run typecheck                           # clean
npm run build                               # succeeds, out/projects/my-project/index.html exists
```

Then check `/projects` and `/projects/my-project` in the browser.

## Gotchas

- **No `PROJECT_MAP` entry** → the file still builds, via the automatic fallback (filename minus extension, lowercased, every run of non-alphanumerics → `-`). The published slug is then whatever the algorithm produced, which may not match your `images:` path.
- **`images[0]` is looked up by basename.** `src/lib/projects.ts` strips `/img/projects/` and `.webp` and reads `images.projects[<key>]` from the manifest. If the key isn't there, the card renders a letter placeholder and the detail page has no hero image — no build error.
- **The image slug and the page slug are independent.** `Missing-person-identification.mdx` → `/projects/missing-person-identification` uses `/img/projects/missing-person.webp`. Both work; keeping them identical is just tidier.
- **`publishedAt` drives ordering** on `/projects`, newest first, and the year shown on the card. Format `YYYY-MM-DD`. A missing date is treated as `2024-01-01`.
- **Never add files to `public/img/projects/` by hand.** The build script owns that directory and it is gitignored.
- **Nothing is deleted.** Removing a source from `project_images/` leaves the old `.webp` in `public/img/` until the folder is cleared, and leaves its manifest key until the next run (the manifest is rewritten in full).
- To feature the project on the home page, add its slug to `selectedProjects.slugs` in `src/content/site.ts`.

## See also

- [../tutorials/02-add-your-first-project.md](../tutorials/02-add-your-first-project.md) — same task, explained.
- [../reference/content-schema.md](../reference/content-schema.md) — full frontmatter contract.
- [../reference/build-scripts.md](../reference/build-scripts.md) — what the image build does.
