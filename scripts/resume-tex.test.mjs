import assert from "node:assert/strict";
import test from "node:test";
import {
  escapeLatex,
  renderEducationFragment,
  renderExperienceFragment,
  renderHeaderFragment,
  renderResumeTex,
  spliceSection,
} from "./lib/resume-tex.mjs";

/**
 * The renderer is tested at its pure seam: site.ts-shaped data in, LaTeX
 * fragments out. No LaTeX toolchain is involved (ticket #32's acceptance
 * criterion) — compiling the result is a separate, non-unit-test concern
 * (npm run resume:build).
 */

const PERSON = {
  name: "Harshdip Saha",
  email: "harshdipsaha@gmail.com",
  github: "https://github.com/HARSHDIPSAHA",
  linkedin: "https://www.linkedin.com/in/harshdip-saha",
  siteUrl: "https://harshdipsaha.tech",
};

const EDUCATION = [
  { name: "Netaji Subhas University of Technology, New Delhi", detail: "B.Tech CSE (AI) · GPA 8.78 of 10 · class of 2027" },
  { name: "Kendriya Vidyalaya No. 2, Delhi Cantt", detail: "Class XII, 95.6% · Class X, 98.4%" },
];

const EXPERIENCE = [
  {
    company: "Optum (UnitedHealth Group)",
    role: "AI Engineer Intern — AI-DLC Pilot Team",
    when: "Jun – Aug 2026",
    points: ["Built an internal assistant that helps up to 35,000 employees.", "Interviewed seven kinds of specialist."],
  },
  {
    company: "IIT Madras",
    role: "Research Intern — Scientific Computing (remote)",
    when: "Jan 2026 – present",
    points: ["Developing PyAMorph, a signed-distance-function library."],
  },
];

/** A minimal document carrying all three markers, standing in for resume/resume.tex. */
function fixtureTex() {
  return [
    "\\documentclass{article}",
    "\\begin{document}",
    "% AUTO-GENERATED:HEADER-START",
    "old header",
    "% AUTO-GENERATED:HEADER-END",
    "\\section{Education}",
    "\\resumeSubHeadingListStart",
    "% AUTO-GENERATED:EDUCATION-START",
    "old education",
    "% AUTO-GENERATED:EDUCATION-END",
    "\\resumeSubHeadingListEnd",
    "\\section{Experience}",
    "\\resumeSubHeadingListStart",
    "% AUTO-GENERATED:EXPERIENCE-START",
    "old experience",
    "% AUTO-GENERATED:EXPERIENCE-END",
    "\\resumeSubHeadingListEnd",
    "\\end{document}",
  ].join("\n");
}

/* ------------------------------------------------------------------ *
 * Escaping — the hard requirement. Every character in one fixture.
 * ------------------------------------------------------------------ */

test("escapeLatex escapes every LaTeX special character", () => {
  const fixture = "Tom & Jerry get 50% off #1 rank_ed {team} ~tilde^caret \\backslash";
  const escaped = escapeLatex(fixture);

  assert.equal(
    escaped,
    "Tom \\& Jerry get 50\\% off \\#1 rank\\_ed \\{team\\} \\textasciitilde{}tilde\\textasciicircum{}caret \\textbackslash{}backslash",
  );
});

test("escapeLatex escapes each special character individually", () => {
  assert.equal(escapeLatex("&"), "\\&");
  assert.equal(escapeLatex("%"), "\\%");
  assert.equal(escapeLatex("$"), "\\$");
  assert.equal(escapeLatex("#"), "\\#");
  assert.equal(escapeLatex("_"), "\\_");
  assert.equal(escapeLatex("{"), "\\{");
  assert.equal(escapeLatex("}"), "\\}");
  assert.equal(escapeLatex("~"), "\\textasciitilde{}");
  assert.equal(escapeLatex("^"), "\\textasciicircum{}");
  assert.equal(escapeLatex("\\"), "\\textbackslash{}");
});

test("escapeLatex round-trips a fixture entry containing &, %, and _", () => {
  const entry = {
    company: "Tom & Jerry Inc.",
    role: "50% Engineer_v2",
    when: "Jan_2026",
    points: ["Shipped a & b, saved 20% cost_basis."],
  };
  const frag = renderExperienceFragment([entry]);
  assert.ok(frag.includes("Tom \\& Jerry Inc."));
  assert.ok(frag.includes("50\\% Engineer\\_v2"));
  assert.ok(frag.includes("Jan\\_2026"));
  assert.ok(frag.includes("Shipped a \\& b, saved 20\\% cost\\_basis."));
  // and no raw un-escaped specials leaked through
  assert.ok(!/[^\\]&/.test(frag));
  assert.ok(!/[^\\]%/.test(frag));
  assert.ok(!/[^\\]_/.test(frag));
});

test("escapeLatex handles non-string input", () => {
  assert.equal(escapeLatex(undefined), "");
  assert.equal(escapeLatex(null), "");
  assert.equal(escapeLatex(42), "42");
});

/* ------------------------------------------------------------------ *
 * Header
 * ------------------------------------------------------------------ */

test("renderHeaderFragment includes the name and every contact link", () => {
  const frag = renderHeaderFragment(PERSON);
  assert.ok(frag.includes("Harshdip Saha"));
  assert.ok(frag.includes("mailto:harshdipsaha@gmail.com"));
  assert.ok(frag.includes(PERSON.linkedin));
  assert.ok(frag.includes(PERSON.github));
  assert.ok(frag.includes(PERSON.siteUrl));
});

test("renderHeaderFragment escapes the visible name but not the href targets", () => {
  const frag = renderHeaderFragment({ ...PERSON, name: "A & B Corp" });
  assert.ok(frag.includes("A \\& B Corp"));
  assert.ok(frag.includes(`\\href{mailto:${PERSON.email}}`), "mailto target left unescaped");
});

/* ------------------------------------------------------------------ *
 * Education
 * ------------------------------------------------------------------ */

test("renderEducationFragment includes every education entry from site.ts", () => {
  const frag = renderEducationFragment(EDUCATION);
  for (const entry of EDUCATION) {
    assert.ok(frag.includes(entry.name), `missing ${entry.name}`);
  }
  assert.ok(frag.includes("GPA 8.78 of 10"));
});

test("renderEducationFragment escapes % in GPA-style details", () => {
  const frag = renderEducationFragment([{ name: "School", detail: "95.6% marks" }]);
  assert.ok(frag.includes("95.6\\% marks"));
});

/* ------------------------------------------------------------------ *
 * Experience
 * ------------------------------------------------------------------ */

test("renderExperienceFragment includes every experience entry from site.ts", () => {
  const frag = renderExperienceFragment(EXPERIENCE);
  for (const item of EXPERIENCE) {
    assert.ok(frag.includes(escapeLatexPlain(item.company)), `missing company ${item.company}`);
    assert.ok(frag.includes(escapeLatexPlain(item.role)), `missing role ${item.role}`);
    for (const point of item.points) {
      assert.ok(frag.includes(escapeLatexPlain(point)), `missing bullet: ${point}`);
    }
  }
});

// Local helper mirroring escapeLatex, used only to build expected substrings above.
function escapeLatexPlain(s) {
  return escapeLatex(s);
}

test("renderExperienceFragment wraps each entry's bullets in resumeItemListStart/End", () => {
  const frag = renderExperienceFragment(EXPERIENCE);
  const opens = (frag.match(/\\resumeItemListStart/g) ?? []).length;
  const closes = (frag.match(/\\resumeItemListEnd/g) ?? []).length;
  assert.equal(opens, EXPERIENCE.length);
  assert.equal(closes, EXPERIENCE.length);
});

/* ------------------------------------------------------------------ *
 * Splicing — idempotency and marker safety
 * ------------------------------------------------------------------ */

test("spliceSection replaces only the content between its markers", () => {
  const tex = fixtureTex();
  const next = spliceSection(tex, "HEADER", "new header");
  assert.ok(next.includes("new header"));
  assert.ok(!next.includes("old header"));
  // untouched sections survive verbatim
  assert.ok(next.includes("old education"));
  assert.ok(next.includes("old experience"));
  // markers themselves survive
  assert.ok(next.includes("% AUTO-GENERATED:HEADER-START"));
  assert.ok(next.includes("% AUTO-GENERATED:HEADER-END"));
});

test("spliceSection throws a clear error when markers are missing", () => {
  assert.throws(() => spliceSection("no markers here", "HEADER", "x"), /missing markers/);
});

test("renderResumeTex splices all three sections in one pass", () => {
  const tex = fixtureTex();
  const next = renderResumeTex(tex, { person: PERSON, education: EDUCATION, experience: EXPERIENCE });
  assert.ok(next.includes("Harshdip Saha"));
  assert.ok(next.includes("Netaji Subhas University of Technology"));
  assert.ok(next.includes("Optum (UnitedHealth Group)"));
  assert.ok(!next.includes("old header"));
  assert.ok(!next.includes("old education"));
  assert.ok(!next.includes("old experience"));
});

test("renderResumeTex is idempotent — re-running on its own output reproduces the same result", () => {
  const tex = fixtureTex();
  const data = { person: PERSON, education: EDUCATION, experience: EXPERIENCE };
  const once = renderResumeTex(tex, data);
  const twice = renderResumeTex(once, data);
  assert.equal(once, twice);
});

test("renderResumeTex output changes only where the input data changed", () => {
  const tex = fixtureTex();
  const data = { person: PERSON, education: EDUCATION, experience: EXPERIENCE };
  const before = renderResumeTex(tex, data);

  const changedExperience = [
    { ...EXPERIENCE[0], when: "Jun – Sept 2026" },
    EXPERIENCE[1],
  ];
  const after = renderResumeTex(tex, { ...data, experience: changedExperience });

  const beforeLines = new Set(before.split("\n"));
  const afterLines = new Set(after.split("\n"));
  const gained = [...afterLines].filter((l) => !beforeLines.has(l));
  assert.ok(gained.some((l) => l.includes("Jun – Sept 2026")));
  // header/education lines are untouched
  const removed = [...beforeLines].filter((l) => !afterLines.has(l));
  assert.ok(!removed.some((l) => l.includes("Harshdip Saha")));
  assert.ok(!removed.some((l) => l.includes("Netaji Subhas")));
});

test("the renderer performs no I/O", async () => {
  const text = await import("node:fs").then((fs) =>
    fs.readFileSync(new URL("./lib/resume-tex.mjs", import.meta.url), "utf8"),
  );
  assert.ok(!/from ["']node:/.test(text), "the renderer imports nothing from Node's runtime");
  assert.ok(!/process\./.test(text), "the renderer does not read process state");
});
