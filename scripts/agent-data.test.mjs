import assert from "node:assert/strict";
import test from "node:test";
import { renderAgentData } from "./lib/agent-data.mjs";

/**
 * Tested at its pure seam, same discipline as llms-txt.test.mjs: content in,
 * a plain JSON-serialisable object out. No filesystem, no network.
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
    description: "Ada Lovelace —\nanalyst of the   Analytical Engine.",
  },
  story: {
    skills: ["Algebra", "Mechanical Engineering"],
  },
};

const projects = [
  {
    slug: "engine",
    title: "Analytical Engine",
    summary: "A general-purpose mechanical computer.",
    year: "1843",
    link: "https://github.com/ada/engine",
    body: "ignored here",
  },
  {
    slug: "loom",
    title: "Jacquard Loom Study",
    summary: "Punched cards as program storage.",
    year: "1842",
    body: "ignored here",
  },
];

test("the profile carries the expected fields, bio collapsed to one line", () => {
  const { profile } = renderAgentData(site, projects);
  assert.equal(profile.name, "Ada Lovelace");
  assert.equal(profile.role, "analyst");
  assert.equal(profile.location, "London");
  assert.equal(profile.bio, "Ada Lovelace — analyst of the Analytical Engine.");
  assert.equal(profile.email, "ada@example.com");
  assert.equal(profile.github, "https://github.com/ada");
  assert.equal(profile.linkedin, "https://linkedin.com/in/ada");
  assert.deepEqual(profile.skills, ["Algebra", "Mechanical Engineering"]);
});

test("resume and siteUrl are absolute, built from person.siteUrl", () => {
  const { profile } = renderAgentData(site, projects);
  assert.equal(profile.resume, "https://example.test/resume.pdf");
  assert.equal(profile.siteUrl, "https://example.test/");
});

test("every project maps to slug/title/summary/year/url, code only when a link exists", () => {
  const { projects: out } = renderAgentData(site, projects);
  assert.equal(out.length, 2);

  const engine = out.find((p) => p.slug === "engine");
  assert.deepEqual(engine, {
    slug: "engine",
    title: "Analytical Engine",
    summary: "A general-purpose mechanical computer.",
    year: "1843",
    url: "https://example.test/projects/engine",
    code: "https://github.com/ada/engine",
  });

  const loom = out.find((p) => p.slug === "loom");
  assert.deepEqual(loom, {
    slug: "loom",
    title: "Jacquard Loom Study",
    summary: "Punched cards as program storage.",
    year: "1842",
    url: "https://example.test/projects/loom",
  });
  assert.ok(!("code" in loom), "no link means no code field, not code: undefined");
});

test("no project body text leaks into the output", () => {
  const json = JSON.stringify(renderAgentData(site, projects));
  assert.ok(!json.includes("ignored here"));
});

test("every URL is absolute on the canonical origin, and no host is hardcoded", () => {
  const data = renderAgentData(site, projects);
  const json = JSON.stringify(data);
  assert.ok(!json.includes("harshdipsaha"), "the real host must come from person.siteUrl, not a literal");
  for (const p of data.projects) {
    assert.match(p.url, /^https:\/\/example\.test\//);
  }
});

test("adding a project changes only that project's entry", () => {
  const before = renderAgentData(site, projects);
  const added = { slug: "notes", title: "Notes", summary: "Marginalia.", year: "1844", body: "x" };
  const after = renderAgentData(site, [added, ...projects]);

  assert.deepEqual(after.profile, before.profile, "profile is unaffected by the project list");
  assert.deepEqual(after.projects.filter((p) => p.slug !== "notes"), before.projects);
  assert.deepEqual(after.projects.find((p) => p.slug === "notes"), {
    slug: "notes",
    title: "Notes",
    summary: "Marginalia.",
    year: "1844",
    url: "https://example.test/projects/notes",
  });
});

test("the renderer performs no I/O", async () => {
  const text = await import("node:fs").then((fs) =>
    fs.readFileSync(new URL("./lib/agent-data.mjs", import.meta.url), "utf8"),
  );
  assert.ok(!/require\(|from ["']node:/.test(text), "the renderer imports nothing from Node's runtime");
  assert.ok(!/process\./.test(text), "the renderer does not read process state");
});
