import type { Metadata } from "next";
import { WebMcpTools } from "@/components/agent/WebMcpTools";
import { Reveal } from "@/components/motion/Reveal";
import { ProjectGrid } from "@/components/ProjectGrid";
import { Container, Label } from "@/components/ui";
import { person } from "@/content/site";
import { toAgentProject } from "@/lib/agentProjects";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "ML, computer vision, healthcare and hackathon projects — with code and case studies.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  const projects = getProjects();
  return (
    <Container className="pb-28 pt-36 md:pt-40">
      <Reveal variant="blur-up">
        <Label>Projects</Label>
        <h1 className="display mt-5 max-w-[14ch] text-[clamp(3rem,8vw,6.5rem)] text-paper">Things I've built, {projects.length} so far.</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/65">
          Research code, hackathon builds, and the occasional game. Newest first. Each opens to a short write-up of what it does and why, and links to the code.
        </p>
      </Reveal>
      <div className="mt-16 md:mt-20">
        <ProjectGrid projects={projects} headingLevel="h2" />
      </div>
      {/* Renders nothing. Registers a WebMCP `searchProjects` tool for agentic
          browsers, over the same list the grid above shows. See ADR 0014. */}
      <WebMcpTools projects={projects.map((p) => toAgentProject(p, person.siteUrl))} />
    </Container>
  );
}
