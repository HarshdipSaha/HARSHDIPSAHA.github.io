# Effort 029 — README: quality-gates table, a stack table, drop the informal quotes

| Field | Value |
|-------|-------|
| Ref | 029-readme-gates-and-stack-table |
| Status | complete |
| Depth | minimal |
| Opened | 2026-09-01 |
| Closed | 2026-09-01 |
| Baseline | effort 028 (`main`) |
| ADRs | none |
| Commits | branch `docs/readme-polish-v2` |
| Reconstructed | no — recorded live |

## Intent

Owner feedback, direct: the README still quoted the informal early commit messages (`lets see`,
`hmmm`, `okays`, `soz`) verbatim, which read as unprofessional on a first-impression document; the
dot-separated tech-stack line ("Next.js 16 (App Router, static export) · React 19 · TypeScript
· Tailwind CSS v4 · Motion · Lenis · MDX · deployed to GitHub Pages.") looked too plain; and the
four PR gates deserved a proper, explicit write-up rather than one paragraph of prose.

## Stages

| Stage | Outcome |
|-------|---------|
| Scope | README.md only, per the owner's own wording ("readme still has..."). The same informal quotes remain, deliberately, in `docs/adr/0008-*.md`, `docs/explanation/ai-dlc-in-this-repo.md`, `aidlc-docs/registry.md` and `aidlc-docs/audit.md` — those are the AI-DLC evidence trail, a different document with a different job, and were not what the owner flagged. |
| Fix | Replaced the quoted informal messages with real commit hashes (`d9e0d8a` … `0814927`) and the same 12,517-line figure — keeps the claim checkable without printing the literal words. Replaced the flat tech-stack line with a `Layer / Technology` table, each entry linked. Added a `## Quality gates` section: a `# / Gate / Workflow / Checks / Fails when` table for all four gates (Record, Build & Smoke, Lighthouse, Factuality), replacing the inline paragraph that used to sit above the fold. |
| Verify | `npm run typecheck` clean; `npm run build` succeeds; confirmed via grep that no other file's use of the informal quotes was touched. |

## Units of work

- [x] `README.md` — stack table, quality-gates table, informal quotes replaced with commit hashes

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run build` | succeeds, 30 static pages |
| Informal commit-message quotes remaining in `README.md` | 0 |
| Informal commit-message quotes remaining elsewhere (evidence trail, untouched) | 6 files, unchanged |
