# AI-DLC in this repo

## What AI-DLC is

AI-Driven Development Lifecycle is a way of running a codebase where the *reasoning* behind changes is a first-class artifact, kept in the repo, next to the code it explains.

It has two phases. **Inception** runs once and produces a baseline: what the system is for, how it is put together, what it is built from. In this repo that baseline is `aidlc-docs/inception/` — `requirements.md`, `architecture.md`, `components.md`, `stack.md`. Everything after inception is an **effort**: a numbered, self-contained unit of change with a stated intent, a requirements delta against the baseline, an approval gate, units of work, and recorded verification. Efforts live in `aidlc-docs/efforts/{NNN}-{ref}/`, each with `effort-state.md` and `requirements-delta.md`.

Architectural decisions are split out into ADRs under `docs/adr/`, because a decision outlives the effort that made it.

## Why this repo adopted it

Not as an aspiration. As a repair.

Early commits in this repository lacked clear, descriptive messages and did not record the reasoning behind architectural decisions. For instance, a single early commit included over 12,000 insertions across more than 100 files without detailing the intent. Those commits contain real, deliberate architectural decisions — adopt the Once UI Next.js template, flatten it into the repo root, commit to static export on GitHub Pages, build a drop-zone image sync pipeline, model projects as per-project MDX, prune the template's demo content. Every one of those was a choice with alternatives that were considered and rejected.

None of that reasoning was written down. In August 2026 it had to be reconstructed by reading commit diffs — inferring intent from what changed, which is guesswork dressed up as archaeology. A massive undocumented commit tells you nothing about why the template was chosen over a from-scratch build, or what else was tried first.

That cost is the whole argument. The code was recoverable at any time; the *reasoning* was not, and a diff cannot tell you what was rejected. When the rationale is gone, every future change re-litigates settled questions, or worse, silently violates a constraint nobody remembers agreeing to.

What the structure buys, concretely:

- A new contributor — human or agent — reads `aidlc-docs/inception/` and knows the system's shape without reading the source.
- Every change carries its own justification, at the time it is made, when the reasoning is still in someone's head.
- Approval is an explicit event with a record, not an implicit consequence of a merge.
- `npm run typecheck` and `npm run build` output is recorded per effort, so "it worked" is evidence rather than a claim.

## The effort loop

1. Confirm the baseline in `aidlc-docs/inception/`.
2. Take the next number (`aidlc-docs/registry.md` states it; the filesystem confirms it).
3. Create `aidlc-docs/efforts/{NNN}-{ref}/` with `effort-state.md` and `requirements-delta.md`.
4. Pass the approval gate.
5. Execute unit by unit.
6. Verify: type-check and build.
7. Close, and regenerate the registry.

The recipe form is in [../how-to/run-an-aidlc-effort.md](../how-to/run-an-aidlc-effort.md).

### State machine

`planning → awaiting-approval → in-progress → complete`, with `blocked`, `failed` and `abandoned` as terminal alternatives. Abandoned efforts keep their folders. A record of something that was tried and dropped is worth more than a clean directory listing — that is precisely the information the first twenty commits destroyed.

### Depth dial

`minimal` / `standard` / `comprehensive`. **This repo runs `standard`**: every effort-state field filled, a requirements delta written, verification recorded — but no per-unit formal design documents. The dial exists because ceremony that exceeds the stakes gets abandoned, and an abandoned process records nothing. A one-author portfolio does not need `comprehensive`; it does need more than `minimal`.

### Approval gates

An effort does not move from `awaiting-approval` to `in-progress` on its own. The gate is logged in `aidlc-docs/audit.md` — date, effort, what was approved. This matters most when the work is done by an agent: the gate is the point where a human states scope, and the audit log is what makes that statement reviewable later.

### The registry is derived

`aidlc-docs/registry.md` is a table of every effort. It is **generated**, rebuilt by reading each `effort-state.md`. The filesystem is the source of truth. If the registry disagrees with a state file, the state file wins and the registry gets regenerated — never patched. One authority per fact; the convenient view is always downstream of it.

## An honest caveat

Efforts 001–006 and ADRs 0001–0007 are **reconstructions**. They were backfilled on 2026-08-23 by reading commit diffs. They are not contemporaneous records, and each effort file says so in a `Reconstructed` field. Effort 007 — the docs-first restructure that produced this document — is the first one recorded as it happened.

This distinction is worth stating plainly, because a reconstruction is weaker evidence than a record. It captures *what* changed accurately, since the diffs are unambiguous, but *why* is inference. Rejected alternatives are the biggest gap: a diff shows what was chosen and is silent on what was considered.

They are still worth having. A reconstructed decision record with a known provenance is better than no record and better than folklore, because it is falsifiable — anyone who remembers otherwise can correct it, and the correction lands somewhere durable. It also establishes the shape the repo now expects, so effort 008 has a form to follow. The `Reconstructed: yes` flag is what keeps the two classes of record from being confused.

The largest test of the process so far is the from-scratch rebuild of the site (ADR 0011, effort 013): the template-derived front end that ADRs 0001 and 0010 describe was deleted and replaced, and the record of *why* — and of what the rebuild deliberately kept (static export, content-as-code, the drop-zone pipeline, this lifecycle) — shipped in the same PR as the code. The superseded ADRs stay in `docs/adr/`, marked as such; that is what a decision log is for.

## Surfaced publicly

This story is not internal. It is published on the site's `/process` page: how the repo is layered, what the effort log contains, what the decision log contains. A portfolio that describes engineering judgment is more credible when it demonstrates it on itself, including the transition from undocumented early work to a structured lifecycle.

## See also

- [../adr/0008-adopt-ai-dlc-and-docs-first-structure.md](../adr/0008-adopt-ai-dlc-and-docs-first-structure.md)
- `aidlc-docs/README.md`
- [../how-to/run-an-aidlc-effort.md](../how-to/run-an-aidlc-effort.md)
