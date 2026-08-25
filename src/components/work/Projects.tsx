import { ProjectCard } from "@/components";
import { getPosts } from "@/utils/utils";
import { Column } from "@once-ui-system/core";

interface ProjectsProps {
  range?: [number, number?];
  exclude?: string[];
  /**
   * Render as a sticky stack: cards pin and recede as the next one rides over.
   * Only sane for a short selection — /work's full 18 would cost 18 viewports.
   */
  stack?: boolean;
}

export function Projects({ range, exclude, stack = false }: ProjectsProps) {
  let allProjects = getPosts(["src", "app", "work", "projects"]);

  // Exclude by slug (exact match)
  if (exclude && exclude.length > 0) {
    allProjects = allProjects.filter((post) => !exclude.includes(post.slug));
  }

  const sortedProjects = allProjects.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  const displayedProjects = range
    ? sortedProjects.slice(range[0] - 1, range[1] ?? sortedProjects.length)
    : sortedProjects;

  return (
    <Column
      fillWidth
      gap={stack ? "0" : "40"}
      marginBottom="24"
      className={stack ? "card-stack" : undefined}
    >
      {displayedProjects.map((post, index) => (
        <ProjectCard
          priority={index < 2}
          index={index}
          key={post.slug}
          href={`/work/${post.slug}`}
          images={post.metadata.images}
          title={post.metadata.title}
          description={post.metadata.summary}
          content={post.content}
          avatars={post.metadata.team?.map((member) => ({ src: member.avatar })) || []}
          link={post.metadata.link || ""}
          stackIndex={stack ? index : undefined}
        />
      ))}
    </Column>
  );
}
