#!/usr/bin/env node
/**
 * Regenerate resume/resume.tex from src/content/site.ts, then compile it to
 * public/resume.pdf if a LaTeX toolchain is available locally.
 *
 *   src/content/site.ts (person, experience, story.education)
 *     -> scripts/lib/resume-tex.mjs (pure renderer)
 *     -> resume/resume.tex (Header/Education/Experience sections spliced in
 *        place between % AUTO-GENERATED markers; Projects/Technical Skills/
 *        Key Achievements are hand-maintained and untouched)
 *     -> public/resume.pdf (pdflatex/latexmk, if present on PATH)
 *
 * Idempotent: re-running with unchanged site.ts data reproduces the same
 * resume/resume.tex byte-for-byte (only the generated regions can change,
 * and they change only when the underlying data does).
 *
 * Mirrors scripts/build-llms-txt.mjs's pattern: load site.ts by transpiling
 * it in memory (it is plain typed data with no imports, so this is exact —
 * no second copy of the copy), do the rendering in a pure module, and keep
 * this file to I/O + process orchestration only.
 *
 * This script never fails because a LaTeX toolchain is missing: it renders
 * and writes resume/resume.tex unconditionally (no toolchain needed for
 * that step, matching ticket #32's acceptance criterion), then attempts a
 * compile and prints a clear, actionable message if none is found — it
 * does not throw a raw ENOENT.
 */
import { spawnSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";
import { renderResumeTex } from "./lib/resume-tex.mjs";

const ROOT = process.cwd();
const RESUME_TEX = join(ROOT, "resume/resume.tex");
const PUBLIC_PDF = join(ROOT, "public/resume.pdf");

/**
 * Load src/content/site.ts the same way scripts/build-llms-txt.mjs does —
 * transpile in memory and import the result — so there is no second copy
 * of the copy to drift.
 */
async function loadSite() {
  const source = await readFile(join(ROOT, "src/content/site.ts"), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: "site.ts",
  });
  const url = "data:text/javascript;base64," + Buffer.from(outputText, "utf8").toString("base64");
  return import(url);
}

function which(cmd) {
  const probe = process.platform === "win32" ? "where" : "which";
  const result = spawnSync(probe, [cmd], { encoding: "utf8" });
  return result.status === 0;
}

async function main() {
  const site = await loadSite();
  const { person, experience, story } = site;

  const currentTex = await readFile(RESUME_TEX, "utf8");
  const nextTex = renderResumeTex(currentTex, {
    person,
    education: story.education,
    experience: experience.items,
  });

  const changed = nextTex !== currentTex;
  await writeFile(RESUME_TEX, nextTex, "utf8");
  console.log(
    changed
      ? `resume: regenerated resume/resume.tex (${experience.items.length} experience entries, ${story.education.length} education entries)`
      : "resume: resume/resume.tex already up to date with site.ts",
  );

  if (!which("latexmk") && !which("pdflatex")) {
    console.warn(
      "resume: no LaTeX toolchain found on PATH (looked for latexmk, pdflatex).\n" +
        "resume: resume/resume.tex was regenerated, but public/resume.pdf was NOT recompiled.\n" +
        "resume: install a TeX distribution (e.g. MiKTeX, TeX Live) to compile locally, " +
        "or rely on CI (.github/workflows/resume-ci.yml), which compiles via xu-cheng/latex-action.",
    );
    return;
  }

  const workDir = await mkdtemp(join(tmpdir(), "resume-build-"));
  try {
    const texName = "resume.tex";
    await copyFile(RESUME_TEX, join(workDir, texName));

    const useLatexmk = which("latexmk");
    const cmd = useLatexmk ? "latexmk" : "pdflatex";
    const args = useLatexmk
      ? ["-pdf", "-interaction=nonstopmode", "-halt-on-error", texName]
      : ["-interaction=nonstopmode", "-halt-on-error", texName];
    const passes = useLatexmk ? 1 : 2;

    // Reproducible-builds env var, honoured by pdfTeX since TeX Live 2016+:
    // fixes the PDF's /CreationDate, /ModDate and /ID so that compiling
    // byte-identical .tex input twice produces a byte-identical PDF.
    // Without this, ticket #34's "byte-different from what's committed"
    // trigger check would fire on every compile even when nothing about
    // the résumé's content changed, defeating the point of the gate.
    const compileEnv = { ...process.env, SOURCE_DATE_EPOCH: process.env.SOURCE_DATE_EPOCH ?? "0" };

    for (let i = 0; i < passes; i++) {
      const result = spawnSync(cmd, args, { cwd: workDir, encoding: "utf8", env: compileEnv });
      if (result.status !== 0) {
        console.error(result.stdout?.slice(-4000) ?? "");
        console.error(result.stderr?.slice(-4000) ?? "");
        throw new Error(`resume: ${cmd} failed compiling resume/resume.tex (exit ${result.status})`);
      }
    }

    await mkdir(join(ROOT, "public"), { recursive: true });
    await copyFile(join(workDir, "resume.pdf"), PUBLIC_PDF);
    console.log(`resume: compiled public/resume.pdf via ${cmd}`);
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

await main();
