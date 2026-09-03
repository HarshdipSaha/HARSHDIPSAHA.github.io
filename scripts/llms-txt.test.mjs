import assert from "node:assert/strict";
import test from "node:test";
import { renderLlmsTxt } from "./lib/llms-txt.mjs";

/**
 * The generator is tested at its pure seam: content in, text out. No
 * filesystem is involved, so these assertions are about the document shape
 * only — "the build actually wrote the file" is a separate claim, checked
 * against out/ after a real build.
 */

const site = {
  person: {
    name: "Ada Lovelace",
    role: "analyst",
    location: "London",
    email: "ada@example.com",
    github: "https://github.com/ada",
    linkedin: "https://linkedin.com/in/ada",
    resume: "/resume.pdf",
    siteUrl: "https://example.test",
    description: "Ada Lovelace — analyst of the Analytical Engine.",
  },
  nav: [
    { label: "Story", href: "/story" },
    { label: "Projects", href: "/projects" },
  ],
  story: {
    intro: ["I write notes on engines."],
    achievements: [{ title: "Note G", body: "The first program.", href: "https://example.test/note-g" }],
  },
  publication: {
    title: "Sketch of the Analytical Engine",
    venue: "Taylor's Scientific Memoirs, 1843.",
    result: "First published algorithm.",
    links: [
      { label: "Paper", href: "https://example.test/sketch" },
      { label: "Code", href: "https://github.com/ada/sketch" },
    ],
  },
};

const projects = [
  {
    slug: "engine",
    title: "Analytical Engine",
    summary: "A general-purpose mechanical computer.",
    year: "1843",
    link: "https://github.com/ada/engine",
    body: "## Overview\n\nBernoulli numbers, computed by machine.",
  },
  {
    slug: "loom",
    title: "Jacquard Loom Study",
    summary: "Punched cards as program storage.",
    year: "1842",
    body: "## Overview\n\nCards weave algebraic patterns.",
  },
];

const posts = [
  {
    slug: "on-the-loom",
    title: "Notes on the Jacquard Loom",
    summary: "First impressions of punched-card control.",
    year: "1841",
    tag: "Notebook",
    body: "## First look\n\nThe cards read like a program, not a picture.",
  },
];

test("the index follows the llms.txt shape", () => {
  const { index } = renderLlmsTxt(site, projects);
  const lines = index.split("\n");

  assert.equal(lines[0], "# Ada Lovelace", "first line is the H1");
  assert.equal(lines.length >= 3 && lines[2].startsWith("> "), true, "a blockquote summary follows the H1");
  assert.equal((index.match(/^# /gm) ?? []).length, 1, "exactly one H1");

  for (const heading of ["## Site", "## Projects", "## Writing", "## Research", "## Elsewhere", "## Optional"]) {
    assert.ok(index.includes(`\n${heading}\n`), `has the ${heading} section`);
  }
});

test("the index satisfies what Lighthouse's llms-txt audit checks", () => {
  const { index, full } = renderLlmsTxt(site, projects);
  for (const [name, doc] of [["index", index], ["full", full]]) {
    assert.match(doc, /^\s*#\s+.+/m, `${name}: has an H1`);
    assert.match(doc, /\[.+\]\(.+\)/, `${name}: contains at least one markdown link`);
    assert.ok(doc.length > 50, `${name}: is longer than 50 characters`);
  }
});

test("every project appears in both variants", () => {
  const { index, full } = renderLlmsTxt(site, projects);
  for (const p of projects) {
    for (const [name, doc] of [["index", index], ["full", full]]) {
      assert.ok(doc.includes(p.title), `${name}: has ${p.title}`);
      assert.ok(doc.includes(`https://example.test/projects/${p.slug}`), `${name}: links ${p.slug}`);
    }
  }
});

test("every URL is absolute on the canonical origin, and no host is hardcoded", () => {
  const { index, full } = renderLlmsTxt(site, projects, posts);
  for (const doc of [index, full]) {
    for (const url of doc.match(/\]\(([^)]+)\)/g) ?? []) {
      const href = url.slice(2, -1);
      assert.ok(
        /^https?:\/\//.test(href) || href.startsWith("mailto:"),
        `relative URL leaked into the output: ${href}`,
      );
    }
    assert.ok(!doc.includes("harshdipsaha"), "the real host must come from person.siteUrl, not a literal");
  }
  // Own-site links use the origin the person record declares.
  assert.ok(index.includes("https://example.test/resume.pdf"));
  assert.ok(index.includes("https://example.test/llms-full.txt"));
});

test("only the full variant carries case-study body text", () => {
  const { index, full } = renderLlmsTxt(site, projects);
  assert.ok(full.includes("Bernoulli numbers, computed by machine."), "full inlines the body");
  assert.ok(!index.includes("Bernoulli numbers"), "the index does not");
  assert.ok(full.includes("Cards weave algebraic patterns."));
});

test("case-study headings are demoted so they nest under the project heading", () => {
  const { full } = renderLlmsTxt(site, projects);
  assert.ok(full.includes("### Analytical Engine"), "the project is an H3");
  assert.ok(full.includes("#### Overview"), "its body's H2 became an H4");
  assert.ok(!/^## Overview$/m.test(full), "no body heading competes with a section heading");
});

test("writing posts appear in a Writing section in both variants", () => {
  const { index, full } = renderLlmsTxt(site, projects, posts);
  for (const p of posts) {
    for (const [name, doc] of [["index", index], ["full", full]]) {
      assert.ok(doc.includes(p.title), `${name}: has ${p.title}`);
      assert.ok(doc.includes(`https://example.test/writing/${p.slug}`), `${name}: links ${p.slug}`);
    }
  }
});

test("only the full variant carries writing post body text", () => {
  const { index, full } = renderLlmsTxt(site, projects, posts);
  assert.ok(full.includes("The cards read like a program, not a picture."), "full inlines the post body");
  assert.ok(!index.includes("The cards read like a program"), "the index does not");
});

test("writing post headings are demoted so they nest under the post heading", () => {
  const { full } = renderLlmsTxt(site, projects, posts);
  assert.ok(full.includes("### Notes on the Jacquard Loom"), "the post is an H3");
  assert.ok(full.includes("#### First look"), "its body's H2 became an H4");
});

test("omitting posts renders an empty Writing section rather than throwing", () => {
  const { index, full } = renderLlmsTxt(site, projects);
  assert.ok(index.includes("\n## Writing\n"));
  assert.ok(full.includes("\n## Writing\n"));
});

test("adding a project changes only that project's lines", () => {
  const before = renderLlmsTxt(site, projects);
  const added = { slug: "notes", title: "Notes", summary: "Marginalia.", year: "1844", body: "Body." };
  const after = renderLlmsTxt(site, [added, ...projects]);

  const removed = before.index.split("\n").filter((l) => !after.index.split("\n").includes(l));
  assert.deepEqual(removed, [], "nothing that was in the index disappeared");

  const gained = after.index.split("\n").filter((l) => !before.index.split("\n").includes(l));
  assert.deepEqual(gained, ["- [Notes](https://example.test/projects/notes): Marginalia. (1844)"]);
});

test("the renderer performs no I/O", async () => {
  // A pure function cannot need any of these; importing the module in a fresh
  // process with them stubbed to throw proves it at module scope too.
  const source = await import("node:fs/promises").then(() => null);
  assert.equal(source, null);
  const text = await import("node:fs").then((fs) => fs.readFileSync(new URL("./lib/llms-txt.mjs", import.meta.url), "utf8"));
  assert.ok(!/require\(|from ["']node:/.test(text), "the renderer imports nothing from Node's runtime");
  assert.ok(!/process\./.test(text), "the renderer does not read process state");
});
