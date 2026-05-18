"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Globe2,
  Linkedin,
  LockKeyhole,
  RadioTower,
  ShieldCheck,
  Sprout,
  Twitter,
  UsersRound,
} from "lucide-react";
import { PlannerClient } from "@/components/dashboard/planner-client";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Sidebar } from "@/components/layout/sidebar";

const MOCK_DASHBOARD_DATA = {
  workflowState: {
    workflow_id: "",
    alerts: [],
    events: [],
    next_action: {
      action: "Review agronomic intelligence",
      reason: "High predictive accuracy for the current crop stage",
      assigned_role: "Campaign Manager",
      priority: "high" as const,
    },
  },
  context: {
    context_id: "CTX_MOCK",
    crop_stage: { stage: "flowering", days_to_stage: 3, confidence: 0.82 },
    grower_summary: {
      estimated_growers: 1180,
      smartphone_share: 0.74,
      keypad_share: 0.18,
      primary_language: "Hindi",
    },
    weather_insights: [
      {
        risk_type: "humidity_rainfall",
        risk_level: "high",
        summary:
          "Humidity and light rainfall raise crop-stage disease advisory priority.",
        confidence: 0.76,
      },
    ],
    inventory_alerts: [
      {
        product: "Tilt 250 EC",
        stock_status: "healthy",
        stock_cover_days: 18,
        affected_retailers: 6,
      },
    ],
  },
  recommendations: {
    recommendations: [
      {
        id: "rec_1",
        segment_label: "Wheat Growers - Kanpur Nagar",
        product: "Tilt 250 EC",
        target_count: 1180,
        blocked: false,
        priority_score: 92,
        timing: { urgency: "high", send_window: "Feb 16 - Feb 18" },
        receptivity: {
          confidence: 0.92,
          preferred_channel: "WhatsApp",
          best_time: "Morning",
        },
        expected_impact: {
          expected_click_rate: 0.18,
          expected_conversion_rate: 0.08,
        },
        reason_codes: ["crop_stage_match", "weather_risk", "stock_available"],
        content: {
          channel: "WhatsApp",
          message_variant: "Visual + Audio Hindi",
          content_summary:
            "Visual guide showing early symptoms and prevention strategy.",
          reasoning:
            "Visual guides over WhatsApp perform better for pest alerts in UP.",
        },
      },
    ],
  },
  fieldActions: {
    actions: [
      {
        action_id: "ACT_001",
        rep_id: "R-102",
        territory_id: "T-KAN",
        action_type: "retailer_visit",
        summary: "Check retailer stock, confirm field window, and brief grower cluster.",
        due_date: "2026-02-18",
        priority: "high",
      },
      {
        action_id: "ACT_002",
        rep_id: "R-214",
        territory_id: "T-SIK",
        action_type: "grower_followup",
        summary: "Follow up with non-opener villages after morning WhatsApp advisory.",
        due_date: "2026-02-19",
        priority: "medium",
      },
      {
        action_id: "ACT_003",
        rep_id: "R-088",
        territory_id: "T-BHT",
        action_type: "stock_gate",
        summary: "Resolve low-stock branch before bollworm advisory deployment.",
        due_date: "2026-02-20",
        priority: "medium",
      },
    ],
  },
  analytics: {
    charts: {
      weekly_funnel: [
        { week: "W20", baseline: 34, recommended: 42 },
        { week: "W21", baseline: 38, recommended: 49 },
        { week: "W22", baseline: 36, recommended: 53 },
        { week: "W23", baseline: 41, recommended: 58 },
        { week: "W24", baseline: 43, recommended: 64 },
      ],
    },
  },
  scenarios: [
    {
      scenario_id: "SCEN_001",
      name: "Wheat Flowering Protection",
      description: "Immediate disease advisory due to high humidity.",
      risk_level: "high",
      stock_status: "healthy",
      geography: { district: "Kanpur Nagar", state: "UP" },
    },
    {
      scenario_id: "SCEN_002",
      name: "Cotton Bollworm Pre-alert",
      description: "Preventative advisory in high-pest density blocks.",
      risk_level: "medium",
      stock_status: "low",
      geography: { district: "Bhatinda", state: "Punjab" },
    },
  ],
};

const STORY_SECTIONS = [
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

const FOOTER_LINKS = [
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

function StoryVisual({ visual }: { visual: (typeof STORY_SECTIONS)[number]["visual"] }) {
  if (visual === "authority") {
    return (
      <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_38%_34%,rgba(183,216,195,0.16),transparent_34%),linear-gradient(145deg,#17211A,#07100B_62%)]">
        <div className="absolute inset-10 grid grid-cols-8 gap-1.5 opacity-72">
          {Array.from({ length: 56 }).map((_, index) => (
            <span
              key={index}
              className={`rounded-[5px] border border-white/[0.035] ${
                index % 7 === 0
                  ? "bg-[#B7D8C3]/28"
                  : index % 5 === 0
                    ? "bg-[#0D7A43]/34"
                    : "bg-white/[0.055]"
              }`}
            />
          ))}
        </div>
        <div className="absolute left-12 top-14 rounded-full border border-white/10 bg-black/24 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#B7D8C3]">
          UP East live
        </div>
        <div className="absolute right-10 top-20 h-24 w-24 rounded-full border border-[#B7D8C3]/24 bg-[#DDEADF]/8" />
      </div>
    );
  }

  if (visual === "intelligence") {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(29,155,98,0.18),transparent_34%),linear-gradient(145deg,#111A14,#050907)]">
        <div className="absolute inset-x-12 top-16 flex items-center justify-between">
          {["Crop", "Weather", "Stock", "Reach"].map((label, index) => (
            <div key={label} className="flex flex-col items-center gap-3">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#B7D8C3]/20 bg-white/[0.045] text-[11px] font-semibold text-white/72">
                {label}
              </span>
              {index < 3 ? <span className="h-px w-16 bg-gradient-to-r from-[#B7D8C3]/35 to-transparent" /> : null}
            </div>
          ))}
        </div>
        <div className="absolute bottom-12 left-12 right-12 rounded-[18px] border border-white/[0.08] bg-black/22 p-4 backdrop-blur-xl">
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
        <div className="absolute inset-x-12 bottom-16 flex h-52 items-end gap-4">
          {[42, 54, 49, 68, 78, 88].map((height, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-3">
              <span
                className="w-full rounded-t-[14px] border border-[#B7D8C3]/18 bg-[linear-gradient(180deg,rgba(183,216,195,0.42),rgba(13,122,67,0.2))]"
                style={{ height: `${height}%` }}
              />
              <span className="text-[10px] font-semibold text-white/38">W{index + 20}</span>
            </div>
          ))}
        </div>
        <div className="absolute left-12 top-12 rounded-[18px] border border-white/[0.08] bg-white/[0.045] px-4 py-3 backdrop-blur-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/44">Forecast lift</p>
          <p className="mt-1 text-3xl font-semibold text-white">+18%</p>
        </div>
      </div>
    );
  }

  if (visual === "execution") {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_74%,rgba(29,155,98,0.18),transparent_38%),linear-gradient(145deg,#121B15,#050806)]">
        <div className="absolute left-14 top-14 h-[72%] w-px bg-gradient-to-b from-transparent via-[#B7D8C3]/38 to-transparent" />
        {[
          ["Retailer stock gate", "Ready"],
          ["Rep route T023", "Assigned"],
          ["WhatsApp Hindi advisory", "Queued"],
          ["Grower follow-up", "48h"],
        ].map(([title, status], index) => (
          <div
            key={title}
            className="absolute left-24 right-12 rounded-[18px] border border-white/[0.08] bg-white/[0.045] px-4 py-3 backdrop-blur-xl"
            style={{ top: `${52 + index * 74}px` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-white/78">{title}</span>
              <span className="rounded-full border border-[#B7D8C3]/18 bg-[#DDEADF]/10 px-2 py-1 text-[10px] font-semibold text-[#B7D8C3]">
                {status}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(183,216,195,0.14),transparent_36%),linear-gradient(145deg,#151E18,#050806)]">
      <div className="absolute inset-12 rounded-[24px] border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl">
        <div className="grid h-full grid-cols-2 gap-4">
          {["Approval queue", "Audit trail", "Role access", "Live health"].map((label, index) => (
            <div key={label} className="rounded-[18px] border border-white/[0.08] bg-black/18 p-4">
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

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const dashboardSceneRef = useRef<HTMLDivElement>(null);
  const dashboardFrameRef = useRef<HTMLDivElement>(null);
  const dashboardUiRef = useRef<HTMLDivElement>(null);
  const dashboardGlowRef = useRef<HTMLDivElement>(null);
  const dashboardShadowRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDesktop = window.matchMedia("(min-width: 900px)").matches;
    const hero = heroRef.current;
    const scene = dashboardSceneRef.current;
    const frame = dashboardFrameRef.current;
    const ui = dashboardUiRef.current;
    const glow = dashboardGlowRef.current;
    const shadow = dashboardShadowRef.current;

    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const context = gsap.context(() => {
      const heroTimeline = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      heroTimeline
        .fromTo(
          ".hero-kicker",
          { opacity: 0, y: 18, filter: "blur(10px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8 }
        )
        .fromTo(
          ".hero-title-line",
          { opacity: 0, y: 42, filter: "blur(14px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.05,
            stagger: 0.12,
          },
          "-=0.45"
        )
        .fromTo(
          ".hero-copy, .hero-cta",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.75, stagger: 0.12 },
          "-=0.45"
        )
        .fromTo(
          ".hero-light",
          { opacity: 0, scale: 0.86 },
          { opacity: 1, scale: 1, duration: 1.3, ease: "sine.out" },
          "-=0.75"
        )
        .fromTo(
          ".hero-dashboard-scene",
          { opacity: 0, y: 72, rotateX: 8, scale: 0.94, filter: "blur(10px)" },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.35,
            ease: "power3.out",
          },
          "-=0.55"
        );

      gsap.utils.toArray<HTMLElement>(".story-section").forEach((section, index) => {
        const media = section.querySelector(".story-media");
        const copy = section.querySelector(".story-copy");
        const accent = section.querySelector(".story-accent");
        const direction = index % 2 === 0 ? -38 : 38;

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
          },
          defaults: { ease: "power3.out" },
        });

        timeline
          .fromTo(
            media,
            { opacity: 0, x: direction, scale: 0.965, filter: "blur(12px)" },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 1.05,
            }
          )
          .fromTo(
            copy,
            { opacity: 0, x: direction * -0.55, y: 20 },
            { opacity: 1, x: 0, y: 0, duration: 0.9 },
            "-=0.62"
          )
          .fromTo(
            accent,
            { opacity: 0, scale: 0.92 },
            { opacity: 1, scale: 1, duration: 0.7 },
            "-=0.5"
          );
      });

      gsap.fromTo(
        ".final-cta",
        { opacity: 0, y: 44, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".final-cta",
            start: "top 76%",
          },
        }
      );
    }, heroRef);

    let removePointerListeners: (() => void) | undefined;

    if (!reduceMotion && isDesktop && hero && scene && frame && ui && glow && shadow) {
      const rotateXTo = gsap.quickTo(frame, "rotationX", { duration: 1.2, ease: "power3.out" });
      const rotateYTo = gsap.quickTo(frame, "rotationY", { duration: 1.2, ease: "power3.out" });
      const frameXTo = gsap.quickTo(frame, "x", { duration: 1.3, ease: "power3.out" });
      const uiXTo = gsap.quickTo(ui, "x", { duration: 1.1, ease: "power3.out" });
      const uiYTo = gsap.quickTo(ui, "y", { duration: 1.1, ease: "power3.out" });
      const glowXTo = gsap.quickTo(glow, "x", { duration: 1.6, ease: "power3.out" });
      const glowYTo = gsap.quickTo(glow, "y", { duration: 1.6, ease: "power3.out" });
      const shadowXTo = gsap.quickTo(shadow, "x", { duration: 1.7, ease: "power3.out" });
      const shadowYTo = gsap.quickTo(shadow, "y", { duration: 1.7, ease: "power3.out" });

      const onPointerMove = (event: PointerEvent) => {
        const rect = scene.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        rotateXTo(y * -5);
        rotateYTo(x * 5);
        frameXTo(x * 8);
        uiXTo(x * 12);
        uiYTo(y * 9);
        glowXTo(x * -26);
        glowYTo(y * -18);
        shadowXTo(x * 18);
        shadowYTo(y * 10);
      };

      const onPointerLeave = () => {
        rotateXTo(0);
        rotateYTo(0);
        frameXTo(0);
        uiXTo(0);
        uiYTo(0);
        glowXTo(0);
        glowYTo(0);
        shadowXTo(0);
        shadowYTo(0);
      };

      scene.addEventListener("pointermove", onPointerMove);
      scene.addEventListener("pointerleave", onPointerLeave);
      removePointerListeners = () => {
        scene.removeEventListener("pointermove", onPointerMove);
        scene.removeEventListener("pointerleave", onPointerLeave);
      };
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      removePointerListeners?.();
      context.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div
      ref={heroRef}
      className="landing-canvas min-h-screen overflow-hidden bg-[#050806] text-white selection:bg-[#1F9D62]/30 selection:text-white"
    >
      <nav
        className={`fixed inset-x-0 top-0 z-50 flex h-[76px] items-center justify-between px-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:px-9 lg:px-12 ${
          scrolled
            ? "border-b border-white/[0.08] bg-[#06100B]/72 shadow-[0_18px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl"
            : "border-b border-white/[0.045] bg-[#050806]/18 backdrop-blur-md"
        }`}
      >
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-[#B7D8C3] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
            <Sprout className="h-4.5 w-4.5" />
          </span>
          <span className="text-[15px] font-semibold text-white md:text-[16px]">
            Syngenta Krishi Copilot
          </span>
        </Link>

        <div className="hidden items-center gap-7 rounded-full border border-white/[0.06] bg-white/[0.035] px-5 py-2 text-[12px] font-medium text-white/64 backdrop-blur-xl md:flex">
          <a className="text-[#B7D8C3]" href="#platform">
            Platform
          </a>
          <a className="transition-colors hover:text-white" href="#intelligence">
            Intelligence
          </a>
          <a className="transition-colors hover:text-white" href="#governance">
            Governance
          </a>
        </div>

        <Link
          href="/planner"
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#0D7A43] px-4 text-[12px] font-semibold text-white shadow-[0_12px_30px_rgba(13,122,67,0.24),inset_0_1px_0_rgba(255,255,255,0.18)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#0B5B34] md:px-5"
        >
          Open Dashboard
        </Link>
      </nav>

      <main className="relative">
        <section className="relative min-h-[1120px] overflow-hidden px-5 pb-28 pt-36 md:min-h-[1220px] md:px-8 md:pb-36 md:pt-44">
          <div className="hero-light pointer-events-none absolute left-1/2 top-[11%] h-[520px] w-[840px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14),rgba(183,216,195,0.08)_28%,rgba(29,155,98,0.09)_42%,transparent_70%)] blur-2xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.055),transparent_34%),radial-gradient(circle_at_20%_42%,rgba(29,155,98,0.08),transparent_30%),radial-gradient(circle_at_80%_58%,rgba(183,216,195,0.055),transparent_34%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(183,216,195,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(183,216,195,0.22)_1px,transparent_1px)] [background-size:72px_72px]" />
          <div className="noise-overlay" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_48%,rgba(0,0,0,0.72)_100%)]" />

          <div className="relative z-10 mx-auto flex max-w-[1180px] flex-col items-center text-center">
            <div className="hero-kicker inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.045] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B7D8C3] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1F9D62] shadow-[0_0_16px_rgba(31,157,98,0.38)]" />
              Enterprise agricultural intelligence
            </div>

            <h1 className="mt-8 max-w-[990px] text-[54px] font-semibold leading-[0.98] text-white sm:text-[72px] md:text-[92px] lg:text-[108px]">
              <span className="hero-title-line block">Campaign intelligence</span>
              <span className="hero-title-line block text-white/88">grown from the field up.</span>
            </h1>

            <p className="hero-copy mt-8 max-w-[660px] text-[15px] font-medium leading-7 text-white/58 md:text-[17px]">
              Syngenta Krishi Copilot connects crop intelligence, weather signals,
              retailer readiness, and AI recommendations into one deployable
              operating view.
            </p>

            <div className="hero-cta mt-10 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/planner"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0D7A43] px-7 text-[14px] font-semibold text-white shadow-[0_18px_44px_rgba(13,122,67,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0B5B34]"
              >
                Explore the Platform
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#platform"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.035] px-6 text-[14px] font-semibold text-white/78 backdrop-blur-xl transition-all duration-300 hover:border-white/22 hover:bg-white/[0.07] hover:text-white"
              >
                View operating model
              </a>
            </div>

            <div
              ref={dashboardSceneRef}
              className="hero-dashboard-scene relative mt-24 w-full max-w-[1320px] perspective-[1500px] md:mt-28"
            >
              <div
                ref={dashboardGlowRef}
                className="pointer-events-none absolute left-1/2 top-1/2 h-[48%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(29,155,98,0.18),rgba(183,216,195,0.06)_45%,transparent_72%)] blur-[80px]"
              />
              <div
                ref={dashboardShadowRef}
                className="pointer-events-none absolute left-1/2 top-[78%] h-[220px] w-[72%] -translate-x-1/2 rounded-[50%] bg-black/80 blur-[70px]"
              />
              <div
                ref={dashboardFrameRef}
                className="cinematic-dashboard-frame transform-gpu rounded-[30px] border border-white/[0.12] bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04)_34%,rgba(8,18,12,0.6)_100%)] p-[1px] shadow-[0_34px_90px_rgba(0,0,0,0.62),0_110px_220px_rgba(0,0,0,0.54),0_0_120px_rgba(29,155,98,0.10)] will-change-transform"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="relative overflow-hidden rounded-[29px] bg-[#07100B] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-48px_90px_rgba(0,0,0,0.42)]">
                  <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_70%_70%,rgba(29,155,98,0.08),transparent_35%)]" />
                  <div
                    ref={dashboardUiRef}
                    className="relative h-[740px] overflow-hidden rounded-[22px] border border-black/[0.05] bg-[#EEF1EE] text-left shadow-[0_22px_60px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.9)] will-change-transform md:h-[760px]"
                    style={{ transform: "translateZ(42px)" }}
                  >
                    <div className="grid h-full grid-cols-1 md:grid-cols-[82px_1fr]">
                      <div className="hidden md:block">
                        <Sidebar activePath="/planner" />
                      </div>
                      <div className="relative flex min-w-0 flex-col overflow-hidden bg-[#EEF1EE] p-4 md:p-5">
                        <DashboardHeader />
                        <div className="mt-5 flex-1 overflow-hidden pointer-events-none">
                          <PlannerClient {...MOCK_DASHBOARD_DATA} />
                        </div>
                      </div>
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[230px] bg-gradient-to-t from-[#07100B] via-[#07100B]/52 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.18),transparent_28%,transparent_72%,rgba(255,255,255,0.07))] mix-blend-soft-light" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="platform"
          className="relative -mt-12 px-5 pb-28 md:px-8 md:pb-36"
        >
          <div className="section-bridge pointer-events-none absolute inset-x-0 -top-40 h-80 bg-[linear-gradient(to_bottom,transparent,rgba(5,8,6,0.92)_48%,rgba(5,8,6,0.98))]" />
          <div className="relative z-10 mx-auto max-w-[1180px]">
            <div className="mx-auto max-w-[720px] text-center">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#B7D8C3]/80">
                Operating narrative
              </p>
              <h2 className="mt-4 text-[38px] font-semibold leading-[1.03] text-white md:text-[58px]">
                Intelligence with visual tension, not visual noise.
              </h2>
              <p className="mt-5 text-[15px] leading-7 text-white/52 md:text-[16px]">
                Quiet atmospheric space frames dense operational systems so teams can
                understand what matters, where to act, and why the recommendation exists.
              </p>
            </div>

            <div className="mt-24 space-y-28 md:mt-32 md:space-y-36">
              {STORY_SECTIONS.map((section, index) => {
                const Icon = section.icon;
                const reverse = section.align === "right";
                return (
                  <article
                    id={index === 1 ? "intelligence" : index === 4 ? "governance" : undefined}
                    key={section.eyebrow}
                    className={`story-section relative grid items-center gap-10 md:grid-cols-[1.08fr_0.92fr] md:gap-16 ${
                      reverse ? "md:grid-cols-[0.92fr_1.08fr]" : ""
                    }`}
                  >
                    <div
                      className={`story-media relative ${reverse ? "md:order-2" : ""} ${
                        index === 2 ? "md:translate-y-10" : index === 3 ? "md:-translate-y-4" : ""
                      }`}
                    >
                      <div className="premium-story-card group relative overflow-hidden rounded-[26px] border border-white/[0.09] bg-white/[0.035] p-[1px] shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
                        <div className="relative aspect-[16/11] overflow-hidden rounded-[25px] bg-[#0A120E]">
                          <StoryVisual visual={section.visual} />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_16%,rgba(255,255,255,0.16),transparent_32%),linear-gradient(135deg,rgba(5,8,6,0.18),rgba(5,8,6,0.78))]" />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_74%,rgba(29,155,98,0.18),transparent_36%)]" />
                          <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/26 p-3 text-[#B7D8C3] backdrop-blur-xl">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="story-accent absolute bottom-5 left-5 right-5 flex items-end justify-between gap-5 rounded-[18px] border border-white/[0.08] bg-black/28 p-4 backdrop-blur-xl">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">
                                {section.metricLabel}
                              </p>
                              <p className="mt-1 text-[34px] font-semibold text-white">
                                {section.metric}
                              </p>
                            </div>
                            <span className="rounded-full border border-[#B7D8C3]/20 bg-[#DDEADF]/10 px-3 py-1.5 text-[11px] font-semibold text-[#B7D8C3]">
                              Verified signal
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`story-copy ${reverse ? "md:order-1" : ""}`}>
                      <div className="max-w-[520px]">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#B7D8C3]/76">
                          {section.eyebrow}
                        </p>
                        <h3 className="mt-5 text-[34px] font-semibold leading-[1.03] text-white md:text-[52px]">
                          {section.title}
                        </h3>
                        <p className="mt-6 text-[15px] leading-7 text-white/56 md:text-[16px]">
                          {section.description}
                        </p>
                        <div className="mt-8 grid max-w-[430px] grid-cols-2 gap-3">
                          {["Context aware", "Auditable", "Field ready", "Governed"].map((label) => (
                            <div
                              key={label}
                              className="rounded-[16px] border border-white/[0.075] bg-white/[0.035] px-4 py-3 text-[12px] font-semibold text-white/66 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                            >
                              <CheckCircle2 className="mb-2 h-4 w-4 text-[#B7D8C3]" />
                              {label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative px-5 pb-24 pt-8 md:px-8 md:pb-32">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_48%,rgba(29,155,98,0.12),transparent_48%)]" />
          <div className="final-cta relative z-10 mx-auto max-w-[980px] overflow-hidden rounded-[32px] border border-white/[0.1] bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025)_42%,rgba(29,155,98,0.055))] p-[1px] shadow-[0_34px_110px_rgba(0,0,0,0.46),0_0_110px_rgba(29,155,98,0.10)]">
            <div className="relative overflow-hidden rounded-[31px] px-6 py-16 text-center md:px-14 md:py-24">
              <div className="absolute left-1/2 top-0 h-[280px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14),rgba(183,216,195,0.09)_36%,transparent_70%)] blur-2xl" />
              <div className="noise-overlay" />
              <div className="relative z-10">
                <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#B7D8C3]/78">
                  Deployment ready
                </p>
                <h2 className="mx-auto mt-5 max-w-[720px] text-[40px] font-semibold leading-[1.02] text-white md:text-[66px]">
                  Turn field intelligence into coordinated action.
                </h2>
                <p className="mx-auto mt-6 max-w-[560px] text-[15px] leading-7 text-white/56 md:text-[16px]">
                  Give campaign, territory, retailer, and field teams one calm AI
                  operating layer for the next high-confidence window.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/planner"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0D7A43] px-7 text-[14px] font-semibold text-white shadow-[0_18px_44px_rgba(13,122,67,0.24),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0B5B34]"
                  >
                    Open Live Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="mailto:enterprise@syngenta.example"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-white/[0.13] bg-white/[0.035] px-7 text-[14px] font-semibold text-white/78 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.07] hover:text-white"
                  >
                    Contact enterprise team
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/[0.07] bg-[#030604] px-5 py-14 md:px-8 md:py-18">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(to_bottom,rgba(29,155,98,0.08),transparent)]" />
        <div className="relative mx-auto grid max-w-[1180px] gap-10 md:grid-cols-[1.3fr_2fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[#B7D8C3]">
                <Sprout className="h-5 w-5" />
              </span>
              <span className="text-[17px] font-semibold text-white">
                Syngenta Krishi Copilot
              </span>
            </div>
            <p className="mt-5 max-w-[350px] text-[13px] leading-6 text-white/48">
              Enterprise agricultural intelligence for campaign orchestration,
              retailer readiness, and field execution.
            </p>
            <div className="mt-7 flex items-center gap-3 text-white/42">
              <a className="rounded-full border border-white/[0.08] bg-white/[0.035] p-2 transition-colors hover:text-white" href="#">
                <Linkedin className="h-4 w-4" />
              </a>
              <a className="rounded-full border border-white/[0.08] bg-white/[0.035] p-2 transition-colors hover:text-white" href="#">
                <Twitter className="h-4 w-4" />
              </a>
              <a className="rounded-full border border-white/[0.08] bg-white/[0.035] p-2 transition-colors hover:text-white" href="#">
                <Globe2 className="h-4 w-4" />
              </a>
              <span className="ml-2 inline-flex items-center gap-2 text-[12px] font-medium text-white/42">
                <LockKeyhole className="h-3.5 w-3.5" />
                Enterprise grade
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {FOOTER_LINKS.map((group) => (
              <div key={group.title}>
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/82">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a className="text-[13px] text-white/42 transition-colors hover:text-white/76" href="#">
                        {link}
                      </a>
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
    </div>
  );
}
