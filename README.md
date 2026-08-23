# Harshdip Saha — Portfolio

Personal portfolio site: **[harshdipsaha.tech](https://harshdipsaha.tech/)** · [harshdipsaha.github.io](https://harshdipsaha.github.io)

Next.js 16 (App Router, static export) · TypeScript · MDX · Once UI · deployed to GitHub Pages.

---

## This repo is also a worked example

The site is built with **AI-DLC** (AI-Driven Development Lifecycle) on top of the agent-repo
structure playbook. Every change after the baseline is a numbered *effort*; every structural
decision is an *ADR*. The build story is published on the site itself at
**[/process](https://harshdipsaha.tech/process)**.

Why bother: this repo's first ~20 commits have messages like `lets see`, `hmmm`, `okays`, `soz` —
including one 12,517-line commit. None of them recorded *why*. Every structural decision had to be
reverse-engineered from diffs in August 2026. ADRs 0001–0007 and efforts 001–004 are honest
reconstructions from that archaeology; everything after is recorded as it happens.

```
Context      AGENTS.md · CLAUDE.md · CONTEXT.md · AGENT_WORKFLOWS.md   how agents behave here
Capabilities .claude/skills · AGENT_WORKFLOWS.md                       what agents can do
Knowledge    docs/ (tutorials · how-to · reference · explanation · adr) decisions that persist
Product      src/ · scripts/ · public/                                 the software
Quality      evals/ · .github/workflows/                               what must hold to ship
```

## Run locally

```bash
npm install
npm run dev          # predev auto-syncs images; serves on :3000
```

## Build & deploy

```bash
npx tsc --noEmit -p tsconfig.json   # type-check — the gate
npm run build                       # prebuild syncs images, then exports to out/
```

Output: `out/`. Pushing to `main` deploys via GitHub Actions to GitHub Pages.

## Project layout

| Path | Purpose |
|------|---------|
| `AGENTS.md` | Front door for any agent: commands, conventions, boundaries |
| `CONTEXT.md` | Durable project context + domain glossary |
| `AGENT_WORKFLOWS.md` | Named multi-skill recipes this repo actually runs |
| `aidlc-docs/inception/` | The baseline — requirements, architecture, components, stack |
| `aidlc-docs/efforts/` | One folder per unit of work, with state + requirements delta |
| `docs/adr/` | Architecture decision records — the "why" log |
| `docs/` | Tutorials, how-to guides, reference, explanation (Diátaxis) |
| `evals/` | Behaviour checks that the repo's conventions still hold |
| `src/app/` | Pages (home, about, work, gallery, process) |
| `src/app/work/projects/` | One `.mdx` per project |
| `src/resources/content.tsx` | Single source of truth for site copy, typed |
| `src/resources/once-ui.config.ts` | Theme, route toggles, schema |
| `gallery/`, `project_images/` | Image drop-zones — sync scripts publish them |
| `scripts/` | Build-time sync + static generation |
| `public/` | **Generated** assets + resume — do not hand-edit `public/images/**` |

## Contributing to this repo (or asking an agent to)

Start at [`AGENTS.md`](./AGENTS.md). For a change of any size, open an effort — see
[`docs/how-to/run-an-aidlc-effort.md`](./docs/how-to/run-an-aidlc-effort.md). Decisions go in
[`docs/adr/`](./docs/adr/).
