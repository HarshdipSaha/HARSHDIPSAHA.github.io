# How to add a project

Goal: a new card on `/work` and a detail page at `/work/<Slug>`.

## Steps

1. Put the image in `project_images/`. Recognised extensions: `.jpg` `.jpeg` `.png` `.webp` `.gif`.

2. Add the naming entry in `scripts/sync-project-images.mjs`:

   ```js
   "My Project Diagram.png": "my-project.png",
   ```

3. Create `src/app/work/projects/My-Project.mdx` (filename = URL slug):

   ```mdx
   ---
   title: "My Project: A Short Descriptive Title"
   publishedAt: "2026-08-23"
   summary: "One or two sentences; shown on the /work card."
   images:
     - "/images/projects/my-project.png"
   link: "https://github.com/HarshdipSaha/my-project"
   ---

   ## Overview

   Body copy in MDX.
   ```

4. Sync the image:

   ```
   node scripts/sync-project-images.mjs
   ```

   or restart `npm run dev` (`predev` runs it).

## Verify

```
node scripts/sync-project-images.mjs        # count increments by 1
ls public/images/projects/my-project.png    # file exists
npx tsc --noEmit -p tsconfig.json           # clean
npm run build                               # succeeds, out/work/My-Project/ exists
```

Then check `/work` and `/work/My-Project` in the browser.

## Gotchas

- **No `FILE_MAP` entry** → the file still syncs, via the automatic kebab-case fallback (spaces → dashes, non-alphanumerics stripped, lowercased). The published name is then whatever the algorithm produced, which may not match your `images:` path.
- **`publishedAt` drives ordering** on the `/work` index, newest first. Format is `YYYY-MM-DD`. A wrong or missing date puts the project in the wrong place.
- **`images:` takes the public path**, `/images/projects/...`, not the drop-zone path `project_images/...`.
- **Never add files to `public/images/projects/` by hand.** The sync scripts own that directory.
- `title`, `publishedAt` and `summary` are required. `src/utils/utils.ts` also tolerates `subtitle`, `team`, `tag`, `image`.

## See also

- [../tutorials/02-add-your-first-project.md](../tutorials/02-add-your-first-project.md) — same task, explained.
- [../reference/content-schema.md](../reference/content-schema.md) — full frontmatter contract.
- [../reference/build-scripts.md](../reference/build-scripts.md) — what the sync script does.
