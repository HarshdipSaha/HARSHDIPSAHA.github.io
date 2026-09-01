/**
 * Map `person` / `experience` / education (`story.education`) from
 * src/content/site.ts into the three marker-delimited LaTeX fragments that
 * get spliced into resume/resume.tex.
 *
 * Pure: content in, text out. No filesystem, no network, no `process`. The
 * caller (scripts/build-resume.mjs) does all the I/O and the LaTeX
 * compilation, so this module can be asserted directly in `node --test`
 * with no LaTeX toolchain installed (ticket #32's acceptance criterion).
 *
 * Scope boundary (see docs/adr/0015-*.md): site.ts's typed shapes map
 * faithfully only to the résumé's Header, Education and Experience
 * sections. Projects, Technical Skills and Key Achievements contain
 * résumé-specific detail (exact metrics, named tools) with no corresponding
 * field in site.ts today, and stay hand-maintained directly in
 * resume/resume.tex, same as before this pipeline existed.
 */

/** @typedef {{ name: string, email: string, github: string, linkedin: string, siteUrl: string }} Person */
/** @typedef {{ name: string, detail: string }} EducationEntry */
/** @typedef {{ company: string, role: string, when: string, points: string[] }} ExperienceItem */

const ESCAPES = {
  "\\": "\\textbackslash{}",
  "&": "\\&",
  "%": "\\%",
  "$": "\\$",
  "#": "\\#",
  "_": "\\_",
  "{": "\\{",
  "}": "\\}",
  "~": "\\textasciitilde{}",
  "^": "\\textasciicircum{}",
};

const ESCAPE_RE = /[\\&%$#_{}~^]/g;

/**
 * Escape every LaTeX special character in a plain-text string. Applied
 * wherever real site.ts data is interpolated into a generated fragment —
 * never applied to hand-written template LaTeX, which already knows what
 * it means.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeLatex(value) {
  return String(value ?? "").replace(ESCAPE_RE, (ch) => ESCAPES[ch]);
}

/** Strip a leading protocol so a URL reads as plain text in the header. */
function hostLabel(url) {
  return String(url ?? "").replace(/^https?:\/\//, "");
}

const START = (name) => `% AUTO-GENERATED:${name}-START`;
const END = (name) => `% AUTO-GENERATED:${name}-END`;

/**
 * The centered name + contact-links block. Emails/URLs are interpolated raw
 * into `\href{...}` targets (they are not LaTeX prose); only the *visible*
 * label text is escaped.
 * @param {Person} person
 * @returns {string}
 */
export function renderHeaderFragment(person) {
  const name = escapeLatex(person.name);
  const email = person.email;
  const emailLabel = escapeLatex(person.email);
  const siteLabel = escapeLatex(hostLabel(person.siteUrl));
  return [
    "\\begin{center}",
    `    {\\Huge \\scshape ${name}} \\vspace{1pt}`,
    "",
    "",
    `    \\href{mailto:${email}}{\\color{RoyalBlue}\\raisebox{-0.2\\height}\\faEnvelope\\ \\underline{${emailLabel}}} ~`,
    `    \\href{${person.linkedin}}{\\color{RoyalBlue}\\raisebox{-0.2\\height}\\faLinkedin\\ \\underline{LinkedIn}} ~`,
    `    \\href{${person.github}}{\\color{RoyalBlue}\\raisebox{-0.2\\height}\\faGithub\\ \\underline{GitHub}}`,
    "    ~",
    `\\href{${person.siteUrl}}{\\color{RoyalBlue}\\raisebox{-0.2\\height}\\faGlobe\\ \\underline{${siteLabel}}}`,
    "    \\vspace{-8pt}",
    "\\end{center}",
  ].join("\n");
}

/**
 * One `\resumeSubheading` per education entry. site.ts's `story.education`
 * carries only `{ name, detail }` (free text, e.g. "B.Tech CSE (AI) · GPA
 * 8.78 of 10 · class of 2027") — no separate dates/degree/location fields —
 * so the name goes in the institution slot and the detail in the degree
 * slot; the dates and location slots are intentionally left blank rather
 * than guessed. Documented in docs/adr/0015-*.md.
 * @param {EducationEntry[]} education
 * @returns {string}
 */
export function renderEducationFragment(education) {
  return (education ?? [])
    .map((entry) =>
      [
        "    \\resumeSubheading",
        `      {${escapeLatex(entry.name)}}{}`,
        `      {${escapeLatex(entry.detail)}}{}`,
      ].join("\n"),
    )
    .join("\n\n");
}

/**
 * One `\resumeSubheading` + bullet list per experience entry. site.ts's
 * `experience.items` carries `{ company, role, when, points[] }` — no
 * separate "scope"/location field the template's fourth argument expects —
 * so that slot is intentionally left blank. Documented in
 * docs/adr/0015-*.md.
 * @param {ExperienceItem[]} items
 * @returns {string}
 */
export function renderExperienceFragment(items) {
  return (items ?? [])
    .map((item) => {
      const points = (item.points ?? [])
        .map((p) => `  \\resumeItem{${escapeLatex(p)}}`)
        .join("\n");
      return [
        "\\resumeSubheading",
        `  {${escapeLatex(item.role)}}{${escapeLatex(item.when)}}`,
        `  {${escapeLatex(item.company)}}{}`,
        "\\resumeItemListStart",
        points,
        "\\resumeItemListEnd",
      ].join("\n");
    })
    .join("\n\n");
}

/**
 * Replace the content between `% AUTO-GENERATED:<name>-START/END` marker
 * comments with freshly rendered content, leaving everything else in the
 * document — including the markers themselves — untouched. Idempotent:
 * splicing the same rendered content in twice produces byte-identical
 * output, since only the region between the markers changes.
 * @param {string} tex
 * @param {string} name
 * @param {string} content
 * @returns {string}
 */
export function spliceSection(tex, name, content) {
  const start = START(name);
  const end = END(name);
  const startIdx = tex.indexOf(start);
  const endIdx = tex.indexOf(end);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(`resume-tex: missing markers for section "${name}" (expected "${start}" ... "${end}")`);
  }
  const before = tex.slice(0, startIdx + start.length);
  const after = tex.slice(endIdx);
  return `${before}\n${content}\n${after}`;
}

/**
 * Splice all three generated sections (header, education, experience) into
 * a resume.tex document in one pass.
 * @param {string} tex
 * @param {{ person: Person, education: EducationEntry[], experience: ExperienceItem[] }} data
 * @returns {string}
 */
export function renderResumeTex(tex, data) {
  let next = tex;
  next = spliceSection(next, "HEADER", renderHeaderFragment(data.person));
  next = spliceSection(next, "EDUCATION", renderEducationFragment(data.education));
  next = spliceSection(next, "EXPERIENCE", renderExperienceFragment(data.experience));
  return next;
}
