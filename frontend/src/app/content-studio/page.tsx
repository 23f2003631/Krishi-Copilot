import Link from "next/link";
import { FileCheck2, Languages, MessageSquareText, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ContentPreviewCard } from "@/components/cards/content-preview-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { KpiStatCard } from "@/components/cards/kpi-stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateContent, fetchRecommendations } from "@/services/api";

export default async function ContentStudioPage() {
  const [content, recommendations] = await Promise.all([generateContent(), fetchRecommendations()]);
  const selected = recommendations.recommendations[0];

  return (
    <DashboardShell activePath="/content-studio">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-muted">Advisory Studio</p>
            <h1 className="mt-1 text-[22px] font-semibold leading-7 text-foreground">Human-reviewed multilingual field advisory pack</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              AI drafts short, low-literacy-friendly advisory content inside approved crop, product, stage, and agronomy guardrails.
            </p>
          </div>
          <Button asChild>
            <Link href="/field-actions?plan_id=PLAN_001">Send to Field Plan</Link>
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <KpiStatCard label="Advisory Formats" value="5" trend="WhatsApp, SMS, IVR, rep, visual" metadata="field pack" icon={MessageSquareText} tone="ai" />
          <KpiStatCard label="Grower Languages" value="2" trend="Hindi + English" metadata="local review" icon={Languages} tone="field" />
          <KpiStatCard label="Claim Risk Flags" value="0" trend="no dosage or yield claims" metadata="guardrail pass" icon={ShieldCheck} tone="success" />
          <KpiStatCard label="Agronomy Review" value="Pending" trend="human approval" metadata="required" icon={FileCheck2} tone="warning" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
          <DashboardCard>
            <SectionHeader icon={ShieldCheck} title="Agronomy Approval Gates" description="Content remains advisory until human review is complete." />
            <div className="mt-5 space-y-3">
              <Guardrail label="Crop authorization" value={selected.crop} />
              <Guardrail label="Product authorization" value={selected.product} />
              <Guardrail label="Crop-stage context" value="flowering" />
              <Guardrail label="Blocked claims" value="dosage, yield guarantee, cure promise" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="soft">CTA required</Badge>
              <Badge variant="soft">Human review required</Badge>
              <Badge variant="soft">Low-literacy tone</Badge>
            </div>
          </DashboardCard>

          <DashboardCard>
            <SectionHeader icon={MessageSquareText} title="Field Advisory Variants" description="Cached outputs use the same schema as the future LLM service." />
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {content.variants.map((variant) => (
                <ContentPreviewCard key={variant.content_id} variant={variant} />
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </DashboardShell>
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
