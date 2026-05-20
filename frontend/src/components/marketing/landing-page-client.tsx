"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  RadioTower,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { EnterpriseFooter } from "@/components/marketing/enterprise-footer";
import { HeroDashboardStage } from "@/components/marketing/hero-dashboard-stage";
import { LandingNavbar } from "@/components/marketing/landing-navbar";
import { RevealWrapper } from "@/components/motion/reveal-wrapper";

const storySections = [
  {
    eyebrow: "Operational Authority",
    title: "A single command layer for field reality.",
    description:
      "Krishi Copilot consolidates crop stage, weather risk, retailer stock, and channel readiness into a calm operating picture for every campaign window.",
    metric: "94%",
    metricLabel: "territory readiness",
    visual: "authority",
    icon: RadioTower,
    align: "left",
  },
  {
    eyebrow: "AI Intelligence",
    title: "Recommendations stay tied to observable signals.",
    description:
      "Every AI directive is grounded in reason codes, receptivity, timing, and stock gates so teams can trust the next action instead of interpreting a black box.",
    metric: "3.2x",
    metricLabel: "faster planning cycles",
    visual: "intelligence",
    icon: BrainCircuit,
    align: "right",
  },
  {
    eyebrow: "Predictive Decisioning",
    title: "Campaign windows surface before risk becomes visible.",
    description:
      "Predictive models weigh agronomic pressure, grower behavior, and local supply readiness to identify the most practical deployment path.",
    metric: "+18%",
    metricLabel: "forecast engagement lift",
    visual: "decisioning",
    icon: BarChart3,
    align: "left",
  },
  {
    eyebrow: "Field Execution",
    title: "Insights move from screen to village route.",
    description:
      "Territory owners receive action queues, retailer gates, weather dependencies, and rep assignments that keep execution practical and accountable.",
    metric: "48h",
    metricLabel: "optimal action window",
    visual: "execution",
    icon: UsersRound,
    align: "right",
  },
  {
    eyebrow: "Enterprise Governance",
    title: "Growth systems with controls built in.",
    description:
      "Approval queues, audit-ready workflows, explainability, and live health signals help enterprise teams scale intelligence without losing operational discipline.",
    metric: "24/7",
    metricLabel: "workflow observability",
    visual: "governance",
    icon: ShieldCheck,
    align: "left",
  },
] as const;

export function LandingPageClient() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (reduceMotion) {
      return () => window.removeEventListener("scroll", onScroll);
    }

    const context = gsap.context(() => {
      const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      heroTimeline
        .fromTo(".hero-kicker", { opacity: 0, y: 18, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8 })
        .fromTo(
          ".hero-title-line",
          { opacity: 0, y: 32, filter: "blur(12px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.95, stagger: 0.1 },
          "-=0.42"
        )
        .fromTo(".hero-copy, .hero-cta", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.72, stagger: 0.1 }, "-=0.42")
        .fromTo(".hero-light", { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 1.25, ease: "sine.out" }, "-=0.72")
        .fromTo(
          ".hero-dashboard-scene",
          { opacity: 0, y: 56, rotateX: 7, scale: 0.94, filter: "blur(10px)" },
          { opacity: 1, y: 0, rotateX: 0, scale: 1, filter: "blur(0px)", duration: 1.2, ease: "power3.out" },
          "-=0.48"
        );

      gsap.utils.toArray<HTMLElement>(".motion-reveal").forEach((element, index) => {
        gsap.fromTo(
          element,
          {
            opacity: 0,
            y: 34,
            filter: "blur(10px)",
          },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.95,
            delay: index % 2 ? 0.04 : 0,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 76%",
            },
          }
        );
      });

      gsap.fromTo(
        ".footer-reveal",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".footer-reveal",
            start: "top 84%",
          },
        }
      );
    }, rootRef);

    return () => {
      window.removeEventListener("scroll", onScroll);
      context.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="landing-canvas min-h-screen overflow-hidden bg-[#050806] text-white selection:bg-[#1F9D62]/30 selection:text-white">
      <LandingNavbar scrolled={scrolled} />

      <main className="relative">
        <section className="relative overflow-hidden px-5 pb-24 pt-28 md:px-8 md:pb-32 md:pt-32">
          <div className="hero-light pointer-events-none absolute left-1/2 top-[10%] h-[520px] w-[840px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.13),rgba(183,216,195,0.08)_30%,rgba(29,155,98,0.09)_43%,transparent_70%)] blur-2xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.052),transparent_34%),radial-gradient(circle_at_20%_42%,rgba(29,155,98,0.08),transparent_30%),radial-gradient(circle_at_80%_58%,rgba(183,216,195,0.055),transparent_34%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(183,216,195,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(183,216,195,0.22)_1px,transparent_1px)] [background-size:72px_72px]" />
          <div className="noise-overlay" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_48%,rgba(0,0,0,0.72)_100%)]" />

          <div className="relative z-10 mx-auto flex max-w-[1180px] flex-col items-center text-center">
            <div className="hero-kicker inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.045] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B7D8C3] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1F9D62] shadow-[0_0_16px_rgba(31,157,98,0.38)]" />
              Enterprise agricultural intelligence
            </div>

            <h1 className="mt-7 max-w-[820px] text-[38px] font-semibold leading-[1.02] text-white sm:text-[50px] md:text-[64px] lg:text-[72px]">
              <span className="hero-title-line block">Campaign intelligence,</span>
              <span className="hero-title-line block text-white/90">grown from the field up.</span>
            </h1>

            <p className="hero-copy mt-6 max-w-[560px] text-[14px] font-medium leading-7 text-white/58 md:text-[15px]">
              Syngenta Krishi Copilot connects crop intelligence, weather signals, and retailer readiness into a single operational view.
            </p>

            <div className="hero-cta mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Link
                  href="/planner"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1F9D62] px-7 text-[13px] font-semibold text-[#041008] shadow-[0_18px_44px_rgba(31,157,98,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] transition-colors duration-300 hover:bg-[#B7D8C3]"
                >
                  Explore the Platform
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </div>

            <HeroDashboardStage />
          </div>
        </section>

        <section id="platform" className="relative px-5 pb-28 md:px-8 md:pb-36">
          <div className="section-bridge pointer-events-none absolute inset-x-0 -top-40 h-80 bg-[linear-gradient(to_bottom,transparent,rgba(5,8,6,0.92)_48%,rgba(5,8,6,0.98))]" />
          <div className="relative z-10 mx-auto max-w-[1180px]">
            <RevealWrapper className="mx-auto max-w-[700px] text-center">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#B7D8C3]/80">Intelligent Orchestration</p>
              <h2 className="mt-4 text-[34px] font-semibold leading-[1.05] text-white md:text-[46px]">
                Intelligence with visual tension, not visual noise.
              </h2>
              <p className="mt-5 text-[15px] leading-7 text-white/52">
                Quiet atmospheric space frames dense operational systems so teams understand what matters, where to act, and why the recommendation exists.
              </p>
            </RevealWrapper>

            <div id="solutions" className="mt-20 space-y-24 md:mt-28 md:space-y-32">
              {storySections.map((section, index) => {
                const Icon = section.icon;
                const reverse = section.align === "right";

                return (
                  <RevealWrapper
                    key={section.eyebrow}
                    className={`relative grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-16 ${
                      reverse ? "md:grid-cols-[0.95fr_1.05fr]" : ""
                    }`}
                  >
                    <div className={`relative ${reverse ? "md:order-2" : ""}`}>
                      <div className="premium-story-card group relative overflow-hidden rounded-[22px] border border-white/[0.09] bg-white/[0.035] p-[1px] shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
                        <div className="relative aspect-[16/10] overflow-hidden rounded-[21px] bg-[#0A120E]">
                          <StoryVisual visual={section.visual} />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_16%,rgba(255,255,255,0.16),transparent_32%),linear-gradient(135deg,rgba(5,8,6,0.18),rgba(5,8,6,0.78))]" />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_74%,rgba(29,155,98,0.18),transparent_36%)]" />
                          <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/26 p-3 text-[#B7D8C3] backdrop-blur-xl">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-5 rounded-[16px] border border-white/[0.08] bg-black/28 p-4 backdrop-blur-xl">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">{section.metricLabel}</p>
                              <p className="mt-1 text-[34px] font-semibold text-white">{section.metric}</p>
                            </div>
                            <span className="rounded-full border border-[#B7D8C3]/20 bg-[#DDEADF]/10 px-3 py-1.5 text-[11px] font-semibold text-[#B7D8C3]">
                              Verified signal
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={reverse ? "md:order-1" : ""}>
                      <div className="max-w-[500px]">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#B7D8C3]/76">{section.eyebrow}</p>
                        <h3 className="mt-5 text-[32px] font-semibold leading-[1.05] text-white md:text-[44px]">{section.title}</h3>
                        <p className="mt-6 text-[15px] leading-7 text-white/56">{section.description}</p>
                        <div className="mt-8 grid max-w-[430px] grid-cols-2 gap-3">
                          {["Context aware", "Auditable", "Field ready", "Governed"].map((label) => (
                            <div
                              key={label}
                              className="rounded-[14px] border border-white/[0.075] bg-white/[0.035] px-4 py-3 text-[12px] font-semibold text-white/66 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                            >
                              <CheckCircle2 className="mb-2 h-4 w-4 text-[#B7D8C3]" />
                              {label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </RevealWrapper>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative px-5 pb-24 pt-2 md:px-8 md:pb-32">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_48%,rgba(29,155,98,0.12),transparent_48%)]" />
          <RevealWrapper className="relative z-10 mx-auto max-w-[900px] overflow-hidden rounded-[24px] border border-white/[0.1] bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025)_42%,rgba(29,155,98,0.055))] p-[1px] shadow-[0_34px_110px_rgba(0,0,0,0.46),0_0_110px_rgba(29,155,98,0.10)]">
            <div className="relative overflow-hidden rounded-[23px] px-6 py-14 text-center md:px-14 md:py-20">
              <div className="absolute left-1/2 top-0 h-[280px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14),rgba(183,216,195,0.09)_36%,transparent_70%)] blur-2xl" />
              <div className="noise-overlay" />
              <div className="relative z-10">
                <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#B7D8C3]/78">Deployment ready</p>
                <h2 className="mx-auto mt-5 max-w-[680px] text-[36px] font-semibold leading-[1.04] text-white md:text-[54px]">
                  Turn field intelligence into coordinated action.
                </h2>
                <p className="mx-auto mt-6 max-w-[560px] text-[15px] leading-7 text-white/56">
                  Give campaign, territory, retailer, and field teams one calm AI operating layer for the next high-confidence window.
                </p>
                <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/planner"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1F9D62] px-7 text-[13px] font-semibold text-[#041008] shadow-[0_18px_44px_rgba(31,157,98,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] transition-colors hover:bg-[#B7D8C3]"
                  >
                    Open Live Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="mailto:enterprise@syngenta.example"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-white/[0.13] bg-white/[0.035] px-7 text-[13px] font-semibold text-white/78 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.07] hover:text-white"
                  >
                    Contact Sales
                  </a>
                </div>
              </div>
            </div>
          </RevealWrapper>
        </section>
      </main>

      <EnterpriseFooter />
    </div>
  );
}

function StoryVisual({ visual }: { visual: (typeof storySections)[number]["visual"] }) {
  if (visual === "authority") {
    return (
      <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_38%_34%,rgba(183,216,195,0.16),transparent_34%),linear-gradient(145deg,#17211A,#07100B_62%)]">
        <div className="absolute inset-10 grid grid-cols-8 gap-1.5 opacity-70">
          {Array.from({ length: 56 }).map((_, index) => (
            <span
              key={index}
              className={`rounded-[5px] border border-white/[0.035] ${
                index % 7 === 0 ? "bg-[#B7D8C3]/28" : index % 5 === 0 ? "bg-[#0D7A43]/34" : "bg-white/[0.055]"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (visual === "intelligence") {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(29,155,98,0.18),transparent_34%),linear-gradient(145deg,#111A14,#050907)]">
        <div className="absolute inset-x-10 top-14 flex items-center justify-between">
          {["Crop", "Weather", "Stock", "Reach"].map((label) => (
            <span key={label} className="flex h-16 w-16 items-center justify-center rounded-full border border-[#B7D8C3]/20 bg-white/[0.045] text-[11px] font-semibold text-white/72">
              {label}
            </span>
          ))}
        </div>
        <div className="absolute bottom-10 left-10 right-10 rounded-[16px] border border-white/[0.08] bg-black/22 p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-white/42">
            <span>Reason code confidence</span>
            <span className="text-[#B7D8C3]">92%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
            <div className="h-full w-[92%] rounded-full bg-[#1F9D62]" />
          </div>
        </div>
      </div>
    );
  }

  if (visual === "decisioning") {
    return (
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#172119,#060A08)]">
        <div className="absolute inset-x-12 bottom-14 flex h-48 items-end gap-4">
          {[42, 54, 49, 68, 78, 88].map((height, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-3">
              <span
                className="w-full rounded-t-[12px] border border-[#B7D8C3]/18 bg-[linear-gradient(180deg,rgba(183,216,195,0.42),rgba(13,122,67,0.2))]"
                style={{ height: `${height}%` }}
              />
              <span className="text-[10px] font-semibold text-white/38">W{index + 20}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual === "execution") {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_74%,rgba(29,155,98,0.18),transparent_38%),linear-gradient(145deg,#121B15,#050806)]">
        <div className="absolute left-12 top-12 h-[72%] w-px bg-gradient-to-b from-transparent via-[#B7D8C3]/38 to-transparent" />
        {["Retailer stock gate", "Rep route T023", "WhatsApp Hindi advisory", "Grower follow-up"].map((title, index) => (
          <div
            key={title}
            className="absolute left-20 right-10 rounded-[16px] border border-white/[0.08] bg-white/[0.045] px-4 py-3 backdrop-blur-xl"
            style={{ top: `${48 + index * 68}px` }}
          >
            <span className="text-[13px] font-semibold text-white/78">{title}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(183,216,195,0.14),transparent_36%),linear-gradient(145deg,#151E18,#050806)]">
      <div className="absolute inset-10 rounded-[20px] border border-white/[0.08] bg-white/[0.035] p-4 backdrop-blur-xl">
        <div className="grid h-full grid-cols-2 gap-4">
          {["Approval queue", "Audit trail", "Role access", "Live health"].map((label, index) => (
            <div key={label} className="rounded-[16px] border border-white/[0.08] bg-black/18 p-4">
              <div className="mb-5 h-8 w-8 rounded-full border border-[#B7D8C3]/20 bg-[#DDEADF]/10" />
              <p className="text-[12px] font-semibold text-white/72">{label}</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                <div className="h-full rounded-full bg-[#1F9D62]" style={{ width: `${68 + index * 7}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
