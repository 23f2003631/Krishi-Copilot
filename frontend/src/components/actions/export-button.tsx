"use client";

import { useState, useTransition, useEffect } from "react";
import { Download } from "lucide-react";
import { exportPlan } from "@/services/api";
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
      setDownloadUrl(response.download_url);
      localStorage.setItem(`syngenta_export_${type}`, response.download_url);
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
