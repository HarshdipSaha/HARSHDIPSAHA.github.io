# Reference: commands

## npm scripts

Defined in `package.json`. `predev` and `prebuild` are npm lifecycle hooks — npm runs them automatically before `dev` and `build`.

| Command | What it does | When to use |
| --- | --- | --- |
| `npm run dev` | `next dev` (Turbopack) on `http://localhost:3000` | Local development |
| `npm run predev` | `node scripts/sync-me.mjs && node scripts/sync-gallery.mjs && node scripts/sync-project-images.mjs` | Runs automatically before `dev`; rarely invoked directly |
| `npm run build` | `next build` → static site in `out/` | Before shipping; run in CI |
| `npm run prebuild` | `node scripts/sync-me.mjs && node scripts/sync-gallery.mjs && node scripts/sync-project-images.mjs && node scripts/generate-static.mjs` | Runs automatically before `build` |
| `npm run export` | `next export` | Legacy; `output: "export"` in `next.config.mjs` already exports during `build` |
| `npm run lint` | `next lint` | Linting |
| `npm run biome-write` | `npx @biomejs/biome format --write .` | Format touched files before committing |
| `npm start` | `next start` | Not used for this site — there is no server runtime in production |

## Type-check

| Command | What it does | When to use |
| --- | --- | --- |
| `npx tsc --noEmit -p tsconfig.json` | Type-checks the whole project, emits nothing | Before claiming any change is done. Clean output = pass |

## Sync scripts standalone

| Command | What it does | When to use |
| --- | --- | --- |
| `node scripts/sync-me.mjs` | `me.jpg` → `public/images/me.jpg`, `public/images/og/home.jpg` | After replacing the avatar |
| `node scripts/sync-gallery.mjs` | `gallery/` → `public/images/gallery/` + `src/data/gallery.json` | After adding a gallery image, without restarting dev |
| `node scripts/sync-project-images.mjs` | `project_images/` → `public/images/projects/` | After adding a project image, without restarting dev |
| `node scripts/generate-static.mjs` | Writes `public/sitemap.xml` and `public/robots.txt` | Rarely; `prebuild` covers it |

Details in [build-scripts.md](build-scripts.md).

## CI pipeline

`.github/workflows/deploy.yml`. Triggers: push to `main`, or manual `workflow_dispatch`. Two jobs, `build` then `deploy`, on `ubuntu-latest`.

| Step | Action | Notes |
| --- | --- | --- |
| Checkout | `actions/checkout@v4` | |
| Setup Node.js | `actions/setup-node@v4` | `node-version: "20"` |
| Install dependencies | `npm install` | Not `npm ci` |
| Build | `npm run build` | Triggers `prebuild`; produces `out/` |
| Setup Pages | `actions/configure-pages@v4` | |
| Upload artifact | `actions/upload-pages-artifact@v3` | `path: out` |
| Deploy | `actions/deploy-pages@v4` | `deploy` job, environment `github-pages` |

Permissions: `contents: read`, `pages: write`, `id-token: write`. Concurrency group `pages`, `cancel-in-progress: false`.

## Definition of done

```
npx tsc --noEmit -p tsconfig.json     # clean, no output
npm run build                          # exits 0, out/ contains the affected route
```

Both must be run and their real output seen. Do not claim done on inspection alone.
