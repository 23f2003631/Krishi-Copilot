"use client";

import Link from "next/link";
import { useState } from "react";
import { FileCheck2, Languages, MessageSquareText, ShieldCheck, Target, AlertTriangle } from "lucide-react";
import { ContentPreviewCard } from "@/components/cards/content-preview-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { KpiStatCard } from "@/components/cards/kpi-stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/contexts/RoleContext";
import { OperationalAlertBanner } from "@/components/ui/operational-alert-banner";

export function ContentStudioClient({ content, recommendations }: any) {
  const { role } = useRole();
  const [variants, setVariants] = useState(content.variants || []);
  const selected = recommendations.recommendations[0] || {
    crop: "wheat",
    product: "Tilt 250 EC",
    timing: { send_window: "not scheduled" },
  };
  const languages = new Set(variants.map((variant: any) => variant.language));
  const formats = new Set(variants.map((variant: any) => variant.format));
  const safetyFlags = variants.reduce((count: number, variant: any) => count + (variant.safety_flags?.length || 0), 0);
  const pending = variants.filter((variant: any) => variant.approval_state === "pending_review").length;

  const renderKpis = () => {
    switch (role) {
      case "Campaign Manager":
        return (
          <>
            <KpiStatCard label="Advisory Formats" value={formats.size.toString()} trend={[...formats].join(", ")} metadata="field pack" icon={MessageSquareText} tone="ai" />
            <KpiStatCard label="Grower Languages" value={languages.size.toString()} trend={[...languages].join(" + ")} metadata="local review" icon={Languages} tone="field" />
            <KpiStatCard label="Claim Risk Flags" value={safetyFlags.toString()} trend={safetyFlags ? "review needed" : "no dosage or yield claims"} metadata="guardrail pass" icon={ShieldCheck} tone={safetyFlags ? "warning" : "success"} />
            <KpiStatCard label="Agronomy Review" value={pending ? "Pending" : "Approved"} trend={`${pending} pending`} metadata="required" icon={FileCheck2} tone={pending ? "warning" : "success"} />
          </>
        );
      case "Field Representative":
        return (
          <>
            <KpiStatCard label="Talking Points" value={variants.filter((variant: any) => variant.format === "rep_script").length.toString()} trend="generated from recommendation" metadata="field pack" icon={MessageSquareText} tone="ai" />
            <KpiStatCard label="Language Support" value={[...languages].join(", ") || "None"} trend="grower match" metadata="local dialect" icon={Languages} tone="field" />
            <KpiStatCard label="Compliance Status" value={safetyFlags ? "Review" : "Clean"} trend="safe template rules" metadata="guardrail pass" icon={ShieldCheck} tone={safetyFlags ? "warning" : "success"} />
            <KpiStatCard label="Priority Topic" value={selected.product} trend={selected.crop} metadata="current recommendation" icon={AlertTriangle} tone="warning" />
          </>
        );
      default:
        return (
          <div className="col-span-full rounded-xl border border-dashed p-8 text-center text-muted">
            Advisory Content Studio is not prioritized for your current role context.
          </div>
        );
    }
  };

  return (
    <div className="space-y-5">
      <OperationalAlertBanner />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-muted">Advisory Studio</p>
          <h1 className="mt-1 text-[22px] font-semibold leading-7 text-foreground">Human-reviewed multilingual field advisory pack</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            {role === "Campaign Manager" 
              ? "AI drafts short, low-literacy-friendly advisory content inside approved crop, product, stage, and agronomy guardrails." 
              : "Review recommended grower talking points and pre-approved digital outreach content."}
          </p>
        </div>
        
        {role === "Campaign Manager" && (
          <Button asChild>
            <Link href={`/field-actions?plan_id=${content.plan_id}`}>Approve & Send to Field</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {renderKpis()}
      </div>

      {(role === "Campaign Manager" || role === "Field Representative") && (
        <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
          <DashboardCard>
            <SectionHeader icon={ShieldCheck} title="Agronomy Approval Gates" description={role === "Campaign Manager" ? "Content remains advisory until human review is complete." : "Pre-approved constraints for field discussion."} />
            <div className="mt-5 space-y-3">
              <Guardrail label="Crop authorization" value={selected.crop} />
              <Guardrail label="Product authorization" value={selected.product} />
              <Guardrail label="Crop-stage context" value={selected.timing?.send_window ?? "current window"} />
              <Guardrail label="Blocked claims" value="dosage, yield guarantee, cure promise" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="soft">CTA required</Badge>
              <Badge variant="soft">{role === "Campaign Manager" ? "Human review required" : "Pre-approved"}</Badge>
              <Badge variant="soft">Low-literacy tone</Badge>
            </div>
          </DashboardCard>

          <DashboardCard>
            <SectionHeader icon={MessageSquareText} title={role === "Campaign Manager" ? "Field Advisory Variants" : "Approved Talking Points"} description="Generated outputs using the AI service." />
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {variants.map((variant: any) => (
                <ContentPreviewCard
                  key={variant.content_id}
                  variant={variant}
                  onApproved={(updated) => {
                    setVariants((current: any[]) =>
                      current.map((item) =>
                        item.content_id === updated.content_id ? { ...item, approval_state: updated.approval_state } : item
                      )
                    );
                  }}
                />
              ))}
            </div>
          </DashboardCard>
        </div>
      )}
    </div>
  );
}

function Guardrail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-border bg-card-soft px-4 py-3">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize text-foreground">{value}</p>
    </div>
  );
}
