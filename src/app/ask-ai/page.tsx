import type { Metadata } from "next";
import { CopySnippet } from "@/components/ask-ai/CopySnippet";
import { Group, Item, Reveal } from "@/components/motion/Reveal";
import { TextAnimate } from "@/components/motion/TextAnimate";
import { Container, Label } from "@/components/ui";
import { askAi } from "@/content/site";

export const metadata: Metadata = {
  title: "Ask AI",
  description: askAi.subline,
  alternates: { canonical: "/ask-ai" },
};

const MCP_SNIPPET = `{
  "mcpServers": {
    "harshdipsaha": {
      "type": "http",
      "url": "${askAi.mcpUrl}"
    }
  }
}`;

export default function AskAiPage() {
  return (
    <Container className="pb-28 pt-36 md:pt-40">
      <Reveal variant="blur-up">
        <Label>{askAi.label}</Label>
        <h1 className="display mt-5 max-w-[16ch] text-[clamp(3rem,8vw,6.5rem)] text-paper">{askAi.headline}</h1>
        <p className="prose mt-6 max-w-xl">{askAi.subline}</p>
      </Reveal>

      <Reveal className="mt-16 md:mt-20">
        <Label>{askAi.demoLabel}</Label>
        <div className="glass mt-4 max-w-2xl rounded-2xl p-6 sm:p-8">
          <p className="flex items-baseline gap-3">
            <span aria-hidden="true" className="label !text-tangerine">
              Q
            </span>
            <span className="font-mono text-lg text-paper">{askAi.demo.question}</span>
          </p>
          <div className="hairline mt-5 flex items-start gap-3 border-t pt-5">
            <span aria-hidden="true" className="label mt-1 !text-seafoam">
              A
            </span>
            <div className="flex flex-col gap-3">
              {askAi.demo.answer.map((line, i) => (
                <TextAnimate key={line} text={line} delay={i * 0.2} className="leading-relaxed text-paper/80" />
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Group className="mt-16 grid gap-6 sm:grid-cols-2 md:mt-20">
        {askAi.capabilities.map((c) => (
          <Item key={c.label} className="glass rounded-2xl p-6">
            <p className="text-lg font-medium text-paper">{c.label}</p>
            <p className="mt-2 text-paper/70">{c.body}</p>
          </Item>
        ))}
      </Group>

      <Reveal className="mt-16 md:mt-20">
        <Label>{askAi.setupLabel}</Label>
        <p className="prose mt-4">{askAi.setupIntro}</p>
        <div className="mt-5 max-w-2xl">
          <CopySnippet code={MCP_SNIPPET} />
        </div>
        <p className="prose mt-4 text-paper/70">{askAi.setupNote}</p>
        <p className="mt-8 text-sm text-paper/55">
          {askAi.footnote}{" "}
          <a
            href={askAi.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-paper/70 underline decoration-white/20 underline-offset-4 transition-colors hover:text-tangerine"
          >
            GitHub ↗
          </a>
        </p>
      </Reveal>
    </Container>
  );
}
