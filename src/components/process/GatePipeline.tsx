"use client";

import clsx from "clsx";

export type Gate = {
  label: string;
  detail: string;
  href?: string;
};

export function GatePipeline({ gates }: { gates: readonly Gate[] }) {
  return (
    <div className="mt-6">
      {/* Desktop: horizontal pipeline */}
      <ol className="hidden items-center md:flex" aria-label="Pull-request gates">
        {gates.map((g, i) => (
          <li key={g.label} className="flex items-center">
            <Node gate={g} />
            {i < gates.length - 1 && (
              <span aria-hidden="true" className="h-px w-8 shrink-0 bg-white/15 lg:w-12" />
            )}
          </li>
        ))}
      </ol>

      {/* Mobile: vertical pipeline */}
      <ol className="flex flex-col gap-0 md:hidden" aria-label="Pull-request gates">
        {gates.map((g, i) => (
          <li key={g.label} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <span className={clsx("size-3 shrink-0 rounded-full", "bg-tangerine")} />
              {i < gates.length - 1 && (
                <span aria-hidden="true" className="h-8 w-px bg-white/15" />
              )}
            </div>
            <div className="pb-6">
              <MaybeLink href={g.href} className="text-sm font-medium text-paper">
                {g.label}
              </MaybeLink>
              <p className="mt-0.5 text-sm leading-snug text-paper/55">{g.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Node({ gate }: { gate: Gate }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="size-3 rounded-full bg-tangerine" />
      <MaybeLink href={gate.href} className="whitespace-nowrap text-[13px] font-medium text-paper">
        {gate.label}
      </MaybeLink>
      <p className="max-w-[9rem] text-center text-[12px] leading-tight text-paper/55">{gate.detail}</p>
    </div>
  );
}

function MaybeLink({ href, className, children }: { href?: string; className?: string; children: React.ReactNode }) {
  if (!href) return <span className={className}>{children}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={clsx(className, "hover:text-tangerine transition-colors")}>
      {children}
    </a>
  );
}
