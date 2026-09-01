#!/usr/bin/env node
/**
 * Draft the AI-DLC effort-record skeleton for an automated résumé-refresh
 * PR (ticket #34): a numbered effort folder, a registry row, and an audit
 * row, so `npm run check:aidlc` passes on the opened PR like any other.
 *
 * Run by .github/workflows/resume-auto-refresh.yml only after it has
 * confirmed both that src/content/site.ts changed on the push AND that the
 * recompiled resume.pdf is byte-different from the one currently
 * committed — never on a no-op run. This script itself does not make that
 * decision; it only writes the record once the workflow has.
 *
 * Usage:
 *   node scripts/resume-auto-effort.mjs "<diff summary text>"
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
const REGISTRY = join(ROOT, "aidlc-docs/registry.md");
const AUDIT = join(ROOT, "aidlc-docs/audit.md");
const EFFORTS_DIR = join(ROOT, "aidlc-docs/efforts");

const diffSummary = process.argv[2]?.trim() || "(no diff summary supplied)";
const today = new Date().toISOString().slice(0, 10);

function pad3(n) {
  return String(n).padStart(3, "0");
}

async function nextEffortNumber() {
  const registry = await readFile(REGISTRY, "utf8");
  const match = registry.match(/Next effort number:\s*(\d+)/);
  if (!match) throw new Error("resume-auto-effort: could not find 'Next effort number:' in registry.md");
  return Number(match[1]);
}

async function main() {
  const n = await nextEffortNumber();
  const ref = `${pad3(n)}-resume-auto-refresh-${today.replace(/-/g, "")}`;
  const dir = join(EFFORTS_DIR, ref);
  await mkdir(dir, { recursive: true });

  const effortState = `# Effort ${pad3(n)} — Résumé auto-refresh from a site.ts career-fact change

| Field | Value |
|-------|-------|
| Ref | ${ref} |
| Status | awaiting-approval |
| Depth | minimal |
| Opened | ${today} |
| Closed | — |
| Baseline | \`main\` at the commit this workflow ran on |
| ADRs | none — this PR only regenerates content, it does not change the pipeline's design (see docs/adr/0015-resume-as-generated-artefact.md for that decision) |
| Commits | opened by .github/workflows/resume-auto-refresh.yml |
| Reconstructed | no — drafted live by the automation this record documents |
| Closes | n/a — this is not a ticket PR |

## Intent

A push to \`main\` changed \`src/content/site.ts\`'s \`person\`, \`experience\`, or \`education\` data, and
the recompiled \`resume.pdf\` came out byte-different from what is currently committed. Per
docs/adr/0015-resume-as-generated-artefact.md, the résumé's Header/Education/Experience sections are
generated from that same data, so this PR exists to keep \`resume/resume.tex\` and \`public/resume.pdf\`
from drifting out of sync with the site — the same problem this whole pipeline (effort 026) was built
to solve, now running unattended.

**This PR is a proposal, not a publish.** The workflow that opened it has no merge permission and
performs no merge step; a human reviews the rendered résumé and merges by hand, same as every other
change to this site.

## What changed in the data

${diffSummary}

## Stages

| Stage | Outcome |
|-------|---------|
| Trigger | \`.github/workflows/resume-auto-refresh.yml\` detected a push to \`main\` touching \`src/content/site.ts\` |
| Regenerate | \`node scripts/build-resume.mjs\` re-rendered \`resume/resume.tex\`'s generated sections |
| Compile | \`xu-cheng/latex-action\` compiled \`resume/resume.tex\` to PDF |
| Diff | The compiled PDF was byte-compared against the committed \`public/resume.pdf\`; they differ, which is why this PR exists |
| Verify | \`node scripts/verify-resume-pdf.mjs\` confirmed the compiled PDF's extracted text contains the current name/roles/GPA |
| Record | This effort skeleton, opened at \`awaiting-approval\` for the human reviewer to move to \`complete\` on merge |

## Units of work

- [x] \`resume/resume.tex\` regenerated (Header/Education/Experience sections only)
- [x] \`public/resume.pdf\` recompiled and updated
- [ ] Human review of the rendered résumé
- [ ] Merge (by a human — this workflow does not merge its own PR)

## Verification

Automated, by the workflow that opened this PR:

- \`node --test scripts/resume-tex.test.mjs\` — renderer unit tests
- \`node scripts/verify-resume-pdf.mjs resume/resume.pdf\` — compiled PDF's extracted text contains the
  current person/company/role/GPA facts from \`src/content/site.ts\`

## Notes

Opened automatically. If you are reviewing this PR: check that the rendered résumé still reads
correctly (page count, no overflow) before merging — the automated checks above confirm the *content*
is present and correctly escaped, not that the *layout* still looks right.
`;

  const requirementsDelta = `# Requirements delta — ${ref}

## NEW

None — this is a content regeneration, not a new requirement.

## CHANGED

- \`resume/resume.tex\`'s generated Header/Education/Experience sections now reflect the
  \`person\`/\`experience\`/\`education\` data in \`src/content/site.ts\` as of this push.
- \`public/resume.pdf\` recompiled from the above.

## REMOVED

None.
`;

  await writeFile(join(dir, "effort-state.md"), effortState, "utf8");
  await writeFile(join(dir, "requirements-delta.md"), requirementsDelta, "utf8");

  // Registry: insert a row before the "## Status summary" section and bump
  // the "Next effort number" line. This file is documented as a derived
  // view rebuilt from effort-state.md files; a human running a later
  // effort is expected to regenerate it in full — this keeps the gate
  // passing on THIS PR without hand-patching every other row.
  let registry = await readFile(REGISTRY, "utf8");
  const row = `| ${pad3(n)} | ${ref} | Résumé auto-refresh from a site.ts career-fact change | awaiting-approval | ${today} | — | none | opened by .github/workflows/resume-auto-refresh.yml |\n`;
  registry = registry.replace(/\n## Status summary/, `\n${row}\n## Status summary`);
  registry = registry.replace(/Next effort number:\s*\d+/, `Next effort number: ${n + 1}`);
  await writeFile(REGISTRY, registry, "utf8");

  // Audit row.
  let audit = await readFile(AUDIT, "utf8");
  const auditRow = `| ${today} | ${pad3(n)} | Planning | Automated (site.ts career-fact change) | \`.github/workflows/resume-auto-refresh.yml\` detected a push to \`main\` touching \`src/content/site.ts\` whose recompiled \`resume.pdf\` differs from the committed one, and opened this PR. No merge step exists in that workflow — human review and merge only. |\n`;
  audit = audit.trimEnd() + "\n" + auditRow;
  await writeFile(AUDIT, audit, "utf8");

  console.log(`resume-auto-effort: drafted effort ${pad3(n)} at aidlc-docs/efforts/${ref}/`);
}

await main();
