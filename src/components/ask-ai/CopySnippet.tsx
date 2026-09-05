"use client";

import { useState } from "react";
import clsx from "clsx";

/**
 * A code block with a copy button. `navigator.clipboard` is unavailable in
 * some contexts (e.g. non-HTTPS); the failure is swallowed rather than
 * surfaced, matching this site's rule that a visitor never sees a console
 * error or a broken control (WebMcpTools.tsx, ADR 0014).
 */
export function CopySnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — nothing to show, nothing to break */
    }
  }

  return (
    <div className="glass relative rounded-2xl">
      <pre className="overflow-x-auto p-5 pr-24 font-mono text-[13px] leading-relaxed text-paper/85">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className={clsx(
          "absolute right-3 top-3 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-300",
          copied ? "bg-seafoam text-ink" : "glass text-paper/80 hover:bg-white/15",
        )}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}
