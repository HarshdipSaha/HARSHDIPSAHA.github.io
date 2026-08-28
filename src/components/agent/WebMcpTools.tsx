"use client";

import { useEffect } from "react";
import type { AgentProject } from "@/lib/agentProjects";

/**
 * WebMCP (`navigator.modelContext`) — register one `searchProjects` tool so an
 * agentic browser on /projects can query the work instead of scraping the DOM.
 *
 * WebMCP is an unratified W3C-track proposal and **no shipping browser
 * implements it**. This component is therefore a progressive enhancement and
 * nothing else: it feature-detects, returns immediately when the API is absent,
 * renders no DOM, logs nothing, and unregisters on unmount (the app is
 * client-side routed, so without cleanup navigating away and back would
 * register the tool twice). See ADR 0014.
 */

type ToolResult = {
  content: { type: "text"; text: string }[];
  structuredContent: { query: string; count: number; results: AgentProject[] };
};

type ToolDescriptor = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  execute: (input: unknown) => Promise<ToolResult>;
};

type ModelContext = {
  registerTool?: (tool: ToolDescriptor) => unknown;
  unregisterTool?: (name: string) => unknown;
};

const TOOL_NAME = "searchProjects";

const PROJECT_ITEM_SCHEMA = {
  type: "object",
  properties: {
    slug: { type: "string", description: "URL slug of the project." },
    title: { type: "string", description: "Project title." },
    summary: { type: "string", description: "One-sentence summary." },
    year: { type: "string", description: "Publication year, YYYY." },
    url: { type: "string", description: "Absolute URL of the case study." },
    code: { type: "string", description: "Absolute URL of the source repository, when public." },
  },
  required: ["slug", "title", "summary", "year", "url"],
  additionalProperties: false,
} as const;

const INPUT_SCHEMA = {
  type: "object",
  properties: {
    query: {
      type: "string",
      description:
        "Keywords to match against project titles and summaries, e.g. 'medical imaging'. Pass an empty string to list every project.",
    },
    limit: {
      type: "integer",
      description: "Maximum number of projects to return.",
      minimum: 1,
      maximum: 50,
      default: 10,
    },
  },
  required: ["query"],
  additionalProperties: false,
} as const;

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    query: { type: "string", description: "The query that was run." },
    count: { type: "integer", description: "Number of projects returned." },
    results: { type: "array", description: "Matching projects, newest first.", items: PROJECT_ITEM_SCHEMA },
  },
  required: ["query", "count", "results"],
  additionalProperties: false,
} as const;

/** Every whitespace-separated term must appear somewhere in the project's text. */
export function searchProjects(projects: AgentProject[], query: string, limit: number): AgentProject[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = terms.length
    ? projects.filter((p) => {
        const hay = `${p.title} ${p.summary} ${p.slug} ${p.year}`.toLowerCase();
        return terms.every((t) => hay.includes(t));
      })
    : projects;
  return matches.slice(0, limit);
}

export function WebMcpTools({ projects }: { projects: AgentProject[] }) {
  useEffect(() => {
    const modelContext = (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
    if (!modelContext || typeof modelContext.registerTool !== "function") return;

    const tool: ToolDescriptor = {
      name: TOOL_NAME,
      description:
        "Search Harshdip Saha's projects by keyword and return structured results (title, summary, year, case-study URL and source repository). Covers exactly the projects listed on this page.",
      inputSchema: INPUT_SCHEMA as unknown as Record<string, unknown>,
      outputSchema: OUTPUT_SCHEMA as unknown as Record<string, unknown>,
      execute: async (input: unknown) => {
        const args = (input ?? {}) as { query?: unknown; limit?: unknown };
        const query = typeof args.query === "string" ? args.query : "";
        const rawLimit = typeof args.limit === "number" ? Math.floor(args.limit) : 10;
        const limit = Math.min(50, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 10));
        const results = searchProjects(projects, query, limit);
        return {
          content: [
            {
              type: "text" as const,
              text:
                results.length === 0
                  ? `No projects match ${JSON.stringify(query)}.`
                  : results.map((p) => `${p.title} (${p.year}) — ${p.summary} ${p.url}`).join("\n"),
            },
          ],
          structuredContent: { query, count: results.length, results },
        };
      },
    };

    // A draft API may throw or reject; neither may reach the console — the
    // smoke gate fails on any console error, and a visitor must never see one.
    try {
      Promise.resolve(modelContext.registerTool(tool)).catch(() => {});
    } catch {
      return;
    }

    return () => {
      try {
        Promise.resolve(modelContext.unregisterTool?.(TOOL_NAME)).catch(() => {});
      } catch {
        /* nothing to do — the page is going away */
      }
    };
  }, [projects]);

  return null;
}
