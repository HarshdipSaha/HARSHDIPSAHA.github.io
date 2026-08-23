# How to run an AI-DLC effort

Goal: take a non-trivial change from intent to closed record, with an approval gate and a rebuilt registry.

Trivial changes (a typo, a one-line copy fix in `content.tsx`) skip this entirely: edit, type-check, done.

## Steps

1. **Confirm the baseline exists.** `aidlc-docs/inception/` holds `requirements.md`, `architecture.md`, `components.md`, `stack.md`. Inception runs once; if it is missing, you are not running an effort, you are running inception.

2. **Pick the next number.** Read the `Next effort number:` line at the bottom of `aidlc-docs/registry.md`. Cross-check against the filesystem — `aidlc-docs/efforts/` is the source of truth, `registry.md` is a derived view.

3. **Create the folder.**

   ```
   mkdir aidlc-docs/efforts/008-my-ref
   ```

   Naming: `{NNN}-{ref}`, zero-padded to three digits, kebab-case ref.

4. **Write `effort-state.md` with status `planning`:**

   ```markdown
   # Effort 008 — My Ref

   | Field | Value |
   |-------|-------|
   | Ref | 008-my-ref |
   | Status | planning |
   | Depth | standard |
   | Opened | YYYY-MM-DD |
   | Closed | — |
   | Baseline | aidlc-docs/inception/ |
   | ADRs | none |
   | Commits | pending |
   | Reconstructed | no |

   ## Intent
   One paragraph: what changes and why.

   ## Stages
   | Stage | Outcome |
   |-------|---------|
   | Effort planning | |
   | Functional design | |
   | NFRs | |
   | Code | |
   | Build & test | |

   ## Units of work
   - [ ] Unit 1 — files touched
   - [ ] Unit 2 — files touched

   ## Verification

   ## Notes
   ```

5. **Write `requirements-delta.md`** — what this effort adds to, changes in, or removes from the inception baseline. Every effort folder has both files; an effort with only one is malformed.

6. **Approval gate.** Move `Status` to `awaiting-approval` and request sign-off. When granted, log the gate in `aidlc-docs/audit.md`: date, effort ref, what was approved, by whom.

7. **Set `Status` to `in-progress`** and do the work unit by unit, ticking the checkboxes as each lands.

8. **Verify.** Paste real output, not a claim:

   ```
   npx tsc --noEmit -p tsconfig.json
   npm run build
   ```

   Record both in the `## Verification` section, along with anything route-specific you checked.

9. **Close.** Set `Status` to `complete`, fill `Closed`, fill `Commits` with the real SHAs and PR numbers, and fill `ADRs` — if the effort made an architectural decision, that decision belongs in `docs/adr/NNNN-*.md`, not in the effort file.

10. **Rebuild `registry.md`** by re-reading every `effort-state.md`. Do not hand-patch a row: the file is marked generated, and if it disagrees with a state file the state file wins.

## State machine

`planning → awaiting-approval → in-progress → complete`

Terminal alternatives: `blocked`, `failed`, `abandoned`. A blocked effort keeps its folder and records what it is blocked on.

## Depth dial

`minimal` / `standard` / `comprehensive`. **This repo runs `standard`** — every effort-state field filled, requirements delta written, verification recorded, but not full formal design docs per unit.

## See also

- [../explanation/ai-dlc-in-this-repo.md](../explanation/ai-dlc-in-this-repo.md) — why this exists at all.
- [../adr/0008-adopt-ai-dlc-and-docs-first-structure.md](../adr/0008-adopt-ai-dlc-and-docs-first-structure.md)
- `aidlc-docs/README.md`
