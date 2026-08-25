/**
 * Every word on the site that is not a project case study lives here.
 * Components render this; they do not invent copy.
 */

export const person = {
  name: "Harshdip Saha",
  firstName: "Harshdip",
  role: "UG researcher, NexGenLab NSUT",
  email: "harshdipsaha@gmail.com",
  location: "New Delhi, India",
  github: "https://github.com/HARSHDIPSAHA",
  linkedin: "https://www.linkedin.com/in/harshdip-saha",
  resume: "/resume.pdf",
  siteUrl: "https://harshdipsaha.github.io",
  description:
    "Harshdip Saha — undergraduate researcher at NexGenLab NSUT and IIT Madras. Neuro-oncology imaging, scientific computing, and the systems around the research. Open to SDE and research internships.",
};

export const nav = [
  { label: "Story", href: "/story" },
  { label: "Projects", href: "/projects" },
  { label: "Gallery", href: "/gallery" },
  { label: "Process", href: "/process" },
];

export const hero = {
  // Two halves, set apart across the viewport like a spread.
  left: "Building ML pipelines",
  right: "& enjoying life through backpropagation",
  subline:
    "Undergraduate researcher at NexGenLab NSUT and IIT Madras. I work on neuro-oncology imaging and scientific computing — and I build and ship the systems around the research.",
};

/** Copy that appears over the scroll-scrubbed brain, in order of scroll depth. */
export const sequence = {
  eyebrow: "ICBM 152 template · 160 axial slices · scroll to section",
  stages: [
    {
      kicker: "The problem",
      title: "One scan says almost nothing.",
      body: "Two scans, months apart, say everything — if you can tell whether the tumour grew, shrank, or held.",
    },
    {
      kicker: "The work",
      title: "RECAP-Net reads the pair.",
      body: "Swin UNETR segmentation, 3D CNNs, GAN-based class balancing, and the RANO criteria as the ground truth — an end-to-end pipeline for longitudinal glioblastoma response classification.",
    },
    {
      kicker: "The result",
      title: "World Rank 3.",
      body: "BraTS Lighthouse 2025 Tumor Progression Challenge. Presented as an oral at MICCAI 2025, South Korea.",
      links: [
        { label: "Read the paper", href: "https://link.springer.com/10.1007/978-3-032-16370-7_23", accent: true },
        { label: "Code", href: "https://github.com/HARSHDIPSAHA/brats_response_project" },
      ],
    },
  ],
};

/** Words light up as they scroll through the viewport. `*word*` is accented. */
export const passage =
  "A paper is a piece of maths that other people will build on without re-deriving it — every product that uses it borrows it on trust. That's why I take research seriously. And it's why I ship what I build: because an idea only becomes *real* when it survives being used.";

export const threads = {
  label: "Three threads",
  title: "One brain, three ways in.",
  body: "Research that gets published, engineering that gets deployed, and open source that other labs actually run. The same person does all three, and each one makes the others better.",
  cards: [
    {
      title: "Research",
      body: "Longitudinal glioblastoma response with RECAP-Net; PGGANs for temporal brain MRI; a neuro-symbolic negotiation model in review at EMNLP 2026.",
      href: "/projects/atomnet",
      cta: "AtoM-Net",
      image: "gallery:5",
    },
    {
      title: "Engineering",
      body: "An AI Enablement Agent for 35,000 Optum employees, and PyAMorph — signed distance functions for simulation-ready geometry at IIT Madras.",
      href: "/projects/pysdf",
      cta: "PyAMorph",
      image: "project:pysdf",
    },
    {
      title: "Open source",
      body: "Fifteen-plus merged pull requests across the BrainGlobe ecosystem, and a leading contributor to brainglobe-registration.",
      href: "https://github.com/brainglobe/brainglobe-registration",
      cta: "brainglobe-registration",
      image: "gallery:1",
    },
  ],
};

export const experience = {
  label: "Experience",
  items: [
    {
      company: "Optum (UnitedHealth Group)",
      role: "AI Engineer Intern — AI-DLC Pilot Team",
      when: "Jun – Aug 2026",
      points: [
        "Built an AI Enablement Agent, on Optum's Mesh agents framework in TypeScript, to help up to 35,000 employees find the governed AI patterns for their role.",
        "Built a deterministic Judge LLM for an internal AI-DLC hackathon that scored how well teams adopted the lifecycle, consistently enough to support the human judges.",
        "Interviewed seven SME roles — up to six people each — and turned the interviews into role-specific workflows, skills, prompts, and guardrails.",
      ],
    },
    {
      company: "IIT Madras",
      role: "Research Intern — Scientific Computing (remote)",
      when: "Jan 2026 – present",
      points: [
        "Developing PyAMorph, a Python library for 2D/3D signed distance functions that turns images, CAD models, and analytical inputs into simulation-ready geometry.",
        "CSG operations and STL-to-SDF conversion integrated with AMReX MultiFab, with GPU-accelerated bindings.",
        "Selected for an oral presentation at INCAM 2026, IIT Kanpur; publication in a Scopus-indexed journal to follow.",
      ],
    },
    {
      company: "Amazon",
      role: "Amazon ML Summer School",
      when: "Jul – Aug 2026",
      points: ["Selected for Amazon's ML Summer School cohort."],
    },
  ],
};

export const selectedProjects = {
  label: "Selected projects",
  slugs: ["pysdf", "atomnet", "branddiffusion", "tinysafetynet", "apt", "missing-person-identification"],
  allLabel: "All projects",
};

export const closing = {
  title: "Open to what's next.",
  body: "SDE and research internships for 2026–27. If you work on medical imaging, scientific computing, or agents that have to be right, I'd like to hear from you.",
};

export const story = {
  title: "Story",
  intro: [
    "I'm a pre-final-year Computer Science student, specialising in AI, at Netaji Subhas University of Technology in Delhi, and an undergraduate researcher at NexGenLab NSUT. My work sits where machine learning meets medicine: computer vision, neuroimaging, and the pipelines that make a model's answer trustworthy enough to check against a radiologist's.",
    "Most of it started with one question — can a model tell, from two MRI scans months apart, whether a glioblastoma is progressing? That became RECAP-Net, a World Rank 3 finish in the BraTS Lighthouse 2025 Tumor Progression Challenge, and an oral presentation at MICCAI 2025 in South Korea.",
  ],
  statement:
    "I like research that ends in something running, and engineering that ends in something published.",
  more: [
    "Since then the work has widened. At IIT Madras I develop PyAMorph, a signed-distance-function library for simulation-ready geometry. At Optum I spent a summer on the pilot team bringing AI-DLC — a development lifecycle where every change carries its written rationale — to a 35,000-person organisation. And in open source I'm one of the top contributors to the BrainGlobe ecosystem, where neuroscience labs register whole-brain images.",
    "Away from the keyboard: 1000+ solved problems across LeetCode and GeeksforGeeks, All India Rank 14 in BRAINDEAD, and a top-30 finish at the AI4Humanity Summit. I'm open to SDE and research internships.",
  ],
  education: [
    { name: "Netaji Subhas University of Technology, New Delhi", detail: "B.Tech CSE (AI) · GPA 8.78 · class of 2027" },
    { name: "Kendriya Vidyalaya No. 2, Delhi Cantt", detail: "Class XII, 95.6% · Class X, 98.4%" },
  ],
  achievements: [
    {
      title: "Top open-source contributor, BrainGlobe",
      body: "15+ merged pull requests across the ecosystem; leading contributor to brainglobe-registration.",
      href: "https://github.com/brainglobe/brainglobe-registration",
    },
    {
      title: "All India Rank 14 — BRAINDEAD, Unstop",
      body: "Two builds in one competition: an EDA-and-ML pipeline and an LLM-based hybrid summariser.",
      href: "https://github.com/HARSHDIPSAHA/braindead_1-2",
    },
    {
      title: "Top 30 of 150+ teams — AI4Humanity Summit",
      body: "Pitched Accurate Precise Timely, an AI-powered hospital scheduling system, offline at the summit held with the Israel Embassy.",
      href: "https://github.com/HARSHDIPSAHA/APT",
    },
  ],
  skills: [
    "Python", "C++", "PyTorch", "TensorFlow", "MONAI", "scikit-learn", "OpenCV", "Pandas",
    "SQL", "Docker", "Git", "AWS", "GCP", "Hugging Face", "LangChain", "MATLAB", "TypeScript",
  ],
  interests: [
    "Medical AI", "Neuroimaging", "Computer vision", "LLM safety & alignment",
    "Natural language processing", "Time series", "Scientific computing",
  ],
  colophon: {
    word: "Harshdip",
    ipa: "/ˈhɜːrʃ.diːp/",
    gloss: "from Sanskrit harṣa, joy, and dīpa, lamp",
  },
};

export const publication = {
  title: "RECAP-Net: longitudinal glioblastoma response classification",
  venue: "MICCAI 2025, South Korea — oral presentation",
  result: "World Rank 3, BraTS Lighthouse 2025 Tumor Progression Challenge",
  links: [
    { label: "Paper", href: "https://link.springer.com/10.1007/978-3-032-16370-7_23" },
    { label: "Code", href: "https://github.com/HARSHDIPSAHA/brats_response_project" },
  ],
};

export const footer = {
  colophon: [
    "Set in Instrument Serif and Commissioner.",
    "The brain is the ICBM 152 Nonlinear Symmetric 2009a T1 template, © 1993–2009 Louis Collins, McConnell Brain Imaging Centre, Montreal Neurological Institute, McGill University. Used with permission under its distribution licence.",
    "Built with Next.js, Motion and Lenis; statically exported to GitHub Pages. Every change to this site is recorded as an AI-DLC effort and every structural decision as an ADR — see /process.",
  ],
};

export const process = {
  title: "Process",
  headline:
    "This site is also a worked example. It's built with AI-DLC — the AI-Driven Development Lifecycle I worked on at Optum — where every change is a numbered effort and every structural decision is written down as an ADR before it's forgotten.",
  stats: [
    { value: "13", label: "efforts recorded" },
    { value: "11", label: "decisions (ADRs)" },
    { value: "5", label: "repo layers" },
    { value: "1", label: "CI gate that rejects undocumented change" },
  ],
  layers: [
    { name: "Context", purpose: "How any agent should behave in this repo", paths: ["AGENTS.md", "CLAUDE.md", "CONTEXT.md", "AGENT_WORKFLOWS.md"] },
    { name: "Knowledge", purpose: "Decisions and documentation that outlive the commit", paths: ["docs/adr/", "docs/how-to/", "docs/reference/", "docs/explanation/"] },
    { name: "Record", purpose: "One folder per change, with intent, stages and verification", paths: ["aidlc-docs/efforts/", "aidlc-docs/registry.md", "aidlc-docs/audit.md"] },
    { name: "Product", purpose: "The software itself", paths: ["src/", "content/", "scripts/"] },
    { name: "Quality gates", purpose: "What must hold before anything ships", paths: [".github/workflows/aidlc-check.yml", ".github/workflows/deploy.yml"] },
  ],
  decisions: [
    { id: "0001", title: "Once UI / Next.js portfolio template", status: "Superseded" },
    { id: "0002", title: "Static export to GitHub Pages", status: "Accepted" },
    { id: "0003", title: "Flatten template into repo root", status: "Accepted" },
    { id: "0004", title: "Content-as-code with a typed schema", status: "Accepted" },
    { id: "0005", title: "Drop-zone image pipeline", status: "Accepted" },
    { id: "0006", title: "Prune template demo content", status: "Accepted" },
    { id: "0007", title: "MDX per project content model", status: "Accepted" },
    { id: "0008", title: "Adopt AI-DLC and a docs-first structure", status: "Accepted" },
    { id: "0009", title: "CI-enforced AI-DLC recording", status: "Accepted" },
    { id: "0010", title: "Segmentation-overlay design system", status: "Superseded" },
    { id: "0011", title: "Rebuild from scratch on the thine.com model", status: "Accepted" },
  ],
  repo: "https://github.com/HARSHDIPSAHA/HARSHDIPSAHA.github.io",
};
