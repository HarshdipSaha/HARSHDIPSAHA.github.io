# Effort 005 — Requirements delta

Baseline: `aidlc-docs/inception/requirements.md`

## NEW
| ID | Requirement | Rationale |
|----|-------------|-----------|
| R-022 | About page displays a Work Experience section | Employment history is core portfolio content; the section had been empty and hidden |
| R-023 | Work Experience lists the Optum AI Engineer Intern role (AI-DLC pilot team) with eight achievement bullets | Most substantive professional work to date |
| R-024 | Studies list includes Amazon ML Summer School (Jul 2026 - Aug 2026) | Completes the education timeline |
| R-025 | Content changes must pass `npx tsc --noEmit` before merge | First type-check gate applied to a change in this repo |
| R-026 | Changes land through a reviewed GitHub pull request | PR body carries the rationale that commit messages historically did not |

## CHANGED
| ID | Was | Now | Rationale |
|----|-----|-----|-----------|
| R-022 | `about.work.display` was `false`; section built but not rendered | `about.work.display` is `true`; section renders | Section now has real content to show |

## UNCHANGED but affected
- R-013 typed content — new work entries conform to the existing `content.types.ts` shapes without extending them.
- R-015 accent spans in copy — reused, not redefined.

## Acceptance criteria
- [x] Optum role with all eight achievement bullets present in `src/resources/content.tsx`
- [x] Amazon ML Summer School entry present in studies
- [x] `about.work.display` is `true` and the section renders on `/about`
- [x] `npx tsc --noEmit` clean
- [x] PR #1 reviewed and merged
