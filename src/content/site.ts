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
  siteUrl: "https://harshdipsaha.tech",
  description:
    "Harshdip Saha — machine-learning researcher in medical brain imaging (NexGenLab NSUT, IIT Madras). RECAP-Net placed 3rd worldwide in the BraTS Lighthouse 2025 challenge and was presented at MICCAI 2025. Open to SDE and research internships.",
};

export const nav = [
  { label: "Story", href: "/story" },
  { label: "Projects", href: "/projects" },
  { label: "Gallery", href: "/gallery" },
  { label: "Process", href: "/process" },
];

export const hero = {
  // One plain line a recruiter or a PI outside the field can repeat back.
  kicker: "Machine-learning researcher · medical brain imaging · New Delhi",
  // Two halves, set apart across the viewport like a spread.
  left: "Building ML pipelines",
  right: "& enjoying life through backpropagation",
  subline:
    "I'm an undergraduate researcher (NSUT and IIT Madras) who builds machine-learning models that read brain MRI scans — my MICCAI 2025 paper placed 3rd worldwide in an international brain-tumour challenge — and I build and ship the software around the research.",
};

/** Copy that appears over the scroll-scrubbed brain, in order of scroll depth. */
export const sequence = {
  eyebrow: "MRI template brain · 160 slices",
  hint: "scroll to scan through",
  stages: [
    {
      kicker: "The problem",
      title: "One scan says almost nothing.",
      body: "A brain-tumour patient is scanned every few months. The question that matters — did the tumour grow, shrink, or hold? — needs two scans compared, and that comparison is slow and subjective by eye.",
    },
    {
      kicker: "The work",
      title: "RECAP-Net reads the pair.",
      body: "My model takes two MRI scans of the same patient, months apart, outlines the tumour in each, and classifies the change — progressing, stable, or responding — the way radiologists do under RANO, the standard rulebook for judging treatment response.",
    },
    {
      kicker: "The result",
      title: "World Rank 3.",
      body: "3rd of all teams worldwide in the BraTS Lighthouse 2025 Tumor Progression Challenge — an international competition where every team's model is scored on the same hidden MRI data. Presented as an oral talk at MICCAI 2025 in South Korea (the main medical-imaging AI conference) and published in Springer LNCS.",
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
  title: "Publish it. Ship it. Open-source it.",
  body: "Research that gets peer-reviewed, engineering that gets deployed, and open source that other labs actually run. The same person does all three, and each one makes the others better.",
  cards: [
    {
      title: "Research",
      body: "Teaching a model to read two brain-tumour MRI scans months apart and say whether the tumour grew — RECAP-Net, ranked 3rd worldwide in a 2025 international challenge and presented at MICCAI, the main conference for AI in medical imaging.",
      href: "https://link.springer.com/10.1007/978-3-032-16370-7_23",
      cta: "Read the RECAP-Net paper",
      image: "gallery:5",
    },
    {
      title: "Engineering",
      body: "An internal assistant that helped up to 35,000 employees at a healthcare company find the approved way to use AI for their role; and PyAMorph, a library at IIT Madras that turns images and CAD models into geometry a physics simulation can run on.",
      href: "/projects/pysdf",
      cta: "PyAMorph",
      image: "project:pysdf",
    },
    {
      title: "Open source",
      body: "Fifteen-plus merged pull requests to BrainGlobe, the open-source toolkit neuroscience labs use to map whole-brain microscopy images; a leading contributor to its image-alignment tool.",
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
        "Built an internal assistant, in TypeScript on the company's agent framework, that helps up to 35,000 employees find the approved, governed way to use AI for their specific role — instead of searching policy documents.",
        "Built an automated judge for an internal hackathon: a model that scored, consistently and by fixed rules, how well each team followed AI-DLC (the company's development process, where every change carries a written plan and record), so the human judges had a reliable second opinion.",
        "Interviewed seven kinds of specialist — up to six people each — and turned what they told me into role-specific workflows, prompts, and guardrails the assistant could hand out.",
      ],
    },
    {
      company: "IIT Madras",
      role: "Research Intern — Scientific Computing (remote)",
      when: "Jan 2026 – present",
      points: [
        "Developing PyAMorph, a Python library that turns images, CAD models, and equations into geometry a physics simulation can run on. It works by computing, for every point in space, how far it is from the nearest surface (a signed distance function).",
        "Added shape combination (union, subtraction, intersection), conversion from standard 3D mesh files (STL), and GPU-accelerated bindings, all plugged into AMReX — the US Department of Energy's framework for large simulations on supercomputers.",
        "The work was selected for an oral presentation at INCAM 2026, India's national applied-mathematics conference, at IIT Kanpur; a journal paper is in preparation.",
      ],
    },
    {
      company: "Amazon",
      role: "Amazon ML Summer School",
      when: "Jul – Aug 2026",
      points: ["Selected for Amazon's competitive machine-learning summer programme for students."],
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
  body: "Looking for software-engineering and research internships in 2026–27. If you work on medical imaging, scientific computing, or AI systems that have to be right, I'd like to hear from you.",
};

export const story = {
  title: "Story",
  intro: [
    "I'm a pre-final-year Computer Science student, specialising in AI, at Netaji Subhas University of Technology in Delhi, and an undergraduate researcher at NexGenLab NSUT. My work sits where machine learning meets medicine: computer vision, brain imaging, and the pipelines that make a model's answer trustworthy enough to check against a radiologist's.",
    "Most of it started with one question — can a model tell, from two MRI scans months apart, whether a brain tumour is growing? That became RECAP-Net. It finished 3rd worldwide in the BraTS Lighthouse 2025 Tumor Progression Challenge — an international competition where every team's model is scored on the same hidden set of brain-tumour scans — and I presented it as a talk at MICCAI 2025 in South Korea, the main conference for AI in medical imaging.",
  ],
  statement:
    "I like research that ends in something running, and engineering that ends in something published.",
  more: [
    "Since then the work has widened. At IIT Madras I develop PyAMorph, a library that turns images and CAD models into geometry a physics simulation can run on. At Optum (UnitedHealth Group) I spent a summer on the team piloting AI-DLC — a way of building software where every change carries a written plan and record — across a 35,000-person organisation. And in open source I'm one of the top contributors to BrainGlobe, the toolkit neuroscience labs use to align whole-brain microscopy images to a standard atlas.",
    "Away from the keyboard: 1000+ solved programming problems across LeetCode and GeeksforGeeks — mostly dynamic programming and graph problems, which is probably why the segmentation code looked the way it did.",
  ],
  education: [
    { name: "Netaji Subhas University of Technology, New Delhi", detail: "B.Tech CSE (AI) · GPA 8.78 of 10 · class of 2027", when: "2023 – 2027 (expected)" },
    { name: "Kendriya Vidyalaya No. 2, Delhi Cantt", detail: "Class XII, 95.6% · Class X, 98.4%", when: "2009 – 2023" },
  ],
  achievements: [
    {
      title: "Top open-source contributor, BrainGlobe",
      body: "15+ merged pull requests across the ecosystem; leading contributor to brainglobe-registration, the tool that aligns a lab's brain images to a reference atlas.",
      href: "https://github.com/brainglobe/brainglobe-registration",
    },
    {
      title: "All India Rank 14 — BRAINDEAD, Unstop",
      body: "A national data-science competition. Two builds in one entry: a data-analysis-and-prediction pipeline and a text summariser that pairs a language model with classical methods.",
      href: "https://github.com/HARSHDIPSAHA/braindead_1-2",
    },
    {
      title: "Top 30 of 150+ teams — AI4Humanity Summit",
      body: "Pitched Accurate Precise Timely, an AI-powered hospital scheduling system, in person at the summit held with the Israel Embassy.",
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
  title: "RECAP-Net: does the tumour grow? Classifying glioblastoma response from paired MRI scans",
  venue: "MICCAI 2025, South Korea — oral presentation. Published in Springer Lecture Notes in Computer Science.",
  result: "3rd worldwide, BraTS Lighthouse 2025 Tumor Progression Challenge — every team's model scored on the same hidden brain-tumour scans.",
  links: [
    { label: "Paper", href: "https://link.springer.com/10.1007/978-3-032-16370-7_23" },
    { label: "Code", href: "https://github.com/HARSHDIPSAHA/brats_response_project" },
  ],
};

export const footer = {
  colophon: [
    "Set in Instrument Serif and Commissioner.",
    "The brain is the ICBM 152 Nonlinear Symmetric 2009a T1 template, © 1993–2009 Louis Collins, McConnell Brain Imaging Centre, Montreal Neurological Institute, McGill University. Used with permission under its distribution licence.",
    "Built with Next.js, Motion and Lenis; statically exported to GitHub Pages. Every change to this site is planned and recorded before it ships, and every structural decision is written down — see /process for how.",
  ],
};

export const process = {
  title: "Process",
  headline:
    "Every change to this site starts as a written plan, gets approved, built, checked by four automated gates, and closed with a record. Every decision about how it's put together is written down. You can retrace all of it.",
  why: "I keep this page because the habit matters more than the website. It's the same discipline I use on a research pipeline: leave enough of a written trail that a reviewer can retrace every step without asking me. The site is the worked example you can open.",
  stats: [
    { value: "32", label: "changes recorded, numbered 001–032, since January 2026" },
    { value: "15", label: "decisions written down, numbered 0001–0015" },
    { value: "2", label: "of those decisions later replaced — kept in the record, marked superseded" },
    { value: "4", label: "automated gates on every pull request" },
  ],
  gatesLabel: "What a PR has to pass",
  gates: [
    { label: "Record", detail: "Ships with its own AI-DLC paperwork, or CI rejects it.", href: "https://github.com/HARSHDIPSAHA/HARSHDIPSAHA.github.io/blob/main/.github/workflows/aidlc-check.yml" },
    { label: "Build + Smoke", detail: "Every route loads in a real browser. Zero errors.", href: "https://github.com/HARSHDIPSAHA/HARSHDIPSAHA.github.io/blob/main/.github/workflows/quality-gates.yml" },
    { label: "Lighthouse", detail: "Accessibility, SEO, performance. No category drops.", href: "https://github.com/HARSHDIPSAHA/HARSHDIPSAHA.github.io/blob/main/lighthouserc.desktop.json" },
    { label: "Factuality", detail: "Every number checked against its source repo.", href: "https://github.com/HARSHDIPSAHA/HARSHDIPSAHA.github.io/blob/main/.github/workflows/evals.yml" },
  ] as { label: string; detail: string; href: string }[],
  factsLabel: "What's different here",
  facts: [
    { claim: "Every number on this site is checked against its source.", evidence: "A factuality gate fetches each project's real README and fails if a case study states a number that repository doesn't support.", href: "https://github.com/HARSHDIPSAHA/HARSHDIPSAHA.github.io/blob/main/evals/factuality/run.mjs" },
    { claim: "AI agents get their own edition.", evidence: "llms.txt and llms-full.txt are generated at build time from the same content the site renders, so they can't drift.", href: "https://harshdipsaha.tech/llms.txt" },
    { claim: "Accessibility is 100 on every route, gated.", evidence: "Lighthouse CI runs on every PR. A contrast regression or a missing label fails the build before it ships.", href: "https://github.com/HARSHDIPSAHA/HARSHDIPSAHA.github.io/blob/main/lighthouserc.desktop.json" },
    { claim: "The brain you scrolled through is 160 real MRI slices.", evidence: "Axial slices of the ICBM 152 Nonlinear Symmetric 2009a T1 template, rendered from the original NIfTI file.", href: "https://harshdipsaha.tech/" },
    { claim: "Two earlier decisions were wrong. They're still in the record.", evidence: "ADRs 0001 and 0010 were superseded, not deleted. The history stays honest.", href: "https://github.com/HARSHDIPSAHA/HARSHDIPSAHA.github.io/tree/main/docs/adr" },
  ],
  flowLabel: "How one change moves through",
  flow: [
    {
      step: "Inception",
      body: "Once, at the start: write down what the site must do, how it's structured, and what it runs on. Everything after is measured against this baseline.",
      artefact: "aidlc-docs/inception/",
    },
    {
      step: "Plan",
      body: "Every change gets a number and a short note: what changes against the baseline, and which files are expected to move.",
      artefact: "aidlc-docs/efforts/NNN/requirements-delta.md",
    },
    {
      step: "Approve",
      body: "A person reads the plan and says go. The approval is logged, with the date.",
      artefact: "aidlc-docs/audit.md",
    },
    {
      step: "Build",
      body: "The actual code and copy change. All text lives in one typed file and project write-ups in one folder, so nothing is buried inside components.",
      artefact: "src/  ·  content/",
    },
    {
      step: "Verify",
      body: "The type-check and full build must pass. Then four automated gates run — the pipeline above. Nothing ships until all four are green.",
      artefact: "npm run typecheck  ·  aidlc-check.yml  ·  quality-gates.yml  ·  evals.yml",
    },
    {
      step: "Decide and close",
      body: "If the change altered how the site is put together, the reasoning becomes a numbered ADR. The change is marked complete and indexed, so the history reads in order.",
      artefact: "docs/adr/  ·  effort-state.md  ·  registry.md",
    },
  ],
  decisionsLabel: "Decisions, in one line each",
  decisions: [
    { id: "0002", title: "Publish as plain static files on GitHub Pages", why: "nothing to host, patch, or pay for on a site that changes a few times a year." },
    { id: "0004", title: "Keep every word of copy in one typed file", why: "a renamed field fails the build instead of rendering as a blank." },
    { id: "0009", title: "Let an automated check block undocumented change", why: "the advisory version of this rule was skipped within hours; a gate is not." },
    { id: "0011", title: "Rebuild the site from scratch on a new visual model", why: "two redesigns on the old template hit the same ceiling; this decision replaces two earlier ones." },
    { id: "0012", title: "Gate every change on a browser smoke test and Lighthouse scores", why: "a build that succeeds can still ship a page that throws or an accessibility regression — it did, once; the gate catches both before merge." },
    { id: "0013", title: "Check every number on this site against the source it came from", why: "the write-ups were drafted by an AI from each project's own README; a claim it invented would look exactly like a true one. Now it fails the build." },
    { id: "0014", title: "Publish a plain-text edition of the site for AI agents", why: "an assistant reading this site should not have to scrape twenty styled pages to answer one question about my work." },
  ],
  decisionsNote: "Two earlier decisions (0001, 0010) were later reversed. They stay in the register, marked superseded, so the history stays honest and readable.",
  repo: "https://github.com/HARSHDIPSAHA/HARSHDIPSAHA.github.io",
  skillsLabel: "The toolkit, by name",
  skillsNote:
    "Every Claude Skill actually reached for while building this site — names only, never what's inside them. Drift them, drag one, or click to give it a nudge.",
  skills: [
    "ai-dlc",
    "brainstorming",
    "agent-swarm",
    "dispatching-parallel-agents",
    "frontend-design",
    "documentation-bot",
    "code-review",
    "verification-before-completion",
    "impeccable",
    "ui-ux-pro-max",
    "to-spec",
  ] as string[],
};
