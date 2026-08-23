# 0003 — Flatten `template/` into the repo root

Status: Accepted   Date: 2026-01-28   Supersedes: —

## Context
The Once UI template was first vendored wholesale into a `template/` subdirectory (ADR 0001).
That left the actual site one level down from the repo root, with the template's own README,
`FUNDING.yml` and `.vscode/` still in the tree — artifacts of someone else's project.

Options considered:

- **Keep `template/` as an upstream-trackable subtree or submodule.** Upstream fixes and
  feature work could be pulled with `git subtree pull`. Lost because the site was already
  diverging on the first day — the About page had been rewritten twice and `content.tsx`
  trimmed — so every upstream pull would have been a conflict resolution, not a fast-forward.
  Submodules would additionally break the single-checkout, single-`npm install` workflow.
- **Leave the nesting and point tooling at the subdirectory.** Cheap, but every tool — Next.js,
  `tsconfig`, the Actions workflow, editor tooling — needs a path override, and each override is
  a place for the build to break silently.

*Reconstructed retroactively on 2026-08-23 from commit diffs; the original commits recorded no rationale.*

## Decision
Move `template/src/**` to `src/**` at the repo root, delete the template's own README, funding
and editor config, and own the resulting code outright.

## Consequences
Upstream template fixes can no longer be pulled cheaply; any bug fixed by Once UI upstream must
be re-applied by hand, and the code is ours to maintain from here. In exchange there is no path
indirection: Next.js, TypeScript, npm scripts and CI all work at the root with default
configuration, and the repo reads as a site rather than as a vendored copy of one.

## Evidence
- `e3d7eea` (2026-01-28, "personalise") — 141 files moved from `template/src/**` to `src/**`
  (git detected pure renames); deleted `template/README.md` (229 lines),
  `template/.github/FUNDING.yml`, `template/.vscode/`; added `src/utils/meta.ts`.
