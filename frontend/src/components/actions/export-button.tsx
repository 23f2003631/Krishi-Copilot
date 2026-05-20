"use client";

import { useState, useTransition, useEffect } from "react";
import { Download } from "lucide-react";
import { exportPlan, resolveDownloadUrl } from "@/services/api";
import { Button } from "@/components/ui/button";

export function ExportButton({ label, planId, type }: { label: string; planId: string; type: "csv" | "rep_brief" | "whatsapp_pack" }) {
  const [isPending, startTransition] = useTransition();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Clear stale export state when switching context

  useEffect(() => {
    setDownloadUrl(null);
  }, [planId, type]);

  function handleExport() {
    startTransition(async () => {
      const response = await exportPlan(planId, type);
      const resolvedUrl = resolveDownloadUrl(response.download_url);
      setDownloadUrl(resolvedUrl);
      localStorage.setItem(`syngenta_export_${type}`, resolvedUrl);
      const link = document.createElement("a");
      link.href = resolvedUrl;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => setDownloadUrl(null), 4000);
    });
  }

  return (
    <Button variant={type === "csv" ? "secondary" : "default"} onClick={handleExport} disabled={isPending}>
      <Download className="h-4 w-4" />
      {isPending ? "Preparing..." : downloadUrl ? "Export Ready" : label}
    </Button>
  );
}
