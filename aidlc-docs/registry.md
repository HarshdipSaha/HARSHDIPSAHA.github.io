# Effort registry

**GENERATED FILE — do not hand-edit.** This is a derived view, rebuilt by reading the `effort-state.md` file in every `aidlc-docs/efforts/{NNN}-{ref}/` directory. The filesystem is the source of truth. If this table disagrees with an effort's state file, the state file wins — regenerate this file rather than patching it.

| Effort | Ref | Title | Status | Opened | Closed | ADRs | Commits |
|--------|-----|-------|--------|--------|--------|------|---------|
| 001 | 001-onceui-template-adoption | Once UI template adoption | complete | 2026-01-27 | 2026-01-27 | 0001, 0002, 0007 | `d9e0d8a`, `ce54d2a`, `b39a13d`, `50be3ad`, `43c3e5c`, `11c1782`, `faf40ff` |
| 002 | 002-flatten-and-personalise | Flatten and personalise | complete | 2026-01-28 | 2026-01-28 | 0003, 0006 | `e3d7eea`, `e7a10c7`, `3df501a`, `c91a044` |
| 003 | 003-content-schema-about-components | Content schema and About components | complete | 2026-01-28 | 2026-01-28 | 0004 | `7eba8fd`, `3a0515f`, `6e437db`, `e6629aa` |
| 004 | 004-drop-zone-image-sync-pipeline | Drop-zone image sync pipeline | complete | 2026-01-28 | 2026-01-28 | 0005 | `0814927` |
| 005 | 005-optum-experience | Optum experience | complete | 2026-08-23 | 2026-08-23 | none | `6799e4b` (PR #1) |
| 006 | 006-atomnet-project | AtoM-Net project | complete | 2026-08-23 | 2026-08-23 | none | `1cde09f` (PR #2) |
| 007 | 007-docs-first-aidlc-restructure | Docs-first AI-DLC restructure | in-progress | 2026-08-23 | — | 0008 | pending |

## Status summary

| Status | Count |
|--------|-------|
| complete | 6 |
| in-progress | 1 |
| blocked | 0 |
| failed | 0 |
| abandoned | 0 |
| **Total** | **7** |

All of efforts 001-006 were retrofitted into effort format on 2026-08-23; none was recorded contemporaneously. They differ in how much source material survived:

- **001-004** — reconstructed from commit diffs alone. The commits (`lets see`, `hmmm`, `okays`, `soz`) recorded no rationale, so intent was inferred from what the code does.
- **005-006** — reconstructed from PR #1 and PR #2, which do carry written rationale. These are the more reliable records.

Effort 007 is the current effort and is being recorded as it happens.

Next effort number: 008
