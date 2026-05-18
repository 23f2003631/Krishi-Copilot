"use client";

import Link from "next/link";
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
  const selected = recommendations.recommendations[0];

  const renderKpis = () => {
    switch (role) {
      case "Campaign Manager":
        return (
          <>
            <KpiStatCard label="Advisory Formats" value="5" trend="WhatsApp, SMS, IVR, rep, visual" metadata="field pack" icon={MessageSquareText} tone="ai" />
            <KpiStatCard label="Grower Languages" value="2" trend="Hindi + English" metadata="local review" icon={Languages} tone="field" />
            <KpiStatCard label="Claim Risk Flags" value="0" trend="no dosage or yield claims" metadata="guardrail pass" icon={ShieldCheck} tone="success" />
            <KpiStatCard label="Agronomy Review" value="Pending" trend="human approval" metadata="required" icon={FileCheck2} tone="warning" />
          </>
        );
      case "Field Representative":
        return (
          <>
            <KpiStatCard label="Talking Points" value="3" trend="ready for use" metadata="field pack" icon={MessageSquareText} tone="ai" />
            <KpiStatCard label="Language Support" value="Hindi" trend="grower match" metadata="local dialect" icon={Languages} tone="field" />
            <KpiStatCard label="Compliance Status" value="Approved" trend="safe to share" metadata="guardrail pass" icon={ShieldCheck} tone="success" />
            <KpiStatCard label="Priority Topic" value="Fungicide" trend="disease risk" metadata="urgent" icon={AlertTriangle} tone="warning" />
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
            <Link href="/field-actions?plan_id=PLAN_001">Approve & Send to Field</Link>
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
              <Guardrail label="Crop-stage context" value="flowering" />
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
              {content.variants.map((variant: any) => (
                <ContentPreviewCard key={variant.content_id} variant={variant} />
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
