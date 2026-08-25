import { Column, Heading, Schema, Text } from "@once-ui-system/core";
import { baseURL, about, person, work, home } from "@/resources";
import { Projects } from "@/components/work/Projects";
import { generateMeta } from "@/utils/meta";

export async function generateMetadata() {
  return generateMeta({
    title: work.title,
    description: work.description,
    baseURL: baseURL,
    image: home.image,
    path: work.path,
  });
}

export default function Work() {
  return (
    <Column maxWidth="m" paddingTop="24" horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={work.path}
        title={work.title}
        description={work.description}
        image={home.image}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Heading marginBottom="8" variant="heading-strong-xl" align="center">
        {work.label}
      </Heading>
      <Text
        variant="body-default-m"
        onBackground="neutral-weak"
        align="center"
        wrap="balance"
        marginBottom="xl"
        style={{ maxWidth: "28rem" }}
      >
        {work.description}
      </Text>
      <Projects />
    </Column>
  );
}
