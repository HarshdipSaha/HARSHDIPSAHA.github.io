# Effort 052 — SAAKSHYA (Code Cubicle 6.0 winner) replaces SAAKSHI

| Field | Value |
|-------|-------|
| Ref | 052-saakshya-replaces-saakshi |
| Status | complete |
| Depth | minimal |
| Opened | 2026-11-16 |
| Closed | 2026-11-16 |
| Baseline | `main` @ `c484256` (effort 051, PR #70, merged) |
| ADRs | none |
| Commits | branch `content/saakshya` |
| Reconstructed | no — recorded live |

## Intent

Effort 051 misread the owner's request. "SAAKSHYA" is not the TechGig × Optum project "SAAKSHI": it is
`HarshdipSaha/cloudinary4eco`, the winner of Code Cubicle 6.0 (README status: "winner of the hackathon";
the owner named the event). The owner's correction: add SAAKSHYA as a winner, and **remove the Optum
hackathon project (SAAKSHI) from the projects list**.

## Units of work

- [x] `content/projects/SAAKSHYA.mdx` — new, from the `cloudinary4eco` README; carries the repository's
      own limits (Cloudinary add-ons unavailable at probe time, no C2PA signing, fixtures are not field evidence).
- [x] `content/projects/SAAKSHI.mdx` and `project_images/saakshi.png` — deleted; `PROJECT_MAP` entry replaced.
- [x] Banner: a baseline/follow-up pair from the repository's seeded test images, declared as fixtures in
      the page. The README's hero image was not used because it is a concept mock-up with invented figures.
- [x] `AGENTS.md`, `CONTEXT.md`, `evals/README.md` — "BrainwavesFinland and SAAKSHI are unverifiable"
      corrected to BrainwavesFinland only. Historic ADR 0013 and earlier effort records are left as written.
- [x] `src/data/factuality.json`, `src/data/images.json` — regenerated.

## Verification

| Check | Result |
|---|---|
| `npm run eval:factuality` | exit 0 — 105 grounded, 10 baselined, 0 ungrounded, 23 unverifiable |
| `npm run check:factuality-manifest` | see audit row |
| `npm run typecheck` / `npm run build` | see audit row |

## Notes

- **Winner claim is owner-supplied.** The README says "winner of the hackathon" without naming the event;
  Code Cubicle 6.0 comes from the owner. The eval extracts no claim from it.
- Deleting a case study means its URL `/projects/saakshi` now 404s.
