<!-- This repo runs AI-DLC. CI (aidlc-check) fails substantive PRs that ship without their record. -->

## Summary

<!-- What changed and why. -->

## AI-DLC record

- Effort: `aidlc-docs/efforts/NNN-<ref>/` <!-- link it, or write "[trivial] — typo-level, no effort" and put [trivial] in the PR title -->
- [ ] `effort-state.md` written/updated (intent, stages, verification)
- [ ] `aidlc-docs/registry.md` regenerated from effort-state files
- [ ] `aidlc-docs/audit.md` gate rows added
- [ ] ADR written — **only if** an architectural/IA decision was made (else: "n/a")
- [ ] `CONTEXT.md` / `docs/` synced — **only if** facts stated there drifted (else: "n/a")

## Verification

- [ ] `npx tsc --noEmit -p tsconfig.json` — clean (paste is fine)
- [ ] `npm run build` — succeeds, `out/` contains affected routes
