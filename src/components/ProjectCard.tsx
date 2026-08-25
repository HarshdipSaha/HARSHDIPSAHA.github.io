import { ResponsiveImage } from "@/components/ResponsiveImage";
import { Column, Heading, Row, SmartLink, Text } from "@once-ui-system/core";

interface ProjectCardProps {
  href: string;
  priority?: boolean;
  images: string[];
  title: string;
  content: string;
  description: string;
  avatars: { src: string }[];
  link: string;
  /** Zero-based position in the list, used for the slice index readout. */
  index?: number;
}

/**
 * A project entry, read as a specimen in the overlay system: a scan plate on
 * the left, the label block on the right, a slice index in the gutter.
 *
 * Two things changed from the previous version:
 *  - It is no longer `"use client"`. It wrapped every project in a `<Carousel>`
 *    to show a single image (all 18 projects have exactly one), which shipped a
 *    client component and a slide machine per card for nothing.
 *  - `priority` was declared and passed but never destructured, so image
 *    priority was silently dropped. It is honoured now.
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  href,
  images = [],
  title,
  content,
  description,
  link,
  priority,
  index = 0,
}) => {
  const cover = images[0];

  return (
    <Row
      fillWidth
      gap="32"
      s={{ direction: "column", gap: "16" }}
      className="probe-row"
      vertical="start"
    >
      {cover && (
        <Row flex={4} fillWidth>
          <SmartLink href={href} style={{ display: "block", width: "100%", margin: 0 }}>
            <ResponsiveImage
              src={cover}
              alt={title}
              aspectRatio="16 / 10"
              priority={priority}
              // The card is ~40% of a 64rem column on desktop, full-bleed below
              // the breakpoint. Getting this wrong makes srcset pick badly.
              sizes="(max-width: 768px) 100vw, 420px"
              style={{ border: "1px solid var(--rule-color)" }}
            />
          </SmartLink>
        </Row>
      )}

      <Column flex={6} gap="12" fillWidth>
        <Text className="readout">{String(index + 1).padStart(2, "0")}</Text>

        {title && (
          <Heading as="h3" wrap="balance" variant="heading-strong-l">
            <SmartLink href={href} style={{ margin: 0, color: "inherit" }}>
              {title}
            </SmartLink>
          </Heading>
        )}

        {description?.trim() && (
          <Text
            wrap="balance"
            variant="body-default-m"
            onBackground="neutral-weak"
            style={{ lineHeight: 1.65 }}
          >
            {description}
          </Text>
        )}

        <Row gap="24" wrap paddingTop="4" className="card-links">
          {content?.trim() && (
            <SmartLink
              suffixIcon="arrowRight"
              style={{ margin: "0", width: "fit-content" }}
              href={href}
            >
              <Text variant="body-default-s">Case study</Text>
            </SmartLink>
          )}
          {link && (
            <SmartLink
              suffixIcon="arrowUpRightFromSquare"
              style={{ margin: "0", width: "fit-content" }}
              href={link}
            >
              <Text variant="body-default-s">Source</Text>
            </SmartLink>
          )}
        </Row>
      </Column>
    </Row>
  );
};
