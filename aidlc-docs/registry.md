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
| 007 | 007-docs-first-aidlc-restructure | Docs-first AI-DLC restructure | complete | 2026-08-23 | 2026-08-23 | 0008 | `ac2a0a3` (PR #3) |
| 008 | 008-achievements-iitm-branddiffusion | Achievements section, IIT Madras experience, BrandDiffusion project | complete | 2026-08-23 | 2026-08-23 | none | `953ac4f` (PR #4) |
| 009 | 009-recap-net-publication-cleanup | RECAP-Net publication link fix and content reshuffle | complete | 2026-08-23 | 2026-08-23 | none | `1f71772` (PR #5) |
| 010 | 010-enforce-aidlc-recording | CI-enforced AI-DLC recording | complete | 2026-08-23 | 2026-08-23 | 0009 | PR "Enforce AI-DLC recording in CI" |
| 011 | 011-segmentation-overlay-redesign | Segmentation-overlay redesign | complete | 2026-08-25 | 2026-08-25 | 0010 | PR "Segmentation-overlay redesign" |
| 012 | 012-responsive-image-pipeline | Build-time responsive image pipeline | complete | 2026-08-25 | 2026-08-25 | none | PR "Build-time responsive image pipeline" |
| 013 | 013-rebuild-on-thine-model | Rebuild from scratch on the thine.com model | complete | 2026-08-25 | 2026-08-25 | 0011 | branch `extremechange` |
| 014 | 014-scroll-performance | Scroll performance, passage copy, hydration-safe reduced motion | complete | 2026-08-25 | 2026-08-25 | none | branch `extremechange` |
| 015 | 015-ux-clarity-pass | UX clarity pass: plain-language copy, way home, brain layout | complete | 2026-08-25 | 2026-08-25 | none | branch `extremechange` |
| 016 | 016-lexsi-additions | Additive motion and craft details from the lexsi.ai teardown | complete | 2026-08-26 | 2026-08-26 | none | branch `extremechange` |
| 017 | 017-project-case-studies | Project case studies written from their READMEs | complete | 2026-08-26 | 2026-08-26 | none | branch `extremechange` |
| 018 | 018-morph-and-segmentation | Shared-element morph and illustrative segmentation | complete | 2026-08-26 | 2026-08-26 | none | branch `extremechange` |
| 019 | 019-two-new-case-studies | Two new case studies: BrainwavesFinland and SAAKSHI | complete | 2026-08-26 | 2026-08-26 | none | branch `extremechange` |
| 020 | 020-accessibility-aa-pass | Accessibility AA pass: label and footer contrast, logo accessible name | complete | 2026-08-27 | 2026-08-27 | none | branch `extremechange` |
| 021 | 021-quality-gates-and-lighthouse-fixes | PR quality gates (smoke + Lighthouse CI) and the defects they found | complete | 2026-08-27 | 2026-08-27 | 0012 | branch `extremechange` |
| 022 | 022-resume-and-gallery-refresh | Résumé refresh and seven new gallery photos | complete | 2026-08-27 | 2026-08-27 | none | `560bca6`, merged into branch `extremechange` |
| 024 | 024-agent-facing-site | Agent-facing site: generated `llms.txt`/`llms-full.txt` and a capability-checked WebMCP `searchProjects` tool | complete | 2026-08-28 | 2026-08-28 | 0014 | branch `feat/agent-facing-site` |

## Status summary

| Status | Count |
|--------|-------|
| complete | 23 |
| in-progress | 0 |
| blocked | 0 |
| failed | 0 |
| abandoned | 0 |
| **Total** | **23** |

All of efforts 001-006 and 008 were retrofitted into effort format after the fact; none was recorded contemporaneously. They differ in how much source material survived:

- **001-004** — reconstructed from commit diffs alone. The commits (`lets see`, `hmmm`, `okays`, `soz`) recorded no rationale, so intent was inferred from what the code does.
- **005-006, 008** — reconstructed from PR #1, #2, and #4, which do carry written rationale. These are the more reliable records.

Effort 007 was recorded as it happened (planning gate logged live) but its registry/audit entries fell out of sync with the merged PR until effort 009's cleanup. Effort 009 was the first recorded start-to-finish with no drift; effort 010 makes that mandatory — the `aidlc-check` CI gate (ADR 0009) now fails any PR whose substantive diff ships without an `aidlc-docs/` update.

Next effort number: 025
