/**
 * Render the agent-data.json export from the site's own content.
 *
 * Pure: content in, a JSON-serialisable object out. No filesystem, no
 * network, no `process`. The caller (scripts/build-agent-data.mjs) does all
 * the I/O, so this function can be asserted directly in `node --test`.
 *
 * This is the single source the future MCP server (issue #62, effort 045)
 * reads: `profile` backs its `getProfile` tool, `projects` backs
 * `searchProjects`. Shape mirrors src/lib/agentProjects.ts's `AgentProject`
 * (slug, title, summary, year, url, code?) so there is one project shape
 * shared across llms.txt, WebMCP, and this export — not three.
 */

/** @typedef {{ name: string, role: string, location: string, email: string, github: string, linkedin: string, resume: string, siteUrl: string, description: string }} Person */
/** @typedef {{ skills: string[] }} Story */
/** @typedef {{ slug: string, title: string, summary: string, year: string, link?: string, body?: string }} SourceProject */

/** Strip a trailing slash so `${base}${path}` never doubles up. */
function origin(siteUrl) {
  return String(siteUrl).replace(/\/+$/, "");
}

/** Collapse a description onto one line — the same rule llms-txt.mjs uses. */
function oneLine(text) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {{ person: Person, story: Story }} site
 * @param {SourceProject[]} projects
 * @returns {{ profile: object, projects: object[] }}
 */
export function renderAgentData(site, projects) {
  const { person, story } = site;
  const base = origin(person.siteUrl);

  const profile = {
    name: person.name,
    role: person.role,
    location: person.location,
    bio: oneLine(person.description),
    email: person.email,
    github: person.github,
    linkedin: person.linkedin,
    resume: `${base}${person.resume}`,
    siteUrl: `${base}/`,
    skills: story.skills ?? [],
  };

  const projectList = (projects ?? []).map((p) => ({
    slug: p.slug,
    title: p.title,
    summary: oneLine(p.summary),
    year: p.year,
    url: `${base}/projects/${p.slug}`,
    ...(p.link ? { code: p.link } : {}),
  }));

  return { profile, projects: projectList };
}
