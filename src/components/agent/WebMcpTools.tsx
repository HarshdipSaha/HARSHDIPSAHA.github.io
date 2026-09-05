"use client";

import { useEffect } from "react";
import type { AgentProject } from "@/lib/agentProjects";

/**
 * WebMCP — register one `searchProjects` tool so an agentic browser on
 * /projects can query the work instead of scraping the DOM.
 *
 * Chrome ships this behind an origin trial as `document.modelContext`
 * (Chrome 149+, https://developer.chrome.com/docs/ai/webmcp/imperative-api).
 * The `navigator.modelContext` name from the 2025 community explainer this
 * component originally targeted is deprecated; it is kept here only as a
 * fallback in case another implementation still uses it. Without this
 * origin's own trial token, both stay undefined in every real visitor's
 * browser today, so this remains a progressive enhancement and nothing else:
 * it feature-detects, returns immediately when neither is present, renders no
 * DOM, logs nothing, and unregisters on unmount (the app is client-side
 * routed, so without cleanup navigating away and back would register the tool
 * twice). `execute` returns a plain string — Chrome's shipped API has no
 * `outputSchema` and no structured-content return; both were part of the
 * earlier explainer's shape, not the real one. See ADR 0014 and ADR 0020.
 */

type ToolDescriptor = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, unknown>;
  execute: (input: unknown) => Promise<string>;
};

type ModelContext = {
  registerTool?: (tool: ToolDescriptor) => unknown;
  unregisterTool?: (name: string) => unknown;
};

const TOOL_NAME = "searchProjects";

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
    const modelContext =
      (document as Document & { modelContext?: ModelContext }).modelContext ??
      (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
    if (!modelContext || typeof modelContext.registerTool !== "function") return;

    const tool: ToolDescriptor = {
      name: TOOL_NAME,
      description:
        "Search Harshdip Saha's projects by keyword and return matching titles, summaries, years and case-study URLs. Covers exactly the projects listed on this page.",
      inputSchema: INPUT_SCHEMA as unknown as Record<string, unknown>,
      annotations: { readOnlyHint: true, consequentialHint: false },
      execute: async (input: unknown) => {
        const args = (input ?? {}) as { query?: unknown; limit?: unknown };
        const query = typeof args.query === "string" ? args.query : "";
        const rawLimit = typeof args.limit === "number" ? Math.floor(args.limit) : 10;
        const limit = Math.min(50, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 10));
        const results = searchProjects(projects, query, limit);
        return results.length === 0
          ? `No projects match ${JSON.stringify(query)}.`
          : results.map((p) => `${p.title} (${p.year}) — ${p.summary} ${p.url}`).join("\n");
      },
    };

    // A trial/draft API may throw or reject; neither may reach the console — the
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
