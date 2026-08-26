/**
 * Two hairlines at the container edges, running the full height of every page
 * beneath the nav. They frame everything — including the brain viewer and the
 * card photographs — the way a drawing sheet's margin lines do.
 */
export function Gutters() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 top-20 z-[5] hidden md:block">
      <div className="mx-auto h-full max-w-[1200px] border-x border-white/[0.07]" />
    </div>
  );
}
