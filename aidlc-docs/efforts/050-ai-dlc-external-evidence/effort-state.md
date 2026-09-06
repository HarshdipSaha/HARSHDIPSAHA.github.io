# Effort 050 — AI-DLC external evidence: does the practice pay for itself

| Field | Value |
|-------|-------|
| Ref | 050-ai-dlc-external-evidence |
| Status | complete |
| Depth | minimal |
| Opened | 2026-09-06 |
| Closed | 2026-09-06 |
| Baseline | `main` @ `e86526a` (effort 049, PR #67, merged) |
| ADRs | none |
| Commits | branch `docs/ai-dlc-evidence-study` |
| Reconstructed | no — recorded live |

## Intent

Owner asked, in chat, whether AI-DLC actually helps performance and token savings, or whether it
is "just md files" duplicating what commit history already records — and asked for the claim to be
checked against the web and arXiv rather than answered from priors. That research (web search +
arXiv paper retrieval, four controlled studies plus commit-message-quality literature) produced a
mixed, sourced answer: the record still didn't exist anywhere written down for this repo's own use.
Owner then asked for it to be written up as a proper doc per repo convention, with all references,
in deep-explain style with worked examples, and shipped as a PR that merges.

This effort captures that research as a durable `docs/explanation/` document rather than letting a
chat answer evaporate — consistent with `docs/explanation/ai-dlc-in-this-repo.md`'s own argument
that reasoning not written down is reasoning that gets lost.

## Stages

| Stage | Outcome |
|-------|---------|
| Research | Web search + arXiv paper retrieval (WebFetch on primary sources, not just search summaries) across four controlled studies on agent context files and one line of commit-message-quality literature. Findings verified against the papers themselves where search summaries seemed loose. |
| Write | `docs/explanation/ai-dlc-external-evidence.md` — Diátaxis Explanation type, since this answers "is it this way for a good reason," not a how-to or reference. Deliberately does not propose changing the `minimal` depth dial or re-litigate ADR 0019 (tool choice); it is new evidence on top of, not a reversal of, either. |
| Cross-link | Added a "See also" row in `docs/explanation/ai-dlc-in-this-repo.md` pointing to the new document, and the new document links back to it plus ADR 0019 and the effort how-to. |
| Record | This effort's own record, appended to the registry and audit log per house convention — including for a docs-only change, matching effort 045's precedent. |

## Units of work

- [x] `docs/explanation/ai-dlc-external-evidence.md` — new.
- [x] `docs/explanation/ai-dlc-in-this-repo.md` — one "See also" row added.
- [x] This effort's own record (`aidlc-docs/efforts/050-ai-dlc-external-evidence/`).
- [x] `aidlc-docs/registry.md` — regenerated with this row.
- [x] `aidlc-docs/audit.md` — planning + construction rows appended.

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | clean — no source files touched |
| `npm run build` | succeeds; `src/data/process-stats.json` regenerated to reflect 50 efforts (count-only change, no ADR count change) |
| `npm run check:aidlc` | OK locally — this diff touches only `docs/` and `aidlc-docs/`, neither path is in `scripts/check-aidlc-sync.mjs`'s "substantive" list, so the gate would pass even without this record; the record is written anyway, matching effort 045's docs-only precedent and this repo's own stated reasoning for why unwritten rationale is a cost, not a savings |
| Scope | Docs-only diff: one new explanation doc, one cross-link addition, this effort's record, the regenerated `process-stats.json`, and the registry/audit rows. No `src/` logic, `content/`, or config changed. |

## Notes

- **No ADR.** No architectural or IA decision is made here — the document is evidence and analysis,
  not a decision to change how this repo records changes. If a future change actually narrows or
  widens the AI-DLC ceremony because of this evidence, that decision gets its own ADR at that time,
  the same pattern ADR 0019 itself used ("if a future need actually appears... that is new evidence
  and gets its own ADR").
- **Honest tension, addressed directly in the document itself**: recording this research as a
  49th/50th-effort-style paper trail is itself an instance of the exact practice under scrutiny.
  The document does not resolve this by asserting the practice is vindicated — the headline finding
  (auto-generated context content shows no measurable benefit and a real cost in the best-controlled
  study found) is stated plainly, including where it cuts against this repo's own prior framing.
- Research sources are cited by URL directly in the document rather than only in this effort record,
  since the document is the artifact meant to outlive this specific chat request.
