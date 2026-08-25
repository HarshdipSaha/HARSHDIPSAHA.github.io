import { IconName } from "@/resources/icons";
import { zones } from "tzdata";

/**
 * IANA time zone string (e.g., 'Asia/Calcutta', 'Europe/Vienna').
 * See: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 */
export type IANATimeZone = Extract<keyof typeof zones, string>; // Narrow to string keys for React usage

/**
 * Represents a person featured in the portfolio.
 */
export type Person = {
  /** First name of the person */
  firstName: string;
  /** Last name of the person */
  lastName: string;
  /** The name you want to display, allows variations like nicknames */
  name: string;
  /** Role or job title */
  role: string;
  /** Path to avatar image */
  avatar: string;
  /** Email address */
  email: string;
  /** IANA time zone location */
  location: IANATimeZone;
  /** Languages spoken */
  languages?: string[];
};

/**
 * Newsletter Section
 * @description The below information will be displayed on the Home page in Newsletter block
 */
export type Newsletter = {
  /** Whether to display the newsletter section */
  display: boolean;
  /** Title of the newsletter   */
  title: React.ReactNode;
  /** Description of the newsletter */
  description: React.ReactNode;
};

/**
 * Social link configuration.
 */
export type Social = Array<{
  /** Name of the social platform */
  name: string;
  /** Icon for the social platform
   * The icons are a part of "src/resources/icons.ts" file.
   * If you need a different icon, import it there and reference it everywhere else
   */
  icon: IconName;
  /**
   * The link to the social platform
   *
   * The link is not validated by code, make sure it's correct
   */
  link: string;
  /** Whether this social link is essential and should be displayed on the about page */
  essential?: boolean;
}>;

/**
 * Base interface for page configuration with common properties.
 */
export interface BasePageConfig {
  /** Path to the page
   *
   * The path should be relative to the public directory
   */
  path: `/${string}` | string;
  /** Label for navigation or display */
  label: string;
  /** Title of the page */
  title: string;
  /** Description for SEO and metadata */
  description: string;
  /** OG Image should be put inside `public/images` folder */
  image?: `/images/${string}` | string;
}

/**
 * Home page configuration.
 */
export interface Home extends BasePageConfig {
  /** The image to be displayed in metadata
   *
   * The image needs to be put inside `/public/images/` directory
   */
  image: `/images/${string}` | string;
  /** The headline of the home page */
  headline: React.ReactNode;
  /** Featured badge, which appears above the headline */
  featured: {
    display: boolean;
    title: React.ReactNode;
    href: string;
  };
  /** The sub text which appears below the headline */
  subline: React.ReactNode;
  /** The single verified result that leads the first viewport.
   *
   * Rendered as a mono label plate. This is the one place the mask accent is
   * spent on the home page, so it must be a peer-reviewed or externally
   * checkable claim — never a self-assessment.
   */
  plate?: {
    /** Short metric or rank, e.g. "World Rank 3" */
    metric: string;
    /** The venue or context, e.g. "BraTS-PRO 2025 · MICCAI oral" */
    context: string;
    /** Where the claim can be verified */
    href: string;
  };
  /** Primary actions in the first viewport, in priority order. */
  actions?: Array<{
    label: string;
    href: string;
    /** External links open in a new tab and get rel=noopener. */
    external?: boolean;
  }>;
  /** How many project cards the home page shows before deferring to /work. */
  selectedWorkCount?: number;
}

/**
 * A published or accepted piece of research.
 */
export interface Publication {
  title: string;
  venue: string;
  /** Short verified outcome, e.g. "World Rank 3". Rendered as a mask plate. */
  result?: string;
  year: string;
  summary: React.ReactNode;
  /** Plain-text twin of `summary`, for the scroll-illuminated rendering. */
  summaryText?: string;
  image?: string;
  links: Array<{ label: string; href: string }>;
}

/**
 * Publications block — previously hardcoded inside the About page component,
 * which broke the repo's content-as-code rule.
 */
export interface Publications {
  display: boolean;
  title: string;
  items: Publication[];
}

/**
 * About page configuration.
 * @description Configuration for the About page, including sections for table of contents, avatar, calendar, introduction, work experience, studies, and technical skills.
 */
export interface About extends BasePageConfig {
  /** Table of contents configuration */
  tableOfContent: {
    /** Whether to display the table of contents */
    display: boolean;
    /** Whether to show sub-items in the table of contents */
    subItems: boolean;
  };
  /** Avatar section configuration */
  avatar: {
    /** Whether to display the avatar */
    display: boolean;
  };
  /** Calendar section configuration */
  calendar: {
    /** Whether to display the calendar */
    display: boolean;
    /** Link to the calendar */
    link: string;
  };
  /** Introduction section */
  intro: {
    /** Whether to display the introduction */
    display: boolean;
    /** Title of the introduction section */
    title: string;
    /** Description of the introduction section */
    description: React.ReactNode;
  };
  /** Work experience section */
  work: {
    /** Whether to display work experience */
    display: boolean;
    /** Title for the work experience section */
    title: string;
    /** List of work experiences */
    experiences: Array<{
      /** Company name */
      company: string;
      /** Timeframe of employment */
      timeframe: string;
      /** Role or job title */
      role: string;
      /** Achievements at the company */
      achievements: React.ReactNode[];
      /** Images related to the experience */
      images?: Array<{
        /** Image source path */
        src: string;
        /** Image alt text */
        alt: string;
        /** Image width ratio */
        width: number;
        /** Image height ratio */
        height: number;
      }>;
    }>;
  };
  /** Studies/education section */
  studies: {
    /** Whether to display studies section */
    display: boolean;
    /** Title for the studies section */
    title: string;
    /** List of institutions attended */
    institutions: Array<{
      /** Institution name */
      name: string;
      /** Description of studies */
      description: React.ReactNode;
    }>;
  };
  /** Technical skills section */
  technical: {
    /** Whether to display technical skills section */
    display: boolean;
    /** Title for the technical skills section */
    title: string;
    /** Flat tech stack for strip (icon + name), uses IconName */
    techStack?: Array<{ name: string; icon: IconName }>;
    /** List of technical skills */
    skills: Array<{
      /** Skill title */
      title: string;
      /** Skill description */
      description?: React.ReactNode;
      /** Skill tags */
      tags?: Array<{
        name: string;
        icon?: string;
      }>;
      /** Images related to the skill */
      images?: Array<{
        /** Image source path */
        src: string;
        /** Image alt text */
        alt: string;
        /** Image width ratio */
        width: number;
        /** Image height ratio */
        height: number;
      }>;
    }>;
  };
  /** Research interests section (after Technical skills) */
  researchInterests?: {
    display: boolean;
    title: string;
    items: string[];
  };
  /** Achievements section (after Research interests) */
  achievements?: {
    display: boolean;
    title: string;
    items: Array<{
      /** Achievement headline */
      title: string;
      /** Supporting detail */
      description: React.ReactNode;
      /** Optional link buttons, e.g. GitHub / Certificate */
      links?: Array<{
        label: string;
        href: string;
      }>;
    }>;
  };
  /** Closing colophon: how the thing was made. */
  colophon?: {
    display: boolean;
    /** Pronunciation, rendered in mono. */
    pronunciation?: string;
    /** One line per row. Kept factual — a colophon states production facts. */
    lines: React.ReactNode[];
  };
}

/**
 * Blog page configuration.
 * @description Configuration for the Blog page, including metadata and navigation label.
 */
export interface Blog extends BasePageConfig {}

/**
 * Work/projects page configuration.
 * @description Configuration for the Work/Projects page, including metadata and navigation label.
 */
export interface Work extends BasePageConfig {}

/**
 * Process page configuration.
 * @description Configuration for the /process page — the public AI-DLC build story:
 * how this site is built, the layers of the repo, the effort log, and the decision log.
 */
export interface Process extends BasePageConfig {
  /** Short lead paragraph rendered under the page title */
  headline: React.ReactNode;
  /** Headline stats rendered as a strip */
  stats: Array<{
    /** The figure itself, e.g. "8" */
    value: string;
    /** What the figure counts, e.g. "ADRs recorded" */
    label: string;
  }>;
  /** The repo's structural layers (context / capabilities / knowledge / product / quality) */
  layers: Array<{
    /** Layer name */
    name: string;
    /** What this layer answers */
    purpose: string;
    /** Real paths that make up this layer */
    paths: string[];
  }>;
  /** The AI-DLC effort log, newest last */
  efforts: Array<{
    /** Zero-padded effort number, e.g. "001" */
    id: string;
    /** Effort title */
    title: string;
    /** Effort status: complete | in-progress | blocked | abandoned */
    status: string;
    /** Date or range the effort ran */
    date: string;
    /** One-line description of what changed */
    summary: string;
  }>;
  /** The decision log surfaced from docs/adr/ */
  decisions: Array<{
    /** Zero-padded ADR number, e.g. "0001" */
    id: string;
    /** ADR title */
    title: string;
    /** ADR status: Accepted | Proposed | Superseded */
    status: string;
  }>;
}

/**
 * Gallery page configuration.
 * @description Configuration for the Gallery page, including metadata, navigation label, and image list.
 */
export interface Gallery extends BasePageConfig {
  /** List of images in the gallery */
  images: Array<{
    /** Image source path */
    src: string;
    /** Image alt text */
    alt: string;
    /** Image orientation (horizontal/vertical) */
    orientation: string;
  }>;
}
