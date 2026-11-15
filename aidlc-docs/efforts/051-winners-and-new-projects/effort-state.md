# Effort 051 — Winner label on SAAKSHI; three new case studies

| Field | Value |
|-------|-------|
| Ref | 051-winners-and-new-projects |
| Status | complete |
| Depth | minimal |
| Opened | 2026-11-15 |
| Closed | 2026-11-15 |
| Baseline | `main` @ `de73cb2` (effort 050, PR #69, merged) |
| ADRs | none |
| Commits | branch `content/winners-and-new-projects` |
| Reconstructed | no — recorded live |

## Intent

Owner asked, in chat, to bring the projects list up to date with their GitHub:

- label **SAAKSHI** a winner (TechGig × Optum, Inclusive Innovation for Bharat);
- add `tigergraph-agentic-graphrag` as a project, labelled **top 10 so far, hackathon in progress**;
- add `say-less`;
- add `parkinsonnn` (made public by the owner as part of the same request);
- "remove" `InnovationForIndia-Optum`.

The last item had no separate site entry to remove: SAAKSHI *is* that repository, and it already
appeared only as `content/projects/SAAKSHI.mdx` with no `link`. It was read as "do not link or name
that repository", so SAAKSHI keeps no `link` and gains no repo reference. The GitHub repository itself
was not touched.

## Units of work

- [x] `content/projects/SAAKSHI.mdx` — summary and Context now say winner; the stale "repository is
      private while the competition runs" sentence is removed (the repository is public).
- [x] `content/projects/TigerGraph-Investigation-Certificates.mdx` — new; carries an explicit
      "Status: hackathon in progress — top 10 so far" block. Numbers come from the repo README.
- [x] `content/projects/Say-Less.mdx` — new; numbers from the repo README.
- [x] `content/projects/DaT-Parkinsons-Challenge.mdx` — new; rank, log loss and AUROC from the repo README.
- [x] `project_images/` — three banners (`say less.png`, `investigation certificates.png`,
      `dat parkinsons.png`) taken from each repo's own committed figures (the TigerGraph one cropped to the per-type accuracy bars — the full image carries token and latency tiles that disagree with the README table), plus three `PROJECT_MAP`
      entries in `scripts/build-images.mjs`. No scan imagery is published.
- [x] `evals/factuality/baseline.json` — one entry, "top 10", with the reason naming the owner as the source.
- [x] `src/data/factuality.json`, `src/data/images.json` — regenerated, not hand-edited.

## Verification

| Check | Result |
|---|---|
| `npm run eval:factuality` | exit 0 — 105 grounded, 10 baselined, 0 ungrounded, 41 unverifiable |
| `npm run check:factuality-manifest` | OK |
| `node --test` over the repo's `*.test.mjs` files | 60 / 60 pass |
| `npm run typecheck` | clean |
| `npm run build` | succeeds; three new `/projects/<slug>` routes prerendered |

## Notes

- **The "top 10" claim is interim.** It is owner-supplied and not in any README; the baseline reason says
  to update or remove it when results are announced.
- **"Winner" on SAAKSHI is owner-supplied too.** SAAKSHI has no `link`, so its claims are reported
  `unverifiable` by name, as before; the gate does not check the winner claim.
- `npm run test:unit` fails on Node 22 here (`node --test evals scripts` treats the directory names as
  module paths); it is an environment difference from CI's Node 20, not caused by this change.
