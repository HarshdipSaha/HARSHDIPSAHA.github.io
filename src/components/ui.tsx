import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";

type PillProps = {
  href: string;
  children: ReactNode;
  variant?: "glass" | "accent" | "ghost";
  size?: "sm" | "md";
  className?: string;
  external?: boolean;
} & Omit<ComponentProps<"a">, "href" | "className" | "children">;

/** The only button shape on the site. */
export function Pill({ href, children, variant = "glass", size = "md", className, external, ...rest }: PillProps) {
  const isExternal = external ?? (/^(https?:|mailto:)/.test(href) || href.endsWith(".pdf"));
  const cls = clsx(
    "inline-flex items-center gap-2 rounded-full font-medium whitespace-nowrap transition-[background-color,color,transform] duration-300 ease-out-cubic",
    "active:scale-[0.98]",
    size === "sm" ? "px-4 py-2 text-sm" : "px-5 py-2.5 text-[15px]",
    variant === "glass" && "glass text-paper hover:bg-white/15",
    variant === "accent" && "bg-tangerine text-ink hover:bg-[#f7a86c]",
    variant === "ghost" && "text-paper/80 hover:text-paper hover:bg-white/8",
    className,
  );
  if (isExternal) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={clsx("label", className)}>{children}</p>;
}

export function Container({ children, className, wide }: { children: ReactNode; className?: string; wide?: boolean }) {
  return (
    <div className={clsx("mx-auto w-full px-6 md:px-10", wide ? "max-w-[1400px]" : "max-w-[1200px]", className)}>
      {children}
    </div>
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={clsx("size-[0.9em]", className)} fill="none">
      <path d="M3 8h9M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
