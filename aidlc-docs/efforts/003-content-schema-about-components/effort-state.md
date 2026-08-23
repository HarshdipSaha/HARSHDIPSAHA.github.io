# Effort 003 — Content schema and About components

| Field | Value |
|-------|-------|
| Ref | 003-content-schema-about-components |
| Status | complete |
| Depth | standard |
| Opened | 2026-01-28 |
| Closed | 2026-01-28 |
| Baseline | aidlc-docs/inception/ |
| ADRs | docs/adr/0004-*.md |
| Commits | `7eba8fd`, `3a0515f`, `6e437db`, `e6629aa` |
| Reconstructed | yes — backfilled 2026-08-23 from commit diffs |

## Intent
Give the About page first-class, hand-written sections — research interests and a tech-stack strip — backed by typed content shapes and an icon registry, so About stopped being template-shaped.

## Stages
| Stage | Outcome |
|-------|---------|
| Effort planning | Not recorded. Reconstructed from diffs. |
| Functional design | Content-as-data: typed structures in `src/resources/content.tsx`, rendered by dedicated components under `src/components/about/`. |
| NFRs | Icons centralised in one registry to avoid per-component icon imports. |
| Code | 329 insertions total across components, types, resources and CSS. |
| Build & test | Visual check on the deployed page. No automated tests. |

## Units of work
- [x] Research interests section — `src/components/about/ResearchInterestsBlock.tsx` (30 lines)
- [x] Tech stack strip — `src/components/about/TechStackStrip.tsx` (66) + `TechStackStrip.module.scss` (42)
- [x] Icon registry — `src/resources/icons.ts` (20 lines)
- [x] Content type extension — `src/types/content.types.ts` (+8) for the new content shapes
- [x] Content data — `src/resources/content.tsx` (+31): `techStack`, `researchInterests`
- [x] Accent-span styling — `custom.css` (+7)
- [x] Copy tuning follow-ups — `src/resources/content.tsx` (small commits)

## Verification
Rendered check of `/about` on the deployed site: both new sections present, icons resolving from the registry, accent spans styled. No type-check or test gate existed in the repo at this point.

## Notes
- JSX-in-content: accent spans are embedded directly in the copy in `content.tsx`, coupling text to styling. Known and accepted; rationale recorded in ADR 0004. The cost is that copy edits can silently break layout.
- The icon registry (`src/resources/icons.ts`) becomes the single choke point for adding an icon — every later effort that adds a tech or interest must touch it.
