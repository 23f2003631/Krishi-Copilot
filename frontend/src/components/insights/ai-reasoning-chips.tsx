import { Badge } from "@/components/ui/badge";

export function AIReasoningChips({ reasons }: { reasons: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {reasons.map((reason) => (
        <Badge key={reason} variant="soft">
          {reason}
        </Badge>
      ))}
    </div>
  );
}

