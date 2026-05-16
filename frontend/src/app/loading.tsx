import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] rounded-[32px] bg-shell p-8 shell-shadow">
        <Skeleton className="h-[720px] w-full rounded-[24px]" />
      </div>
    </main>
  );
}

