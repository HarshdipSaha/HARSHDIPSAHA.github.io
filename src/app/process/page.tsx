import { Column, Heading, Icon, Row, Schema, Tag, Text } from "@once-ui-system/core";
import { baseURL, home, person, process as processContent } from "@/resources";
import { generateMeta } from "@/utils/meta";
import styles from "./process.module.scss";

export async function generateMetadata() {
  return generateMeta({
    title: processContent.title,
    description: processContent.description,
    baseURL: baseURL,
    image: home.image,
    path: processContent.path,
  });
}

export default function Process() {
  return (
    <Column maxWidth="m" fillWidth gap="xl" paddingX="l" paddingTop="24">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={processContent.title}
        description={processContent.description}
        path={processContent.path}
        image={home.image}
        author={{
          name: person.name,
          url: `${baseURL}${processContent.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      <Column gap="16">
        <Heading as="h1" variant="display-strong-s">
          How this site gets built
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
          {processContent.headline}
        </Text>
      </Column>

      <Row fillWidth gap="12" wrap>
        {processContent.stats.map((stat) => (
          <Column
            key={stat.label}
            className={styles.stat}
            background="neutral-alpha-weak"
            border="neutral-alpha-weak"
            radius="l"
            padding="20"
            gap="4"
          >
            <Text variant="display-strong-xs" onBackground="brand-strong">
              {stat.value}
            </Text>
            <Text variant="label-default-s" onBackground="neutral-weak">
              {stat.label}
            </Text>
          </Column>
        ))}
      </Row>

      <Column gap="20">
        <Column gap="8">
          <Heading as="h2" variant="heading-strong-l">
            The five layers
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Context first so an agent behaves, then capabilities so it can act, then knowledge so
            decisions persist, then the product — all wrapped in quality gates.
          </Text>
        </Column>
        <Column fillWidth gap="8">
          {processContent.layers.map((layer, index) => (
            <Row
              key={layer.name}
              fillWidth
              gap="16"
              padding="16"
              background="surface"
              border="neutral-alpha-weak"
              radius="m"
              vertical="start"
              s={{ direction: "column" }}
            >
              <Row gap="12" vertical="center" className={styles.layerHead}>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {String(index + 1).padStart(2, "0")}
                </Text>
                <Text variant="heading-strong-xs">{layer.name}</Text>
              </Row>
              <Column gap="8" fillWidth>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {layer.purpose}
                </Text>
                <Row gap="4" wrap>
                  {layer.paths.map((path) => (
                    <Tag key={path} size="s" variant="neutral">
                      {path}
                    </Tag>
                  ))}
                </Row>
              </Column>
            </Row>
          ))}
        </Column>
      </Column>

      <Column gap="20">
        <Column gap="8">
          <Heading as="h2" variant="heading-strong-l">
            The effort log
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Every change after the baseline is a numbered effort with its own state, requirements
            delta, and verification. Efforts 001–004 were reconstructed from commit diffs — the
            original commits recorded no rationale.
          </Text>
        </Column>
        <Column fillWidth gap="0" className={styles.timeline}>
          {processContent.efforts.map((effort) => (
            <Row key={effort.id} fillWidth gap="16" paddingY="16" vertical="start">
              <Column className={styles.timelineMarker} vertical="center" horizontal="center">
                <Text variant="label-strong-s" onBackground="neutral-weak">
                  {effort.id}
                </Text>
              </Column>
              <Column gap="8" fillWidth>
                <Row gap="8" vertical="center" wrap>
                  <Text variant="heading-strong-xs">{effort.title}</Text>
                  <Tag size="s" variant={effort.status === "complete" ? "success" : "warning"}>
                    {effort.status}
                  </Tag>
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {effort.date}
                  </Text>
                </Row>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {effort.summary}
                </Text>
              </Column>
            </Row>
          ))}
        </Column>
      </Column>

      <Column gap="20">
        <Column gap="8">
          <Heading as="h2" variant="heading-strong-l">
            The decision log
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            One architecture decision record per call, each naming the alternatives that lost and
            the trade-off accepted. Cheap to write now; priceless when someone asks why.
          </Text>
        </Column>
        <Column fillWidth gap="4">
          {processContent.decisions.map((decision) => (
            <Row
              key={decision.id}
              fillWidth
              gap="12"
              paddingY="12"
              paddingX="16"
              background="surface"
              border="neutral-alpha-weak"
              radius="m"
              vertical="center"
              s={{ direction: "column", horizontal: "start" }}
            >
              <Text variant="label-strong-s" onBackground="brand-medium" className={styles.adrId}>
                ADR {decision.id}
              </Text>
              <Column fillWidth>
                <Text variant="body-default-s">{decision.title}</Text>
              </Column>
              <Tag size="s" variant="neutral">
                {decision.status}
              </Tag>
            </Row>
          ))}
        </Column>
      </Column>

      <Row
        fillWidth
        gap="12"
        padding="20"
        background="neutral-alpha-weak"
        border="neutral-alpha-weak"
        radius="l"
        vertical="center"
        s={{ direction: "column", horizontal: "start" }}
      >
        <Icon name="github" size="m" onBackground="neutral-weak" />
        <Column fillWidth>
          <Text variant="body-default-s" onBackground="neutral-weak">
            The full baseline, effort folders, and decision records live in <code>aidlc-docs/</code>{" "}
            and <code>docs/adr/</code> in the repository.
          </Text>
        </Column>
        <Text variant="body-strong-s">
          <a
            href="https://github.com/HarshdipSaha/HARSHDIPSAHA.github.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the source →
          </a>
        </Text>
      </Row>
    </Column>
  );
}
