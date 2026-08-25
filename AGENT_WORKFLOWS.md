# AGENT_WORKFLOWS.md

Named multi-skill recipes this repo actually runs. Pick one and follow the chain; improvise only when nothing here fits.
Prerequisites: `AGENTS.md` (commands, conventions, boundaries) and `CONTEXT.md` (vocabulary).

---

## 1. Add a project

**Intent:** publish a new entry under `/projects` with its image and copy.

1. `brainstorming` — pin down the project's angle, summary line, and which image sells it. No files touched.
2. `ai-dlc` — open `aidlc-docs/efforts/NNN-add-project-<slug>/` with `effort-state.md` + `requirements-delta.md`; register in `aidlc-docs/registry.md`.
3. Create `content/projects/<Name>.mdx` — frontmatter `title, publishedAt, summary, images[], link` + body. The lowercased filename is the URL slug.
4. Drop the image in `project_images/` and add its `PROJECT_MAP` entry in `scripts/build-images.mjs` (`"source name.png": "slug"`). `images[0]` in the MDX must be `/img/projects/<slug>.webp`.
5. `npm run images` (or `npm run dev`, whose `predev` runs it) — publishes `public/img/projects/<slug>.webp` and rewrites `src/data/images.json`. Confirm the slug appears under `projects` in the manifest.
6. `frontend-design` — check the card in `src/components/ProjectGrid.tsx` (16:10 crop) and the detail page `src/app/projects/[slug]/page.tsx` for layout, aspect ratio, truncation. Optionally add the slug to `selectedProjects.slugs` in `src/content/site.ts` to feature it on `/`.
7. `verification-before-completion` — `npm run typecheck` and `npm run build`; confirm `out/projects/<slug>/index.html` exists.

**Run:** `Add a new project "<Project Name>" to /projects — image is in project_images/<file>.png. Follow workflow 1 in AGENT_WORKFLOWS.md.`

---

## 2. Add a page / route

**Intent:** add a new top-level section (e.g. `/process`) and make it reachable.

1. `ai-dlc` — effort folder with `effort-state.md`; state whether this changes the site's IA.
2. Create `src/app/<route>/page.tsx`; put all copy in a new exported object in `src/content/site.ts` and export `metadata` (title, description, canonical) from the page.
3. Add `{ label, href }` to the `nav` array in `src/content/site.ts`. `Nav.tsx`, `Footer.tsx` and `sitemap.ts` all read it — one edit, three surfaces. Steps 2 and 3 are both mandatory.
4. `frontend-design` — build the page with the primitives in `src/components/ui.tsx` (`Container`, `Label`, `Pill`, `Arrow`), the `.display` / `.label` / `.prose` / `.measure` utilities, and `Reveal` for entrances. Reuse the `/story` or `/process` page shape before inventing a new one. Only `paper`/`white` alphas and `tangerine` — no new colours.
5. `code-review` — review the diff for content-as-code compliance, static-export safety, and reduced-motion handling.
6. If the IA changed, write `docs/adr/NNNN-<route>-page.md` and update the IA table in `CONTEXT.md`.

**Run:** `Add a /writing page listing content/writing/*.mdx. Follow workflow 2 in AGENT_WORKFLOWS.md.`

---

## 3. Update content

**Intent:** change site copy, links, social handles, or metadata.

1. Edit `src/content/site.ts` only — find the export for the section (`person`, `hero`, `sequence`, `passage`, `threads`, `experience`, `selectedProjects`, `closing`, `story`, `publication`, `footer`, `process`). Project bodies are `content/projects/*.mdx`.
2. `npm run typecheck` — the object shapes are the test; components destructure these exports.
3. `npm run build` if the change touches `nav`, `selectedProjects.slugs`, or a project MDX (routes and static params come from them).
4. `documentation-bot` — if the change alters facts stated in `README.md`, `CONTEXT.md`, or `AGENTS.md`, sync them.

**Run:** `Update the story intro and the experience bullets in src/content/site.ts. Follow workflow 3 in AGENT_WORKFLOWS.md.`

---

## 4. Make a decision

**Intent:** settle an architectural or IA question durably instead of re-litigating it.

1. `grilling` — stress-test the proposal; surface the real constraint and the discarded options.
2. `oracle` — second-model review of the surviving option, with the relevant files bundled.
3. Write `docs/adr/NNNN-<slug>.md`: context, options considered, decision, consequences.
4. Update `CONTEXT.md` — IA table, pipeline diagram, or glossary, whichever the decision moved.
5. Link the ADR from the originating `aidlc-docs/efforts/NNN-*/` folder.

**Run:** `Should content/writing/ get a /writing route or be folded into /story? Follow workflow 4 in AGENT_WORKFLOWS.md and write the ADR.`

---

## 5. Repo health pass

**Intent:** periodic hygiene — dead assets, stale docs, drifted registry.

1. `asset-reviewer` — audit `gallery/`, `project_images/`, `resume.pdf` and `public/brain/` for orphans and oversize files; check every `PROJECT_MAP` entry has a source file and every project MDX `images[0]` has a manifest entry in `src/data/images.json`.
2. `review-claudemd` — check `CLAUDE.md` and `AGENTS.md` against how work actually went recently.
3. `documentation-bot` — reconcile `README.md`, `CONTEXT.md`, `AGENT_WORKFLOWS.md`, `docs/` with the current tree.
4. Rebuild `aidlc-docs/registry.md` from the folders present under `aidlc-docs/efforts/`; close finished efforts.
5. Run the checks: `npm run typecheck`, `npm run build`, `npm run check:aidlc`. Record output in the effort.

**Run:** `Do a repo health pass. Follow workflow 5 in AGENT_WORKFLOWS.md.`

---

## 6. Ship a release

**Intent:** land verified work on `main` so CI deploys to Pages.

1. `code-review` — review the diff since the merge-base on standards and spec.
2. `verification-before-completion` — paste real output of `npm run typecheck` and `npm run build`; confirm `out/` contains the changed routes.
3. `github-pr-workflow` — branch, commit, PR with the effort folder linked and the verification output in the body. `aidlc-check` must pass.
4. Merge to `main`. `.github/workflows/deploy.yml` (Node 20 → `npm install` → `npm run build` → upload `out/`) deploys to Pages.
5. Confirm live at https://harshdipsaha.tech/ ; mark the effort complete in `aidlc-docs/registry.md`.

**Run:** `Ship the current branch. Follow workflow 6 in AGENT_WORKFLOWS.md.`
