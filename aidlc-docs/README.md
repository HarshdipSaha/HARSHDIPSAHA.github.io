# aidlc-docs

This folder holds the AI-DLC (AI-Driven Development Lifecycle) artifacts for the
Harshdip Saha portfolio site. It is documentation and process state only — no
application code lives here.

## The methodology in brief

AI-DLC has exactly two moves.

| Move | Frequency | Produces |
| --- | --- | --- |
| **Inception** | Once per project | The baseline: `inception/requirements.md`, `architecture.md`, `components.md`, `stack.md` |
| **Effort** | Once per change | A numbered folder `efforts/{NNN}-{ref}/` with `effort-state.md` and `requirements-delta.md` |

This repository is **brownfield**: the code existed before the process did, so
inception was performed by reverse-engineering the working tree rather than by
green-field design. The baseline is the north star; every effort iterates
against it and records only the delta.

## Folder map

```
aidlc-docs/
├── README.md                     <- this file
├── registry.md                   <- DERIVED index of all efforts
├── audit.md                      <- approval-gate log
├── inception/
│   ├── requirements.md           <- functional + non-functional baseline
│   ├── architecture.md           <- layers, data flows, invariants
│   ├── components.md             <- component/file inventory
│   └── stack.md                  <- dependencies, versions, commands
└── efforts/
    └── {NNN}-{ref}/
        ├── effort-state.md       <- state machine + plan + progress
        └── requirements-delta.md <- what this effort changes vs. the baseline
```

## Effort state machine

```
planning -> awaiting-approval -> in-progress -> complete
                 |                    |
                 +---> abandoned      +---> blocked / failed
```

- `planning` — scope and delta being drafted.
- `awaiting-approval` — human gate; the transition is logged in `audit.md`.
- `in-progress` — implementation underway.
- `complete` — merged and verified.
- `blocked`, `failed`, `abandoned` — terminal or paused; the reason is recorded
  in the effort's own `effort-state.md`.

## Depth dial

Efforts run at one of three depths: `minimal`, `standard`, `comprehensive`.
**This project runs at `standard`.** Standard means: a written delta, an
explicit plan, an approval gate, and a verification step — but not exhaustive
design docs or formal test matrices.

## registry.md is derived

`registry.md` is a **rebuilt view**, not a source. The filesystem is the source
of truth: the set of `efforts/{NNN}-{ref}/effort-state.md` files defines what
exists and what state it is in. If the registry and the filesystem disagree, the
filesystem wins and the registry is regenerated. Never hand-edit the registry to
change an effort's state — edit the effort's `effort-state.md`.

## How to start a new effort

1. Read the baseline in `inception/` first. Do not restate it in the effort.
2. Pick the next free number `NNN` by listing `efforts/` (zero-padded, monotonic).
3. Create `efforts/{NNN}-{short-ref}/` with `effort-state.md` (state: `planning`,
   depth: `standard`) and `requirements-delta.md`.
4. Write the delta: which baseline requirements are added, changed, or retired,
   and which files are expected to move.
5. Move state to `awaiting-approval` and record the request in `audit.md`.
6. On approval, move to `in-progress` and implement.
7. Verify (`npm run build`, `npx tsc --noEmit -p tsconfig.json`), set `complete`,
   then regenerate `registry.md` from the effort-state files.
