import {
  siCplusplus,
  siDocker,
  siGit,
  siGooglecloud,
  siHuggingface,
  siLangchain,
  siOpencv,
  siPandas,
  siPython,
  siPytorch,
  siScikitlearn,
  siTensorflow,
  siTypescript,
} from "simple-icons";

/**
 * Official brand marks for the `/story` Tools pills, keyed by the exact
 * strings in `story.skills` (`src/content/site.ts`).
 *
 * Only the named icons are imported — `simple-icons` is side-effect-free ESM,
 * so the bundle carries these thirteen `path` strings, not the whole set.
 * Every icon is drawn in the current text colour (`fill-current`); the brand
 * `hex` is deliberately unused — the palette is ink / paper / tangerine only.
 *
 * Tools with no entry here (MONAI, SQL, MATLAB, AWS have no simple-icons
 * glyph) keep the coloured dot the pill has always had.
 */
const ICONS: Readonly<Record<string, { readonly path: string }>> = {
  Python: siPython,
  "C++": siCplusplus,
  PyTorch: siPytorch,
  TensorFlow: siTensorflow,
  "scikit-learn": siScikitlearn,
  OpenCV: siOpencv,
  Pandas: siPandas,
  Docker: siDocker,
  Git: siGit,
  GCP: siGooglecloud,
  "Hugging Face": siHuggingface,
  LangChain: siLangchain,
  TypeScript: siTypescript,
};

/** The 24×24 SVG path for a tool's brand mark, or `undefined` when there is none. */
export function toolIconPath(name: string): string | undefined {
  return ICONS[name]?.path;
}
