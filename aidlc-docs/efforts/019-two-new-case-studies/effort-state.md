# Effort 019 — New case studies: BrainwavesFinland (and SAAKSHI, pending)

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
2. **SAAKSHI** — the owner's hackathon project in the private repository `InnovationForIndia-Optum`.
   An "Optum AI Enablement Agent" page was written first by misreading the request and was removed in
   the same effort; SAAKSHI is pending until the private repository's docs can be fetched (GitHub
   API unreachable from the build machine at the time of writing).

Both must stay out of the home page's selected six (`selectedProjects.slugs` unchanged).

## Sources

- BrainwavesFinland: repository `README.md`, `recon/RESULTS.md`, `Exp 3C/README.md`, `vis/README.md`
  fetched via the GitHub API with the owner's token; numbers quoted exactly (1.4 cm / 2° / 100 %
  sector; 1.9 cm / 78 % / 1.3 cm centre). Pipeline specifics (common-mode removal method, Tikhonov
  details, geometry-fit procedure) deliberately generalised. "Finland" is the owner's statement.

## Banners

- BrainwavesFinland: the repository's own reconstruction montage (`recon/outputs/3C_*_montage.png`,
  ten positions, bright spot = recovered tumour). The repository has no photograph of the physical
  setup; the owner can drop one into `project_images/brainwaves finland.png` to replace it.

## Verification

- `npm run typecheck` clean; `npm run build` succeeds; both pages render at `/projects/<slug>`.
- Neither slug appears in `selectedProjects.slugs`.
