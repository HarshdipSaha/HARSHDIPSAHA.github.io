#!/usr/bin/env node
/**
 * Static-export fix for segment prefetch.
 *
 * Next writes per-segment RSC prefetch payloads as nested folders, e.g.
 *   out/projects/pysdf/__next.projects/$d$slug/__PAGE__.txt
 * but the client requests them with dot separators:
 *   /projects/pysdf/__next.projects.$d$slug.__PAGE__.txt
 * On a static host that 404s, prefetch fails, the destination suspends on
 * navigation, and React's <ViewTransition> never gets a same-commit pair to
 * morph. Mirroring each file under its dotted name makes prefetch succeed.
 */
import { readdirSync, statSync, copyFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = join(process.cwd(), "out");
let copied = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (name !== "__PAGE__.txt") continue;
    // Find the nearest ancestor directory that starts with "__next."
    const parts = relative(OUT, p).split(sep);
    const i = parts.findIndex((s) => s.startsWith("__next."));
    if (i === -1) continue;
    const base = parts.slice(0, i);
    const dotted = parts.slice(i).join(".");
    copyFileSync(p, join(OUT, ...base, dotted));
    copied++;
  }
}
walk(OUT);
console.log(`segments: mirrored ${copied} prefetch payload(s) under dotted names`);
