import type { MetadataRoute } from "next";
import { nav, person } from "@/content/site";
import { getProjects } from "@/lib/projects";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = person.siteUrl;
  const projects = getProjects();
  const latestProject = projects.reduce((a, b) => (a.date > b.date ? a : b));
  const siteLastModified = new Date(latestProject.date);

  const pages = ["/", ...nav.map((n) => n.href)].map((p) => ({
    url: `${base}${p}`,
    lastModified: siteLastModified,
  }));
  const projectPages = projects.map((p) => ({
    url: `${base}/projects/${p.slug}`,
    lastModified: new Date(p.date),
  }));
  return [...pages, ...projectPages];
}
