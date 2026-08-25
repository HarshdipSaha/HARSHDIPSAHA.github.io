# Documentation

Docs in this folder follow [Diataxis](https://diataxis.fr/). Four quadrants, four different jobs:

| Quadrant | Orientation | Read it when you want to... |
| --- | --- | --- |
| `tutorials/` | Learning | Be walked through something end to end, from zero, and have it work at the end. |
| `how-to/` | Task | Get one specific job done, fast, assuming you already know the repo. |
| `reference/` | Information | Look up an exact field, script, or command. Dry and exhaustive. |
| `explanation/` | Understanding | Understand why the repo is built this way, and what it cost. |
| `adr/` | Decision log | See the dated record of a specific architectural decision and its alternatives. |

## Index

| Path | What it's for |
| --- | --- |
| [tutorials/01-local-setup.md](tutorials/01-local-setup.md) | Clone, install, run the dev server, type-check, build. Start here. |
| [tutorials/02-add-your-first-project.md](tutorials/02-add-your-first-project.md) | Add one project (image + `PROJECT_MAP` + MDX) end to end, with explanation at each step. |
| [how-to/add-a-project.md](how-to/add-a-project.md) | Terse recipe for adding a project MDX and its image. |
| [how-to/add-a-gallery-image.md](how-to/add-a-gallery-image.md) | Drop an image into `gallery/` and get it onto `/gallery`. |
| [how-to/add-a-route.md](how-to/add-a-route.md) | The two-place edit: `src/app/<route>/page.tsx` plus a `nav` entry in `src/content/site.ts`. |
| [how-to/update-site-content.md](how-to/update-site-content.md) | Edit copy, experience, story, process stats in `src/content/site.ts`. |
| [how-to/run-an-aidlc-effort.md](how-to/run-an-aidlc-effort.md) | Open, approve, execute and close an AI-DLC effort under `aidlc-docs/efforts/`. |
| [reference/content-schema.md](reference/content-schema.md) | Every export of `site.ts`, the image manifest, and the project MDX frontmatter contract. |
| [reference/build-scripts.md](reference/build-scripts.md) | `build-images.mjs`, `render-brain-frames.py`, `check-aidlc-sync.mjs`: reads, writes, when they run. |
| [reference/commands.md](reference/commands.md) | Every npm script and the CI pipeline steps. |
| [explanation/why-static-export.md](explanation/why-static-export.md) | Why `output: "export"` on GitHub Pages, and what it forecloses. |
| [explanation/content-as-code.md](explanation/content-as-code.md) | Why site copy is a TypeScript module plus MDX, and not a CMS. |
| [explanation/ai-dlc-in-this-repo.md](explanation/ai-dlc-in-this-repo.md) | Why this repo adopted AI-DLC, and which records are reconstructions. |
| [adr/](adr/) | Numbered architecture decision records, `0001`–`0011`. The why-log. |

## Where else to look

Repo-root `AGENTS.md` (agent operating rules), `CONTEXT.md` (domain vocabulary), `AGENT_WORKFLOWS.md` (workflow playbooks), and `aidlc-docs/` (inception baseline, efforts, audit log) sit outside Diataxis and are the authority for process, not product.
