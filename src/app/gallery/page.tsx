import { Column, Flex, Heading, Schema, Text } from "@once-ui-system/core";
import GalleryView from "@/components/gallery/GalleryView";
import { baseURL, gallery, person, home } from "@/resources";
import { generateMeta } from "@/utils/meta";

export async function generateMetadata() {
  return generateMeta({
    title: gallery.title,
    description: gallery.description,
    baseURL: baseURL,
    image: home.image,
    path: gallery.path,
  });
}

export default function Gallery() {
  return (
    <Column maxWidth="l" fillWidth gap="l" paddingX="l" paddingTop="24">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={gallery.title}
        description={gallery.description}
        path={gallery.path}
        image={home.image}
        author={{
          name: person.name,
          url: `${baseURL}${gallery.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Column horizontal="center" gap="8" marginBottom="8">
        <Heading variant="heading-strong-xl" align="center">
          {gallery.label}
        </Heading>
        <Text
          variant="body-default-m"
          onBackground="neutral-weak"
          align="center"
          wrap="balance"
          style={{ maxWidth: "24rem" }}
        >
          {gallery.description}
        </Text>
      </Column>
      <Flex fillWidth>
        <GalleryView />
      </Flex>
    </Column>
  );
}
