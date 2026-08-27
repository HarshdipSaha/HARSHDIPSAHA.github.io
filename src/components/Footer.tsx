import Link from "next/link";
import { footer, nav, person } from "@/content/site";
import { Container } from "./ui";

// Résumé lives in the header pill and the Closing CTA row, not here — one home per item.
const elsewhere = [
  { label: "GitHub", href: person.github },
  { label: "LinkedIn", href: person.linkedin },
  { label: "Email", href: `mailto:${person.email}` },
];

export function Footer() {
  return (
    <footer className="hairline border-t">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:py-24">
        <div>
          <p className="display text-4xl text-paper">
            {person.firstName}
            <span className="text-paper/45"> Saha</span>
          </p>
          <p className="mt-4 max-w-xs text-paper/60">{person.role}. Open to SDE and research internships.</p>
        </div>
        <div>
          <p className="label mb-5">Site</p>
          <ul className="flex flex-col gap-3 text-paper/80">
            <li>
              <Link href="/" className="hover:text-paper">Home</Link>
            </li>
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-paper">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label mb-5">Elsewhere</p>
          <ul className="flex flex-col gap-3 text-paper/80">
            {elsewhere.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-paper">
                  {l.label} <span aria-hidden="true" className="text-paper/40">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
      <Container className="pb-12">
        <div className="hairline mx-auto w-[97%] border-t pt-8">
          {footer.colophon.map((line) => (
            <p key={line} className="mt-2 max-w-3xl text-[13px] leading-relaxed text-paper/55">
              {line}
            </p>
          ))}
          <p className="mt-6 text-[13px] text-paper/55">© {new Date().getFullYear()} {person.name}</p>
        </div>
      </Container>
    </footer>
  );
}
