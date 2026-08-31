# Harshdip Saha — Portfolio

Personal portfolio site: **[harshdipsaha.tech](https://harshdipsaha.tech/)** · [harshdipsaha.github.io](https://harshdipsaha.github.io)

Next.js 16 (App Router, static export) · React 19 · TypeScript · Tailwind CSS v4 · Motion · Lenis · MDX · deployed to GitHub Pages.

---

# Harshdip Saha — Portfolio

Personal portfolio site: **[harshdipsaha.tech](https://harshdipsaha.tech/)**

A modern, highly interactive portfolio built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, and Motion. The platform showcases professional experiences, projects, and a unique 3D/glassmorphism design aesthetic.

---

## An Innovative Approach: AI-DLC

This repository is more than just a portfolio; it serves as a practical demonstration of **AI-DLC** (AI-Driven Development Lifecycle). This methodology introduces a transparent and structured development history, prioritizing documentation and reasoning alongside the codebase.

By capturing architectural decisions and effort states systematically, the project avoids the common pitfalls of undocumented changes and opaque commit histories.

- **Architecture Decision Records (ADRs):** Every major structural decision is documented as an ADR, ensuring the reasoning behind every choice remains accessible and maintainable over time.
- **Effort Tracking:** Every iteration and major change is tracked as a numbered *effort*, creating a clear audit trail of intent and execution.
- **Living Documentation:** The build story and engineering process are published on the site itself at **[/process](https://harshdipsaha.tech/process)**, demonstrating the value of the AI-DLC methodology in practice.

This structured approach ensures that any contributor—human or AI agent—can understand the system's shape, the rationale behind past decisions, and the expected conventions for future work without relying on guesswork.

## Exploring the Repository

The project is organized to separate context, knowledge, and execution:

- **Context & Capabilities:** Defined in `AGENTS.md`, `CLAUDE.md`, and `CONTEXT.md`. These files outline how AI agents should interact with the repository.
- **Knowledge Base:** The `docs/` directory contains structured guides (tutorials, how-tos, references, and explanations), alongside the `docs/adr/` folder which acts as the architectural "why" log.
- **Lifecycle Records:** The `aidlc-docs/` directory contains the baseline inception documents and all recorded efforts.
- **Core Product:** The actual website source code resides in `src/`, with content managed via MDX in the `content/` directory.

## Contributing

For changes of any size, please follow the AI-DLC methodology. Start by reading [`AGENTS.md`](./AGENTS.md) and refer to the guide on [running an AI-DLC effort](./docs/how-to/run-an-aidlc-effort.md) before making modifications.
