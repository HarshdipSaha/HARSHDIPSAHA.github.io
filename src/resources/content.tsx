import {
  About,
  Blog,
  Gallery,
  Home,
  Newsletter,
  Person,
  Process,
  Publications,
  Social,
  Work,
} from "@/types";
import { Row, Text } from "@once-ui-system/core";
import galleryImages from "@/data/gallery.json";

const person: Person = {
  firstName: "Harshdip",
  lastName: "Saha",
  name: "Harshdip Saha",
  role: "UG Researcher @ NexGenLab NSUT · Open to SDE & research internships",
  avatar: "/images/me.jpg",
  email: "harshdipsaha@gmail.com",
  location: "Asia/Kolkata",
  languages: [],
};

const newsletter: Newsletter = {
  display: false,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: <>My weekly newsletter about creativity and engineering</>,
};

const social: Social = [
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/HARSHDIPSAHA",
    essential: true,
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/harshdip-saha",
    essential: true,
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
    essential: true,
  },
  {
    name: "Resume",
    icon: "resume",
    link: "/resume.pdf",
    essential: true,
  },
];

const home: Home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `Portfolio of ${person.name} — UG researcher @ NexGenLab NSUT. ML, computer vision, neuroimaging. Open to SDE & research internships.`,
  // Plain string (still a valid ReactNode) so the hero's focal sequence can
  // split it per word. See src/components/motion/ScanReveal.tsx.
  headline: "Building ML pipelines & enjoying life through backpropagation",
  featured: {
    display: false,
    title: (
      <Row gap="8" vertical="center">
        <Text onBackground="brand-medium">Featured work</Text>
        <Text onBackground="neutral-weak">→</Text>
      </Row>
    ),
    href: "/work",
  },
  subline: (
    <>
      Undergraduate researcher at <span className="ink-strong">NexGenLab NSUT</span> and{" "}
      <span className="ink-strong">IIT Madras</span>. I work on neuro-oncology imaging and
      scientific computing — and I build and ship the systems around the research.
    </>
  ),
  // NOTE: there is deliberately no hero `plate`. The World Rank 3 result is
  // stated once, by the publication entry below the fold. Repeating it in the
  // first viewport made the same claim appear twice on one screen.
  actions: [
    {
      label: "Read the paper",
      href: "https://link.springer.com/10.1007/978-3-032-16370-7_23",
      external: true,
    },
    { label: "Research & work", href: "/about" },
  ],
  // The home page shows a short selection and defers the catalogue to /work.
  // It previously rendered all 18 projects, duplicating /work exactly.
  selectedWorkCount: 3,
};

const about: About = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `${person.name} — UG researcher @ NexGenLab NSUT. ML, computer vision, neuroimaging. Open to SDE & research internships.`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: false,
    link: "https://cal.com",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        <p className="about-intro-p">
          I am a pre-final year pursuing{" "}
          <span className="intro-cyan">Computer Science Engineering with specialisation in AI</span>{" "}
          from <span className="intro-cyan">Netaji Subhas University of Technology (NSUT)</span>,
          Delhi, and currently a{" "}
          <span className="intro-emerald">UG researcher at NexGenLab NSUT</span>. I work on{" "}
          <span className="intro-amber">machine learning</span>,{" "}
          <span className="intro-amber">computer vision</span>, and{" "}
          <span className="intro-amber">neuroimaging</span> — and I'm{" "}
          <span className="intro-coral">open to SDE and research internships</span>.
        </p>
        <p className="about-intro-p">
          Highlights: <span className="intro-violet">All India Rank 14</span> in BRAINDEAD, and{" "}
          <span className="intro-violet">top 30</span> at AI4Humanity Summit (APT). I enjoy solving
          algorithmic puzzles and have solved <span className="intro-amber">1000+</span> problems on
          LeetCode, GeeksforGeeks, and the like.
        </p>
      </>
    ),
  },
  work: {
    display: true,
    title: "Work Experience",
    experiences: [
      {
        company: "Optum (UnitedHealth Group)",
        timeframe: "Jun 2026 – Aug 2026",
        role: "AI Engineer Intern — AI-DLC Pilot Team",
        achievements: [
          <>
            Joined Optum's newly formed AI Team, a pilot group set up to drive adoption of{" "}
            <span className="intro-amber">AI-DLC (AI-Driven Development Lifecycle)</span> across the
            organization.
          </>,
          <>
            Built a <span className="intro-cyan">deterministic Judge LLM</span> for an internal
            AI-DLC hackathon, evaluating participants on how well they adopted AI-DLC practices in
            their projects — the model supported the human judges with insightful, consistent
            scoring.
          </>,
          <>
            Interviewed <span className="intro-violet">7 top SME roles</span> at Optum — AI/ML
            Engineers, TPMs, Software Engineers, Data Engineers, and more (up to 6 SMEs per role) —
            to deeply understand role-specific workflows and pain points.
          </>,
          <>
            Translated those interviews into reusable{" "}
            <span className="intro-emerald">workflows, skills, prompts, and safety guardrails</span>{" "}
            tailored to each role.
          </>,
          <>
            Completed <span className="intro-amber">Codex 101 and 201</span>, a deep dive into the
            Codex CLI.
          </>,
          <>Built a library for storing skills for upcoming new roles/pods at Optum.</>,
          <>
            Built an <span className="intro-coral">AI Enablement Agent</span>, starting with Codex,
            to help up to <span className="intro-coral">35,000 Optum employees</span> discover which
            governed AI patterns to use — specific to their role and identity. Built on Optum's
            internal Mesh agents framework and TypeScript.
          </>,
          <>
            Worked hands-on with Claude Code subagents and skills — Wayfinder, Superpowers, AI-DLC,
            LLM Council, and more — alongside GitHub Spec Kit.
          </>,
        ],
      },
      {
        company: "IIT Madras",
        timeframe: "Jan 2026 – Present",
        role: "Research Intern — Scientific Computing (Remote)",
        achievements: [
          <>
            Developing <span className="intro-cyan">PyAMorph</span> (formerly pySdf), a Python
            library for 2D/3D signed distance functions enabling simulation-ready geometric
            representations from images, CAD models, and analytical inputs.
          </>,
          <>
            Selected for oral presentation at{" "}
            <span className="intro-violet">INCAM 2026, IIT Kanpur</span>, with the work to be
            published in a Scopus-indexed journal.
          </>,
          <>
            Built a scalable geometry processing engine with{" "}
            <span className="intro-amber">CSG operations</span> and STL-to-SDF conversion,
            integrated with AMReX MultiFab for high-performance simulations using GPU-accelerated
            bindings.
          </>,
          <>
            Applied <span className="intro-emerald">Chan-Vese segmentation</span> and 3D
            morphometric analysis to extract simulation-ready structures from volumetric medical
            data for biomedical imaging workflows.
          </>,
        ],
      },
      {
        company: "Amazon",
        timeframe: "Jul 2026 – Aug 2026",
        role: "Amazon ML Summer School",
        achievements: [<>Selected for Amazon's ML Summer School program.</>],
      },
    ],
  },
  studies: {
    display: true,
    title: "Studies",
    institutions: [
      {
        name: "Netaji Subhas University of Technology, New Delhi — 2027",
        description: <>B.Tech CSE, GPA 8.78. Data Structures, Algorithms, AI, ML.</>,
      },
      {
        name: "Kendriya Vidyalaya No.2, Delhi Cantt — Class XII, 95.6%",
        description: <>CBSE higher secondary education.</>,
      },
      {
        name: "Kendriya Vidyalaya No.2, Delhi Cantt — Class X, 98.4%",
        description: <>CBSE board examinations.</>,
      },
    ],
  },
  technical: {
    display: true,
    title: "Technical skills",
    techStack: [
      { name: "Python", icon: "python" },
      { name: "C++", icon: "cplusplus" },
      { name: "Jupyter", icon: "jupyter" },
      { name: "Pandas", icon: "pandas" },
      { name: "PyTorch", icon: "pytorch" },
      { name: "TensorFlow", icon: "tensorflow" },
      { name: "scikit-learn", icon: "scikitlearn" },
      { name: "OpenCV", icon: "opencv" },
      { name: "MATLAB", icon: "matlab" },
      { name: "SQL", icon: "sql" },
      { name: "Docker", icon: "docker" },
      { name: "Git", icon: "git" },
      { name: "AWS", icon: "aws" },
      { name: "GCP", icon: "gcp" },
      { name: "Hugging Face", icon: "huggingface" },
    ],
    skills: [
      {
        title: "Machine Learning & Data Science",
        description: (
          <>
            Building ML models with Python, PyTorch, TensorFlow, scikit-learn, MONAI, and data
            visualization.
          </>
        ),
        tags: [
          { name: "Python", icon: "python" },
          { name: "Jupyter", icon: "jupyter" },
          { name: "Pandas", icon: "pandas" },
        ],
        images: [],
      },
      {
        title: "Computer Vision & Neuroimaging",
        description: (
          <>Developing 3D medical imaging, segmentation, and computer vision pipelines.</>
        ),
        tags: [{ name: "Python", icon: "python" }],
        images: [],
      },
      {
        title: "Cloud & Tools",
        description: <>Azure, GCP, Hugging Face, LangChain, Git, Docker.</>,
        tags: [
          { name: "Docker", icon: "docker" },
          { name: "AWS", icon: "aws" },
        ],
        images: [],
      },
    ],
  },
  researchInterests: {
    display: true,
    title: "Research interests",
    items: [
      "Machine learning",
      "Artificial intelligence",
      "Natural language processing",
      "Computer vision",
      "Medical AI",
      "Neuroimaging",
      "Cloud computing",
      "Time series analysis",
      "LLM Safety",
      "Alignment",
    ],
  },
  colophon: {
    display: true,
    pronunciation: "/ˈhəːʃdiːp ˈsaːɦa/",
    lines: [
      <>Set in Archivo and JetBrains Mono.</>,
      <>
        Built with Next.js and statically exported to GitHub Pages — no server, no database,
        no tracking beyond analytics.
      </>,
      <>
        Every change to this site is recorded as a numbered effort with a written rationale,
        and every structural decision as an ADR. The whole record is public at{" "}
        <a href="/process" className="link-underline">
          /process
        </a>
        .
      </>,
    ],
  },
  achievements: {
    display: true,
    title: "Achievements",
    items: [
      {
        title: "Top open-source contributor, BrainGlobe ecosystem",
        description: (
          <>
            Merged <span className="intro-emerald">15+ pull requests</span> across the BrainGlobe
            ecosystem's repositories, and a leading contributor to{" "}
            <span className="intro-emerald">brainglobe-registration</span>, improving neuroscience
            image registration pipelines.
          </>
        ),
        links: [
          { label: "BrainGlobe", href: "https://brainglobe.info" },
          {
            label: "brainglobe-registration",
            href: "https://github.com/brainglobe/brainglobe-registration",
          },
        ],
      },
      {
        title: "All India Rank 14 — BRAINDEAD (Unstop), Feb 2025",
        description: (
          <>
            Secured <span className="intro-amber">AIR 14</span> by building two projects: one on EDA
            and ML, and another on an LLM-based hybrid summarizer.
          </>
        ),
        links: [
          { label: "GitHub", href: "https://github.com/HARSHDIPSAHA/braindead_1-2" },
          {
            label: "Certificate",
            href: "https://drive.google.com/file/d/1kDRfsyYErCT-J7_8d0_rdLWOL7X_8H4J/view?usp=sharing",
          },
        ],
      },
      {
        title: "Top 30 of 150+ teams — AI4Humanity Summit (with the Israel Embassy)",
        description: (
          <>
            Selected to pitch offline at the AI4Humanity Summit hackathon for{" "}
            <span className="intro-violet">Accurate Precise Timely</span>, an AI-powered hospital
            scheduling system.
          </>
        ),
        links: [
          {
            label: "Certificate",
            href: "https://drive.google.com/file/d/1xgNv2tibjxkWbEkRg_CV44nZ4n5n1-4I/view",
          },
        ],
      },
    ],
  },
};

const blog: Blog = {
  path: "/blog",
  label: "Blog",
  title: "Writing about Tech and Growth...",
  description: `Read what ${person.firstName} has been up to recently`,
};

const work: Work = {
  path: "/work",
  // Labelled "Projects" in the nav: "Work" reads as employment, and this
  // section is project case studies. The /work path is unchanged so existing
  // links, the sitemap, and every /work/<slug> URL keep resolving.
  label: "Projects",
  title: `Projects – ${person.name}`,
  description: `ML, computer vision, healthcare & hackathon projects — with code and case studies.`,
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Gallery",
  title: `Gallery – ${person.name}`,
  description: `Moments from MICCAI 2025, hackathons, and beyond.`,
  images: galleryImages as { src: string; alt: string; orientation: string }[],
};

const process: Process = {
  path: "/process",
  label: "Process",
  title: `Process – ${person.name}`,
  description:
    "How this site is built: AI-DLC efforts, architecture decision records, and a docs-first repo structure.",
  headline: (
    <>
      This site is also a <span className="intro-cyan">worked example</span>. It's built with{" "}
      <span className="intro-amber">AI-DLC</span> — the AI-Driven Development Lifecycle I work with
      on Optum's pilot team — where every change is a numbered <em>effort</em> and every structural
      decision is written down as an <span className="intro-violet">ADR</span> before it's
      forgotten.
    </>
  ),
  stats: [
    { value: "7", label: "AI-DLC efforts" },
    { value: "8", label: "decisions recorded" },
    { value: "5", label: "repo layers" },
    { value: "100%", label: "static, zero-ops" },
  ],
  layers: [
    {
      name: "Context",
      purpose: "How any agent should behave in this repo",
      paths: ["AGENTS.md", "CLAUDE.md", "CONTEXT.md", "AGENT_WORKFLOWS.md"],
    },
    {
      name: "Capabilities",
      purpose: "What agents can do here",
      paths: [".claude/skills/", "AGENT_WORKFLOWS.md"],
    },
    {
      name: "Knowledge",
      purpose: "Decisions and documentation that outlive the commit",
      paths: [
        "docs/adr/",
        "docs/tutorials/",
        "docs/how-to/",
        "docs/reference/",
        "docs/explanation/",
      ],
    },
    {
      name: "Product",
      purpose: "The software itself",
      paths: ["src/app/", "src/components/", "src/resources/content.tsx", "scripts/"],
    },
    {
      name: "Quality gates",
      purpose: "What must hold before anything ships",
      paths: ["evals/", ".github/workflows/deploy.yml"],
    },
  ],
  efforts: [
    {
      id: "001",
      title: "Once UI template adoption",
      status: "complete",
      date: "Jan 2026",
      summary:
        "Vendored the Once UI portfolio template, stood up the GitHub Pages pipeline, and wrote the first gallery sync script.",
    },
    {
      id: "002",
      title: "Flatten and personalise",
      status: "complete",
      date: "Jan 2026",
      summary:
        "Moved the template to the repo root and pruned 1,175 lines of its demo blog content rather than shipping placeholders.",
    },
    {
      id: "003",
      title: "Content schema & About components",
      status: "complete",
      date: "Jan 2026",
      summary:
        "Hand-wrote the tech-stack strip and research-interests block, and extended the typed content contracts behind them.",
    },
    {
      id: "004",
      title: "Drop-zone image sync pipeline",
      status: "complete",
      date: "Jan 2026",
      summary:
        "Made gallery/ and project_images/ the source of truth, with sync scripts wired into predev and prebuild.",
    },
    {
      id: "005",
      title: "Optum experience",
      status: "complete",
      date: "Aug 2026",
      summary:
        "Added the Optum AI-DLC pilot-team internship and Amazon ML Summer School — the first change here to ship with a written rationale.",
    },
    {
      id: "006",
      title: "AtoM-Net project",
      status: "complete",
      date: "Aug 2026",
      summary:
        "Published AtoM-Net, a neuro-symbolic negotiation theory-of-mind pipeline, currently in review at EMNLP 2026.",
    },
    {
      id: "007",
      title: "Docs-first AI-DLC restructure",
      status: "in-progress",
      date: "Aug 2026",
      summary:
        "Adopted the agent-repo playbook layout, backfilled the inception baseline and eight ADRs, and published this page.",
    },
  ],
  decisions: [
    { id: "0001", title: "Once UI / Next.js portfolio template", status: "Accepted" },
    { id: "0002", title: "Static export to GitHub Pages", status: "Accepted" },
    { id: "0003", title: "Flatten template into repo root", status: "Accepted" },
    { id: "0004", title: "Content-as-code with a typed schema", status: "Accepted" },
    { id: "0005", title: "Drop-zone image sync pipeline", status: "Accepted" },
    { id: "0006", title: "Prune template demo content", status: "Accepted" },
    { id: "0007", title: "MDX per project content model", status: "Accepted" },
    { id: "0008", title: "Adopt AI-DLC and a docs-first structure", status: "Accepted" },
  ],
};

// Publications previously lived hardcoded inside src/app/about/page.tsx, which
// broke the content-as-code rule in AGENTS.md. Moved here so it can be rendered
// on both /about and the home page from one source.
const publications: Publications = {
  display: true,
  title: "Publications",
  items: [
    {
      title: "RECAP-Net: longitudinal glioblastoma response classification",
      venue: "MICCAI 2025, South Korea — oral presentation",
      result: "World Rank 3",
      year: "2025",
      image: "/images/publications/miccai.jpg",
      // The venue line and the result plate above already state MICCAI, the oral
      // presentation and the rank. The summary describes the METHOD and nothing
      // that has already been said.
      // Plain string: the home page renders it through <ProbeText>, which needs
      // to split it per word for the scroll-linked sweep.
      summaryText:
        "An end-to-end pipeline for longitudinal glioblastoma response classification under RANO criteria — Swin UNETR segmentation, 3D CNNs, and GAN-based class balancing — entered in the BraTS Lighthouse 2025 Tumor Progression Challenge.",
      summary: (
        <>
          An end-to-end pipeline for longitudinal glioblastoma response classification under{" "}
          <span className="ink-strong">RANO criteria</span> — Swin UNETR segmentation, 3D CNNs,
          and GAN-based class balancing — entered in the BraTS Lighthouse 2025 Tumor Progression
          Challenge.
        </>
      ),
      links: [
        { label: "Paper", href: "https://link.springer.com/10.1007/978-3-032-16370-7_23" },
        { label: "Code", href: "https://github.com/HARSHDIPSAHA/brats_response_project" },
      ],
    },
  ],
};

export { person, social, newsletter, home, about, blog, work, gallery, process, publications };
