import { Reveal } from "@/components/motion/Reveal";
import { ProbeText } from "@/components/motion/ProbeText";
import { ScanReveal } from "@/components/motion/ScanReveal";
import { Projects } from "@/components/work/Projects";
import { about, baseURL, home, person, publications, work } from "@/resources";
import { generateMeta } from "@/utils/meta";
import { Column, Heading, Row, Schema, Text } from "@once-ui-system/core";

export async function generateMetadata() {
  return generateMeta({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default function Home() {
  const lead = publications.items[0];

  return (
    <Column maxWidth="m" fillWidth gap="0" paddingY="12">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={home.image}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      {/* ---- FIRST VIEWPORT ------------------------------------------------
          The thesis: who, the verified result, the positioning, two actions.
          Deliberately no project cards above the fold — that is the catalogue
          homepage this design refuses.                                      */}
      <Column
        as="section"
        fillWidth
        gap="24"
        paddingY="64"
        s={{ paddingY: "32" }}
        className="hero-enter"
      >
        {/* The name is already in the header and the lab is already in the
            subline, so this shows the one part of `role` stated nowhere else. */}
        <Text className="readout">{person.role.split("·").slice(-1)[0].trim()}</Text>

        <Heading
          data-lcp
          wrap="balance"
          variant="display-strong-l"
          className="hero-display"
          style={{ maxWidth: "20ch" }}
        >
          {typeof home.headline === "string" ? (
            <ScanReveal text={home.headline} />
          ) : (
            home.headline
          )}
        </Heading>


        <Text
          wrap="balance"
          variant="heading-default-l"
          onBackground="neutral-weak"
          style={{ maxWidth: "56ch" }}
        >
          {home.subline}
        </Text>

        {home.actions && home.actions.length > 0 && (
          <Row gap="24" wrap vertical="center" paddingTop="8">
            {home.actions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="link-underline"
              >
                {action.label} <span aria-hidden="true">→</span>
              </a>
            ))}
          </Row>
        )}
      </Column>

      <hr className="rule-h" />

      {/* ---- RESEARCH LEADS ------------------------------------------------ */}
      {publications.display && lead && (
        <Column as="section" fillWidth gap="16" paddingY="48" s={{ paddingY: "32" }}>
          <Reveal index={0}>
            <Text className="readout">{publications.title}</Text>
          </Reveal>
          <Reveal index={1}>
            <Column gap="12" className="probe-row">
              <Heading as="h2" variant="heading-strong-xl" wrap="balance">
                {lead.title}
              </Heading>
              <Row gap="12" wrap vertical="center">
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {lead.venue}
                </Text>
                {lead.result && <span className="mask-plate">{lead.result}</span>}
              </Row>
              <Text
                variant="body-default-m"
                onBackground="neutral-weak"
                style={{ maxWidth: "68ch", lineHeight: 1.7 }}
              >
                {lead.summaryText ? <ProbeText text={lead.summaryText} /> : lead.summary}
              </Text>
              <Row gap="24" wrap paddingTop="4">
                {lead.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--scan-09)",
                      textDecoration: "none",
                      borderBottom: "1px solid var(--scan-05)",
                      paddingBottom: "2px",
                      fontSize: "0.9375rem",
                    }}
                  >
                    {link.label} <span aria-hidden="true">→</span>
                  </a>
                ))}
              </Row>
            </Column>
          </Reveal>
        </Column>
      )}

      <hr className="rule-h" />

      {/* ---- SELECTED WORK -------------------------------------------------
          A selection, not the catalogue. /work owns the full index.        */}
      <Column as="section" fillWidth gap="24" paddingY="48" s={{ paddingY: "32" }}>
        <Reveal index={0}>
          <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
            <Text className="readout">Selected work</Text>
            <a
              href={work.path}
              style={{
                color: "var(--scan-08)",
                textDecoration: "none",
                fontSize: "0.875rem",
              }}
            >
              All projects <span aria-hidden="true">→</span>
            </a>
          </Row>
        </Reveal>
        <Reveal index={1}>
          <Projects stack range={[1, home.selectedWorkCount ?? 3]} />
        </Reveal>
      </Column>
    </Column>
  );
}
