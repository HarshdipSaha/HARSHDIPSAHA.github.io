import stats from "@/data/process-stats.json";
import { process } from "@/content/site";

/**
 * The numbers /process shows, and the templates that carry them.
 *
 * `src/data/process-stats.json` is written by `scripts/build-process-stats.mjs`
 * on every predev/prebuild from the repo itself (effort directories, ADR files,
 * the ADR index, the workflows). `process.stats` and `process.links` in site.ts
 * hold only label templates — `"changes recorded, numbered {firstEffort}–{lastEffort}"`
 * — and this module fills them. An unknown placeholder throws at build time so
 * a renamed variable fails `next build` instead of rendering as "{typo}".
 *
 * `gates` is the one count not taken from the JSON: quality-gates.yml carries
 * two of the four gates (Build + Smoke, Lighthouse), so "PR gates" is not "PR
 * workflows". It comes from `process.gates.length` — the same array the
 * pipeline diagram directly below the stat renders — so the two cannot disagree.
 */
export const processCounts = {
  efforts: stats.efforts,
  firstEffort: stats.firstEffort,
  lastEffort: stats.lastEffort,
  adrs: stats.adrs,
  firstAdr: stats.firstAdr,
  lastAdr: stats.lastAdr,
  superseded: stats.superseded,
  gates: process.gates.length,
} as const;

export type ProcessCountKey = keyof typeof processCounts;

export function fillCounts(template: string): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    if (!(key in processCounts)) {
      throw new Error(
        `process-stats: unknown placeholder {${key}} in "${template}". ` +
          `Known: ${Object.keys(processCounts).join(", ")}.`,
      );
    }
    return String(processCounts[key as ProcessCountKey]);
  });
}

export const processStats = process.stats.map((s) => ({
  value: fillCounts(s.value),
  label: fillCounts(s.label),
}));

export const processLinks = process.links.map((l) => ({
  label: fillCounts(l.label),
  href: `${process.repo}${l.path}`,
}));
