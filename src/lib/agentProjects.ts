import type { Project } from "@/lib/projects";

/**
 * The flat, serialisable shape a project takes when it crosses into agent
 * space — the WebMCP `searchProjects` tool's output items.
 *
 * This lives outside the client component on purpose: the server component
 * builds these from the same `getProjects()` list it renders, so the tool
 * cannot answer with a different set of projects than the page shows.
 */
export type AgentProject = {
  slug: string;
  title: string;
  summary: string;
  year: string;
  url: string;
  /** Frontmatter `award`, e.g. "Winner" — the project card shows it as a ribbon. */
  award?: string;
  code?: string;
};

export function toAgentProject(project: Project, siteUrl: string): AgentProject {
  return {
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    year: project.year,
    url: `${siteUrl.replace(/\/+$/, "")}/projects/${project.slug}`,
    ...(project.award ? { award: project.award } : {}),
    ...(project.link ? { code: project.link } : {}),
  };
}
