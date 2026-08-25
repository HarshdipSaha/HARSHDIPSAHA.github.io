# Reference: commands

## npm scripts

Defined in `package.json`. `predev` and `prebuild` are npm lifecycle hooks — npm runs them automatically before `dev` and `build`.

| Command | What it does | When to use |
| --- | --- | --- |
| `npm run dev` | `next dev` on `http://localhost:3000` | Local development |
| `npm run predev` | `node scripts/build-images.mjs` | Runs automatically before `dev`; rarely invoked directly |
| `npm run build` | `next build` → static site in `out/` | Before shipping; run in CI |
| `npm run prebuild` | `node scripts/build-images.mjs` | Runs automatically before `build` |
| `npm run typecheck` | `tsc --noEmit -p tsconfig.json` | Before claiming any change is done. Clean output = pass |
| `npm run images` | `node scripts/build-images.mjs` | After adding a gallery/project image or replacing `me.jpg`, without restarting dev |
| `npm run check:aidlc` | `node scripts/check-aidlc-sync.mjs` | Before opening a PR — the same gate CI runs |
| `npm start` | `npx serve out` | Serve the exported site locally after `npm run build`; not used in production (GitHub Pages serves `out/`) |

There is no lint or format script.

## Other tools

| Command | What it does | When to use |
| --- | --- | --- |
| `python scripts/render-brain-frames.py <template-dir>` | Regenerates `public/brain/**` from the ICBM 152 template | Almost never; output is committed. See [build-scripts.md](build-scripts.md) |

Details in [build-scripts.md](build-scripts.md).

## CI pipelines

### `deploy.yml`

`.github/workflows/deploy.yml`. Triggers: push to `main`, or manual `workflow_dispatch`. Two jobs, `build` then `deploy`, on `ubuntu-latest`.

| Step | Action | Notes |
| --- | --- | --- |
| Checkout | `actions/checkout@v4` | |
| Setup Node.js | `actions/setup-node@v4` | `node-version: "20"` |
| Install dependencies | `npm install` | Not `npm ci` |
| Build | `npm run build` | Triggers `prebuild` (image build); produces `out/` |
| Setup Pages | `actions/configure-pages@v4` | |
| Upload artifact | `actions/upload-pages-artifact@v3` | `path: out` |
| Deploy | `actions/deploy-pages@v4` | `deploy` job, environment `github-pages` |

Permissions: `contents: read`, `pages: write`, `id-token: write`. Concurrency group `pages`, `cancel-in-progress: false`.

### `aidlc-check.yml`

`.github/workflows/aidlc-check.yml`. Trigger: `pull_request` to `main`. One job: checkout with `fetch-depth: 0`, Node 20, `node scripts/check-aidlc-sync.mjs` with `BASE_REF=origin/<base>` and `PR_TITLE` in the environment. Fails the PR if substantive paths changed without an `aidlc-docs/` change and the title lacks `[trivial]`.

## Definition of done

```
npm run typecheck                 # clean, no output
npm run build                     # exits 0, out/ contains the affected route
npm run check:aidlc               # OK, or the PR carries [trivial]
```

All must be run and their real output seen. Do not claim done on inspection alone.
