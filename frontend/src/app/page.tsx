"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Activity, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { PlannerClient } from "@/components/dashboard/planner-client";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Sidebar } from "@/components/layout/sidebar";

export default function LandingPage() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [0, 1]);
  const y = useTransform(scrollY, [0, 300], [0, -50]);

  return (
    <div className="min-h-screen bg-dark-surface text-soft-white selection:bg-primary/30 relative overflow-hidden">
      {/* Background Glow Engine */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-secondary-emerald/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      {/* Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Navbar System */}
      <motion.nav 
        className="fixed top-0 inset-x-0 z-50 h-[72px] flex items-center px-6 lg:px-8 transition-colors duration-300 border-b border-white/5"
        style={{ 
          backgroundColor: useTransform(scrollY, [0, 50], ["rgba(2, 6, 4, 0)", "rgba(2, 6, 4, 0.72)"]),
          backdropFilter: useTransform(scrollY, [0, 50], ["blur(0px)", "blur(12px)"])
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary-emerald text-dark-surface font-bold text-sm">
            S
          </div>
          <span className="font-semibold tracking-tight text-soft-white">Syngenta</span>
        </div>
        
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm font-medium text-muted-text">
          <a href="#" className="hover:text-soft-white transition-colors">Platform</a>
          <a href="#" className="hover:text-soft-white transition-colors">Solutions</a>
          <a href="#" className="hover:text-soft-white transition-colors">Enterprise</a>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <Link href="/planner" className="text-sm font-medium text-muted-text hover:text-soft-white transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link href="/planner" className="inline-flex h-9 items-center justify-center rounded-full bg-white px-4 text-sm font-medium text-dark-surface transition-colors hover:bg-soft-white">
            Enter Copilot <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </motion.nav>

      <main className="relative pt-[140px] pb-32">
        {/* Hero Section */}
        <section className="px-6 lg:px-8 max-w-[1200px] mx-auto text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary tracking-wide">Krishi Operations Platform</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[56px] md:text-[72px] font-bold leading-[1.05] tracking-tight max-w-[800px] text-soft-white"
          >
            Orchestrate campaigns with <span className="text-primary">agricultural intelligence.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-lg text-muted-text max-w-[600px] leading-relaxed"
          >
            An enterprise-grade operating system for campaign teams, territory managers, and field representatives to drive field execution.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10"
          >
            <Link 
              href="/planner" 
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-[15px] font-semibold text-dark-surface shadow-[0_0_32px_rgba(154,251,53,0.25)] transition-all hover:shadow-[0_0_48px_rgba(154,251,53,0.4)] hover:bg-[#a5ff3d]"
            >
              Start Operating
            </Link>
          </motion.div>
        </section>

        {/* Floating Dashboard Reveal */}
        <section className="relative mt-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto perspective-[2000px]">
          <motion.div
            initial={{ opacity: 0, rotateX: 15, y: 100 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ y }}
            className="glass-panel overflow-hidden rounded-[32px] p-2 ring-1 ring-white/10 relative z-10"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            
            {/* Embedded Real Dashboard (Pointer Events None to keep it purely visual) */}
            <div className="pointer-events-none h-[700px] overflow-hidden rounded-[24px] bg-shell shadow-[0_8px_32px_rgba(15,23,42,0.04)] relative">
              <div className="grid h-full grid-cols-[248px_1fr]">
                <div className="bg-white border-r border-border/50 hidden md:block">
                  <Sidebar activePath="/planner" />
                </div>
                <div className="p-6 bg-shell flex flex-col overflow-hidden">
                  <DashboardHeader />
                  <div className="mt-6 flex-1 overflow-hidden opacity-90 scale-[0.98] origin-top">
                    <PlannerClient />
                  </div>
                </div>
              </div>
              
              {/* Overlay Gradient to fade out the bottom of the mockup */}
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-shell to-transparent" />
            </div>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section className="mt-32 px-6 lg:px-8 max-w-[1200px] mx-auto">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Activity,
                title: "Live Operational Intelligence",
                description: "Monitor real-time territory execution, stock risks, and localized weather triggers."
              },
              {
                icon: Zap,
                title: "Predictive Next-Best-Action",
                description: "AI engine computes prioritized actions based on campaign stage and field blockers."
              },
              {
                icon: Shield,
                title: "Role-Aware Governance",
                description: "Tailored control interfaces for Campaign Managers, Territory Managers, and Field Reps."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[20px] border border-white/5 bg-[#07110C] p-8 shadow-[0_16px_40px_rgba(0,0,0,0.2)] transition-colors hover:bg-[#0A1610]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-deep-emerald/30 text-secondary-emerald mb-6">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-soft-white tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-text leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
