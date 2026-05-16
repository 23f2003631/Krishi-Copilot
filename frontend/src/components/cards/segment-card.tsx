export function SegmentCard({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="rounded-[18px] border border-border bg-card-soft px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="text-lg font-semibold text-foreground">{value}</p>
      </div>
      <p className="mt-1 text-xs leading-5 text-muted">{caption}</p>
    </div>
  );
}

