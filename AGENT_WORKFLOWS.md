# AGENT_WORKFLOWS.md

Named multi-skill recipes this repo actually runs. Pick one and follow the chain; improvise only when nothing here fits.
Prerequisites: `AGENTS.md` (commands, conventions, boundaries) and `CONTEXT.md` (vocabulary).

---

## 1. Add a project

**Intent:** publish a new entry under `/work` with its image and copy.

1. `brainstorming` — pin down the project's angle, summary line, and which image sells it. No files touched.
2. `ai-dlc` — open `aidlc-docs/efforts/NNNN-add-project-<slug>/` with `inception.md`; register in `aidlc-docs/registry.md`.
3. Create `src/app/work/projects/<Name>.mdx` — frontmatter `title, publishedAt, summary, images[], link` + body.
4. Drop the image in `project_images/` and add its `FILE_MAP` entry in `scripts/sync-project-images.mjs`.
5. `npm run dev` — the `predev` sync publishes the image to `public/images/projects/`. Confirm the path in `images[]` resolves.
6. `frontend-design` — check the card in `src/components/ProjectCard.tsx` and the detail page for layout, aspect ratio, truncation.
7. `verification-before-completion` — `npx tsc --noEmit -p tsconfig.json` and `npm run build`; confirm the route exists in `out/`.

**Run:** `Add a new project "<Project Name>" to /work — image is in project_images/<file>.png. Follow workflow 1 in AGENT_WORKFLOWS.md.`

---

## 2. Add a page / route

**Intent:** add a new top-level section (e.g. `/process`) and make it reachable.

1. `ai-dlc` — effort folder with `inception.md`; state whether this changes the site's IA.
2. Create `src/app/<route>/page.tsx`; put all copy in a new typed block in `src/resources/content.tsx` + `src/types/content.types.ts`.
3. Enable the path in the `routes` object of `src/resources/once-ui.config.ts`.
4. Add the nav link in `src/components/Header.tsx`. Steps 3 and 4 are both mandatory.
5. `frontend-design` — build the page against Once UI primitives; reuse `src/components/about/*` patterns before inventing new ones.
6. `code-review` — review the diff for content-as-code compliance and static-export safety.
7. If the IA changed, write `docs/adr/NNNN-<route>-page.md` and update the IA table in `CONTEXT.md`.

**Run:** `Add a /process page describing the AI-DLC workflow. Follow workflow 2 in AGENT_WORKFLOWS.md.`

---

## 3. Update content

**Intent:** change site copy, links, social handles, or metadata.

1. Edit `src/resources/content.tsx` only. If a shape changes, update `src/types/content.types.ts` first.
2. `npx tsc --noEmit -p tsconfig.json` — the types are the test.
3. `npm run biome-write` on touched files.
4. `documentation-bot` — if the change alters facts stated in `README.md`, `CONTEXT.md`, or `AGENTS.md`, sync them.

**Run:** `Update the about-page intro and research interests in content.tsx. Follow workflow 3 in AGENT_WORKFLOWS.md.`

---

## 4. Make a decision

**Intent:** settle an architectural or IA question durably instead of re-litigating it.

1. `grilling` — stress-test the proposal; surface the real constraint and the discarded options.
2. `oracle` — second-model review of the surviving option, with the relevant files bundled.
3. Write `docs/adr/NNNN-<slug>.md`: context, options considered, decision, consequences.
4. Update `CONTEXT.md` — IA table, pipeline diagram, or glossary, whichever the decision moved.
5. Link the ADR from the originating `aidlc-docs/efforts/NNNN-*/` folder.

**Run:** `Should /blog be re-enabled or folded into /process? Follow workflow 4 in AGENT_WORKFLOWS.md and write the ADR.`

---

## 5. Repo health pass

**Intent:** periodic hygiene — dead assets, stale docs, drifted registry.

1. `asset-reviewer` — audit `gallery/`, `project_images/`, `public/` and `resume.pdf` for orphans, oversize files, and unmapped `FILE_MAP` entries.
2. `review-claudemd` — check `CLAUDE.md` and `AGENTS.md` against how work actually went recently.
3. `documentation-bot` — reconcile `README.md`, `CONTEXT.md`, `AGENT_WORKFLOWS.md` with the current tree.
4. Rebuild `aidlc-docs/registry.md` from the folders present under `aidlc-docs/efforts/`; close finished efforts.
5. Run the checks: `npm run lint`, `npx tsc --noEmit -p tsconfig.json`, `npm run build`. Record output in the effort.

**Run:** `Do a repo health pass. Follow workflow 5 in AGENT_WORKFLOWS.md.`

---

## 6. Ship a release

**Intent:** land verified work on `main` so CI deploys to Pages.

1. `code-review` — review the diff since the merge-base on standards and spec.
2. `verification-before-completion` — paste real output of `npx tsc --noEmit -p tsconfig.json` and `npm run build`; confirm `out/` contains the changed routes.
3. `github-pr-workflow` — branch, commit, PR with the effort folder linked and the verification output in the body.
4. Merge to `main`. `.github/workflows/deploy.yml` (Node 20 → `npm install` → `npm run build` → upload `out/`) deploys to Pages.
5. Confirm live at https://harshdipsaha.tech/ ; mark the effort complete in `aidlc-docs/registry.md`.

**Run:** `Ship the current branch. Follow workflow 6 in AGENT_WORKFLOWS.md.`
