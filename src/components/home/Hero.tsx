import { TextAnimate } from "@/components/motion/TextAnimate";
import { hero } from "@/content/site";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col px-6 pb-16 pt-32 md:px-12 md:pb-28">
      <div className="flex flex-1 items-center">
        <h1 className="display grid w-full gap-y-[clamp(1.5rem,6vw,4rem)] text-[clamp(2.75rem,7.2vw,8.5rem)] text-paper md:grid-cols-2">
          <TextAnimate
            as="span"
            text={hero.left}
            trigger="mount"
            duration={0.6}
            delay={0.15}
            className="block max-w-[clamp(12rem,40vw,34rem)]"
          />
          <TextAnimate
            as="span"
            text={hero.right}
            trigger="mount"
            duration={0.8}
            delay={0.55}
            className="block max-w-[clamp(14rem,44vw,40rem)] md:ml-auto md:mt-[clamp(2rem,10vw,7rem)]"
          />
        </h1>
      </div>

      <div className="mx-auto w-full max-w-[36rem] text-center">
        <TextAnimate
          text={hero.subline}
          trigger="mount"
          duration={1.1}
          delay={1.1}
          className="text-[1.05rem] leading-relaxed text-paper/80 md:text-[1.2rem]"
        />
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="label !text-[11px]">scroll</span>
        <span className="block h-10 w-px overflow-hidden bg-white/10">
          <span className="scroll-hint block h-full w-full bg-paper/60" />
        </span>
      </div>
    </section>
  );
}
