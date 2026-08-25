import { Pill } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] flex-col items-center justify-center px-6 text-center">
      <p className="label">404</p>
      <h1 className="display mt-5 text-[clamp(3rem,9vw,7rem)] text-paper">Nothing on this slice.</h1>
      <div className="mt-10">
        <Pill href="/" variant="accent">
          Back home
        </Pill>
      </div>
    </section>
  );
}
