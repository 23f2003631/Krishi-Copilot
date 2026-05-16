import { CheckCircle2, FileText, Mic, MessageCircle, Palette, Smartphone } from "lucide-react";
import type { ContentVariant } from "@/types/contracts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const icons = {
  whatsapp: MessageCircle,
  sms: Smartphone,
  ivr: Mic,
  rep_script: FileText,
  visual_concept: Palette
};

export function ContentPreviewCard({ variant }: { variant: ContentVariant }) {
  const Icon = icons[variant.format];

  return (
    <article className="rounded-[22px] border border-border bg-card-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ai/10 text-ai">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold capitalize text-foreground">{variant.format.replace("_", " ")}</h3>
            <p className="text-xs text-muted">{variant.language}</p>
          </div>
        </div>
        <Badge variant="warning">{variant.approval_state.replace("_", " ")}</Badge>
      </div>
      <p className="mt-4 min-h-[112px] rounded-[18px] border border-border bg-white p-4 text-sm leading-6 text-foreground">{variant.text}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant={variant.safety_flags.length ? "danger" : "success"}>{variant.safety_flags.length ? "Safety review" : "No safety flags"}</Badge>
          {variant.estimated_read_time_sec ? <Badge variant="soft">{variant.estimated_read_time_sec}s read</Badge> : null}
        </div>
        <Button variant="secondary" size="sm">
          <CheckCircle2 className="h-4 w-4" />
          Approve
        </Button>
      </div>
    </article>
  );
}

