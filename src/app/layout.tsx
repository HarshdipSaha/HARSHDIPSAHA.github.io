import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import classNames from "classnames";

import { Background, Column, Flex, opacity, SpacingToken } from "@once-ui-system/core";
import { Footer, Header, RouteGuard, Providers } from "@/components";
import { baseURL, effects, fonts, style, dataStyle, home } from "@/resources";
import { generateMeta } from "@/utils/meta";

export async function generateMetadata() {
  return generateMeta({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

/**
 * The direction contract for this build, emitted as a real HTML comment in the
 * first position inside <body> so it survives the production build and can be
 * audited against the render. A JSX comment would compile away and leave
 * nothing to grep for.
 */
const DIRECTION_CONTRACT = `<!--
  THESIS: a research portfolio read as a segmentation overlay - the work is the scan,
  emphasis is the mask. Refuses the card-grid catalogue homepage this category always
  ships, where the entire project list IS the landing page.
  OWN-WORLD: an 11-step neutral ramp (--scan-00..10) as the only tonal values; one mask
  accent (--mask) meaning exactly one thing, peer-reviewed or externally verifiable.
  Archivo grotesque with tabular figures, JetBrains Mono for readouts and label plates.
  Hairline rules. No shadows, no gradients, no chromatic emphasis.
  STORY: a supervisor learns within one viewport that this person holds a peer-reviewed,
  ranked result, then descends through the research, then the systems around it.
  FIRST VIEWPORT: name and role as a mono readout, headline at display scale, the
  RECAP-Net result as a mask label plate (World Rank 3, BraTS-PRO 2025, MICCAI oral),
  one positioning line, two actions. No project cards above the fold.
  FORM: segmentation overlay; candidate 1 of 7 on the grounded list, chosen by the user
  over the roll's assignment (index 4, proceedings page). Seed key 5bc9e1e1.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the finish
  review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
-->`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Flex
      suppressHydrationWarning
      as="html"
      lang="en"
      fillWidth
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
      )}
    >
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-8XH1D95S9J"></script>
        <script
          id="google-analytics"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-8XH1D95S9J');
            `,
          }}
        />
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const root = document.documentElement;
                  const defaultTheme = 'system';
                  
                  // Set defaults from config
                  const config = ${JSON.stringify({
                    brand: style.brand,
                    accent: style.accent,
                    neutral: style.neutral,
                    solid: style.solid,
                    "solid-style": style.solidStyle,
                    border: style.border,
                    surface: style.surface,
                    transition: style.transition,
                    scaling: style.scaling,
                    "viz-style": dataStyle.variant,
                  })};
                  
                  // Apply default values
                  Object.entries(config).forEach(([key, value]) => {
                    root.setAttribute('data-' + key, value);
                  });
                  
                  // Resolve theme
                  const resolveTheme = (themeValue) => {
                    if (!themeValue || themeValue === 'system') {
                      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }
                    return themeValue;
                  };
                  
                  // Apply saved theme
                  const savedTheme = localStorage.getItem('data-theme');
                  const resolvedTheme = resolveTheme(savedTheme);
                  root.setAttribute('data-theme', resolvedTheme);
                  
                  // Apply any saved style overrides
                  const styleKeys = Object.keys(config);
                  styleKeys.forEach(key => {
                    const value = localStorage.getItem('data-' + key);
                    if (value) {
                      root.setAttribute('data-' + key, value);
                    }
                  });
                } catch (e) {
                  console.error('Failed to initialize theme:', e);
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <Providers>
        <Column
          as="body"
          background="page"
          fillWidth
          style={{ minHeight: "100vh" }}
          margin="0"
          padding="0"
          horizontal="center"
        >
          <script
            dangerouslySetInnerHTML={{
              __html:
                "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.setAttribute('data-motion','on')}}catch(e){}",
            }}
          />
          <div
            style={{ display: "none" }}
            dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }}
          />
          <div className="progressive-blur" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="page-gutter" aria-hidden="true">
            <span />
          </div>
          <Background
            mask={{
              x: effects.mask.x,
              y: effects.mask.y,
              radius: effects.mask.radius,
              cursor: effects.mask.cursor,
            }}
            gradient={{
              display: effects.gradient.display,
              opacity: effects.gradient.opacity as opacity,
              x: effects.gradient.x,
              y: effects.gradient.y,
              width: effects.gradient.width,
              height: effects.gradient.height,
              tilt: effects.gradient.tilt,
              colorStart: effects.gradient.colorStart,
              colorEnd: effects.gradient.colorEnd,
            }}
            dots={{
              display: effects.dots.display,
              opacity: effects.dots.opacity as opacity,
              size: effects.dots.size as SpacingToken,
              color: effects.dots.color,
            }}
            grid={{
              display: effects.grid.display,
              opacity: effects.grid.opacity as opacity,
              color: effects.grid.color,
              width: effects.grid.width,
              height: effects.grid.height,
            }}
            lines={{
              display: effects.lines.display,
              opacity: effects.lines.opacity as opacity,
              size: effects.lines.size as SpacingToken,
              thickness: effects.lines.thickness,
              angle: effects.lines.angle,
              color: effects.lines.color,
            }}
          />
          <Flex fillWidth minHeight="16" s={{ hide: true }} />
          <Header />
          <Flex zIndex={0} fillWidth padding="l" horizontal="center" flex={1}>
            <Flex horizontal="center" fillWidth minHeight="0">
              <RouteGuard>{children}</RouteGuard>
            </Flex>
          </Flex>
          <Footer />
          <Analytics />
          <SpeedInsights />
        </Column>
      </Providers>
    </Flex>
  );
}
