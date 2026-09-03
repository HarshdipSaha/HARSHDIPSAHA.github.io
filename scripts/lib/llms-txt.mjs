/**
 * Render the two agent-facing documents from the site's own content.
 *
 * Pure: content in, text out. No filesystem, no network, no `process`. The
 * caller (scripts/build-llms-txt.mjs) does all the I/O, so this function can
 * be asserted directly in `node --test`.
 *
 * The shape follows llmstxt.org: an H1 with the site's name, a `>` blockquote
 * summary, optional free prose, then `##` sections of
 * `- [Title](url): description` bullets. Lighthouse's `llms-txt` audit
 * (Lighthouse 13, agentic-browsing category) requires at least one H1, at
 * least one markdown link, and more than 50 characters — all three are
 * structural here, not incidental.
 */

/** @typedef {{ name: string, siteUrl: string, description: string, role: string, location: string, email: string, github: string, linkedin: string, resume: string }} Person */
/** @typedef {{ label: string, href: string }} NavItem */
/** @typedef {{ slug: string, title: string, summary: string, year: string, link?: string, body: string }} AgentProject */
/** @typedef {{ slug: string, title: string, summary: string, year: string, tag?: string, body: string }} AgentPost */

/** Strip a trailing slash so `${base}${href}` never doubles up. */
function origin(siteUrl) {
  return String(siteUrl).replace(/\/+$/, "");
}

/** Collapse a summary onto one line — a bullet must not contain a newline. */
function oneLine(text) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Push every heading in a case-study body down `by` levels so it nests under
 * the `###` heading the project gets in llms-full.txt. Clamped at H6.
 */
function demoteHeadings(body, by) {
  return String(body ?? "")
    .replace(/^(#{1,6})(\s)/gm, (_m, hashes, space) => "#".repeat(Math.min(6, hashes.length + by)) + space)
    .trim();
}

function bullet(title, url, description) {
  const desc = oneLine(description);
  return desc ? `- [${title}](${url}): ${desc}` : `- [${title}](${url})`;
}

/**
 * @param {{ person: Person, nav: NavItem[], story: any, publication: any }} site
 * @param {AgentProject[]} projects
 * @param {AgentPost[]} [posts]
 * @returns {{ index: string, full: string }}
 */
export function renderLlmsTxt(site, projects, posts) {
  const { person, nav, story, publication } = site;
  const base = origin(person.siteUrl);
  const list = projects ?? [];
  const writingList = posts ?? [];

  const header = [
    `# ${person.name}`,
    "",
    `> ${oneLine(person.description)}`,
    "",
    oneLine(
      `${person.name} — ${person.role}, ${person.location}. ` +
        `This file is the machine-readable index of ${base}. ` +
        `It is generated at build time from the same content the site renders, so it cannot drift from the published pages.`,
    ),
  ];

  const site_ = [
    "## Site",
    "",
    bullet("Home", `${base}/`, "Overview: the research, the work, and how it is made."),
    ...nav.map((n) => bullet(n.label, `${base}${n.href}`, sectionBlurb(n.href, story))),
  ];

  const research = [
    "## Research",
    "",
    bullet(publication.title, publication.links[0]?.href ?? `${base}/story`, `${publication.venue} ${publication.result}`),
    ...publication.links
      .slice(1)
      .map((l) => bullet(`${publication.title} — ${l.label}`, l.href, "")),
    ...(story.achievements ?? []).map((a) => bullet(a.title, a.href, a.body)),
  ];

  const elsewhere = [
    "## Elsewhere",
    "",
    bullet("GitHub", person.github, "Source for nearly every project listed above."),
    bullet("LinkedIn", person.linkedin, "Professional profile."),
    bullet("Résumé (PDF)", `${base}${person.resume}`, "One-page CV."),
    bullet("Email", `mailto:${person.email}`, `Direct contact — ${person.email}.`),
  ];

  const optional = [
    "## Optional",
    "",
    bullet(
      "llms-full.txt",
      `${base}/llms-full.txt`,
      "This same index with the full text of every project case study inlined — one request for the whole site.",
    ),
  ];

  const indexProjects = [
    "## Projects",
    "",
    ...list.map((p) =>
      bullet(p.title, `${base}/projects/${p.slug}`, `${p.summary} (${p.year})`),
    ),
  ];

  const fullProjects = [
    "## Projects",
    "",
    `${list.length} projects, newest first. Each section below is the complete case study as published at ${base}/projects/<slug>.`,
    "",
    ...list.flatMap((p) => {
      const meta = [`Published: ${p.year}`, `Page: ${base}/projects/${p.slug}`];
      if (p.link) meta.push(`Code: ${p.link}`);
      return [
        `### ${p.title}`,
        "",
        oneLine(p.summary),
        "",
        ...meta.map((m) => `- ${m}`),
        "",
        demoteHeadings(p.body, 2),
        "",
      ];
    }),
  ];

  const indexWriting = [
    "## Writing",
    "",
    ...writingList.map((p) =>
      bullet(p.title, `${base}/writing/${p.slug}`, `${p.summary} (${p.year})`),
    ),
  ];

  const fullWriting = [
    "## Writing",
    "",
    `${writingList.length} posts, newest first. First-person write-ups, kept close to how they were first written — not case studies. Each section below is the full post as published at ${base}/writing/<slug>.`,
    "",
    ...writingList.flatMap((p) => {
      const meta = [`Published: ${p.year}`, `Page: ${base}/writing/${p.slug}`];
      if (p.tag) meta.push(`Tag: ${p.tag}`);
      return [
        `### ${p.title}`,
        "",
        oneLine(p.summary),
        "",
        ...meta.map((m) => `- ${m}`),
        "",
        demoteHeadings(p.body, 2),
        "",
      ];
    }),
  ];

  const index = [
    ...header,
    "",
    ...site_,
    "",
    ...indexProjects,
    "",
    ...indexWriting,
    "",
    ...research,
    "",
    ...elsewhere,
    "",
    ...optional,
    "",
  ].join("\n");

  const full = [
    ...header,
    "",
    oneLine(
      "This is the full-text variant: every project case study and writing post is inlined below. " +
        `The short index is at ${base}/llms.txt.`,
    ),
    "",
    ...site_,
    "",
    ...fullProjects,
    ...fullWriting,
    ...research,
    "",
    ...elsewhere,
    "",
  ].join("\n");

  return { index, full };
}

/** One line of orientation per route, taken from the site's own copy. */
function sectionBlurb(href, story) {
  switch (href) {
    case "/story":
      return oneLine(story.intro?.[0] ?? "");
    case "/projects":
      return "Every project, newest first, each with a written case study.";
    case "/writing":
      return "First-person write-ups from hackathons and past projects, kept close to how they were first written.";
    case "/gallery":
      return "Photographs.";
    case "/process":
      return "How every change to this site is planned, recorded and gated (AI-DLC).";
    default:
      return "";
  }
}
