# Effort 019 — Two new case studies: BrainwavesFinland and SAAKSHI

| Field | Value |
|-------|-------|
| Ref | 019-two-new-case-studies |
| Status | complete |
| Depth | minimal |
| Opened | 2026-08-26 |
| Closed | 2026-08-26 |
| Baseline | effort 018 (branch `extremechange`) |
| ADRs | none — content |
| Commits | branch `extremechange` |
| Reconstructed | no — recorded live |

## Intent

Owner asked for two more detailed project pages, neither of which has a public repository:

1. **BrainwavesFinland** — microwave-tomography tumour localisation on a Finnish brain-phantom
   dataset. Repository is private: explain the problem, the data and what was achieved; do **not**
   publish the full reconstruction pipeline.
2. **SAAKSHI** — the owner's hackathon project (TechGig × Optum, Inclusive Innovation for Bharat) in
   the private repository `InnovationForIndia-Optum`. An "Optum AI Enablement Agent" page was written
   first by misreading the request and removed in the same effort.

Both must stay out of the home page's selected six (`selectedProjects.slugs` unchanged).

## Sources

- BrainwavesFinland: repository `README.md`, `recon/RESULTS.md`, `Exp 3C/README.md`, `vis/README.md`
  fetched via the GitHub API with the owner's token; numbers quoted exactly (1.4 cm / 2° / 100 %
  sector; 1.9 cm / 78 % / 1.3 cm centre). Pipeline specifics (common-mode removal method, Tikhonov
  details, geometry-fit procedure) deliberately generalised. "Finland" is the owner's statement.

- SAAKSHI: the repository has no README at root; sources were `05_Prototype/README.md`,
  `06_Concept_and_Evidence/PRODUCT.md`, `05_Prototype/docs/DEMO_OUTPUT.txt` and the pitch site's copy
  (`04_Website/index.html`). Every number on the page appears in those files; the page repeats the
  repository's own integrity notes (synthetic dataset, simulated signals, illustrative number).

## Banners

- BrainwavesFinland: the repository's own reconstruction montage (`recon/outputs/3C_*_montage.png`,
  ten positions, bright spot = recovered tumour). The repository has no photograph of the physical
  setup; the owner can drop one into `project_images/brainwaves finland.png` to replace it.

- SAAKSHI: a screenshot of the submission's own pitch website (`04_Website/index.html`), rendered
  locally with Playwright at 1400 × 1000.

## Verification

- `npm run typecheck` clean; `npm run build` succeeds; both pages render at `/projects/<slug>`.
- Neither slug appears in `selectedProjects.slugs`.
