#!/usr/bin/env node
/**
 * Smoke-test that a compiled resume.pdf contains real, correct content —
 * not just that the file exists. Extracts the PDF's text (pdf-parse) and
 * asserts it contains the person's name, current role/company names, and
 * the GPA from src/content/site.ts.
 *
 * This is what catches a LaTeX escaping bug that corrupts a line (an
 * unescaped `&` swallowing the rest of a \resumeSubheading argument, for
 * instance) without a human needing to open the PDF and read it (ticket
 * #33's acceptance criterion).
 *
 * Usage: node scripts/verify-resume-pdf.mjs [path-to-pdf]
 *   defaults to public/resume.pdf
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import ts from "typescript";
// Import the submodule directly, not the package root: pdf-parse's
// package-root index.js runs a debug self-test at import time when
// `module.parent` is unset (true for a dynamic import with no CJS parent),
// which throws ENOENT for a test fixture that doesn't exist in this repo.
import pdf from "pdf-parse/lib/pdf-parse.js";

const ROOT = process.cwd();
const pdfPath = process.argv[2] ? join(ROOT, process.argv[2]) : join(ROOT, "public/resume.pdf");

async function loadSite() {
  const source = await readFile(join(ROOT, "src/content/site.ts"), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: "site.ts",
  });
  const url = "data:text/javascript;base64," + Buffer.from(outputText, "utf8").toString("base64");
  return import(url);
}

/** Collapse whitespace so a line-wrapped PDF extraction still matches. */
function normalise(text) {
  return text.replace(/\s+/g, " ");
}

async function main() {
  const site = await loadSite();
  const { person, experience, story } = site;

  const buffer = await readFile(pdfPath);
  const { text, numpages } = await pdf(buffer);
  const flat = normalise(text);

  const expected = [
    person.name,
    ...experience.items.map((item) => item.company),
    ...experience.items.map((item) => item.role),
    ...story.education.map((entry) => entry.name),
  ];

  // The GPA figure specifically, called out by ticket #33: "an unescaped &
  // or % from a project name" is the failure mode this guards against.
  const gpaMatch = story.education.map((e) => e.detail).join(" ").match(/GPA\s+([\d.]+)/i);
  if (gpaMatch) expected.push(`GPA ${gpaMatch[1]}`);

  const missing = expected.filter((needle) => !flat.includes(normalise(needle)));

  console.log(`resume: verifying ${pdfPath} (${numpages} page${numpages === 1 ? "" : "s"}, ${text.length} chars extracted)`);

  if (missing.length > 0) {
    console.error("resume: PDF text verification FAILED — missing expected strings:");
    for (const m of missing) console.error(`  - ${JSON.stringify(m)}`);
    console.error("resume: this usually means an unescaped LaTeX special character corrupted a line.");
    process.exit(1);
  }

  console.log(`resume: PDF text verification passed — found all ${expected.length} expected strings.`);
}

await main();
