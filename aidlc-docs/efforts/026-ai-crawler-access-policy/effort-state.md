# Effort 026 — AI crawler access policy at the edge

| Field | Value |
|-------|-------|
| Ref | 026-ai-crawler-access-policy |
| Status | complete |
| Depth | minimal |
| Opened | 2026-08-31 |
| Closed | 2026-08-31 |
| Baseline | effort 025 (`main`) |
| ADRs | 0015 |
| Commits | branch `docs/ai-crawler-policy` |
| Reconstructed | no — recorded live |

## Intent

Issue #25: after pointing `harshdipsaha.tech` at Cloudflare, an AI assistant fetching the site
went from retrieving any page in one request to only the home page. The owner asked for study,
an ethical read, and an AI-DLC-flavoured "best practice" definition for this kind of decision —
not a code change.

## Stages

| Stage | Outcome |
|-------|---------|
| Diagnosis | Fetched the live `robots.txt`, found Cloudflare's edge-injected "Managed content" block: a `Content-Signal: search=yes, ai-train=no, use=reference` line for `*`, then an outright `Disallow: /` for nine specific bots including `ClaudeBot`, `GPTBot` and `Google-Extended`. This directly contradicts ADR 0014 (built specifically so agents *can* fetch this site cheaply). The repo's own `src/app/robots.ts` is unchanged and not the source. |
| Decision | ADR 0015: keep `ai-train=no` (protects against uncredited training absorption; no benefit to the site's purpose in granting it) but allow retrieval/reference use for every crawler — the blanket per-bot `Disallow` collapses a distinction the Content-Signal line already draws correctly, and should come off in the Cloudflare dashboard for the seven assistant/search-oriented bots. `Bytespider` and `CCBot` (bulk training crawlers with no retrieval use case) may reasonably stay blocked. |
| Scope boundary | The fix is a Cloudflare dashboard toggle (Security → Bots), outside this repository. No code change is possible or attempted; this effort is the decision record and the actionable checklist only. |

## Units of work

- [x] `docs/adr/0015-ai-crawler-access-policy.md` + a row in `docs/adr/README.md`
- [x] Comment on issue #25 with the finding and a concrete Cloudflare dashboard checklist (a GitHub action, not part of this diff)

## Verification

| Check | Result |
|---|---|
| Live `robots.txt` block quoted accurately | verified by direct fetch, 2026-08-31 |
| `npm run typecheck` | clean (no code touched) |
| `npm run build` | succeeds, 30 static pages |
| `npm run check:aidlc` | OK |

## Notes

This effort cannot close issue #25 by merging a PR — the actual fix is a manual dashboard action
only the owner can take (Cloudflare account access). The PR record and ADR exist so the decision
and its reasoning are captured either way; the issue itself stays open with the checklist until
the owner confirms the toggle is flipped, at which point the ADR's Evidence section should be
updated with a re-fetched `robots.txt` showing the change took effect.
