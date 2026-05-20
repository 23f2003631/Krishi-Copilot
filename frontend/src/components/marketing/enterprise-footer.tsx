import Link from "next/link";
import { Globe2, Linkedin, LockKeyhole, Sprout, Twitter } from "lucide-react";

const footerLinks = [
  {
    title: "Platform",
    links: ["Copilot Dashboard", "AI Recommendations", "Field Actions", "Analytics"],
  },
  {
    title: "Solutions",
    links: ["Campaign Planning", "Retailer Readiness", "Weather Triggers", "Grower Segments"],
  },
  {
    title: "Enterprise",
    links: ["Governance", "Security", "Implementation", "Support"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Compliance", "Data Policy"],
  },
];

export function EnterpriseFooter() {
  return (
    <footer id="enterprise" className="footer-reveal relative border-t border-white/[0.07] bg-[#030604] px-5 py-14 md:px-8 md:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(to_bottom,rgba(29,155,98,0.08),transparent)]" />
      <div className="relative mx-auto grid max-w-[1180px] gap-10 md:grid-cols-[1.2fr_2fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[#B7D8C3]">
              <Sprout className="h-5 w-5" />
            </span>
            <span className="text-[17px] font-semibold text-white">Syngenta Krishi Copilot</span>
          </div>
          <p className="mt-5 max-w-[360px] text-[13px] leading-6 text-white/48">
            Enterprise agricultural intelligence for campaign orchestration, retailer readiness, and field execution.
          </p>
          <div className="mt-7 flex items-center gap-3 text-white/42">
            <a className="rounded-full border border-white/[0.08] bg-white/[0.035] p-2 transition-colors hover:text-white" href="#" aria-label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </a>
            <a className="rounded-full border border-white/[0.08] bg-white/[0.035] p-2 transition-colors hover:text-white" href="#" aria-label="Twitter">
              <Twitter className="h-4 w-4" />
            </a>
            <a className="rounded-full border border-white/[0.08] bg-white/[0.035] p-2 transition-colors hover:text-white" href="#" aria-label="Global network">
              <Globe2 className="h-4 w-4" />
            </a>
            <span className="ml-2 inline-flex items-center gap-2 text-[12px] font-medium text-white/42">
              <LockKeyhole className="h-3.5 w-3.5" />
              Enterprise grade
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/82">{group.title}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link}>
                    <Link className="text-[13px] text-white/42 transition-colors hover:text-white/76" href="/planner">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="relative mx-auto mt-12 flex max-w-[1180px] flex-col gap-3 border-t border-white/[0.06] pt-6 text-[12px] text-white/34 md:flex-row md:items-center md:justify-between">
        <span>2026 Syngenta Krishi Copilot. Operational intelligence for agricultural teams.</span>
        <span>Built for governed field execution.</span>
      </div>
    </footer>
  );
}
