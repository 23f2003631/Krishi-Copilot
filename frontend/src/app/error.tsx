"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-8">
      <section className="max-w-md rounded-[24px] border border-border bg-card p-8 text-center card-shadow">
        <p className="text-sm font-medium text-muted">Control room paused</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Something interrupted the dashboard.</h1>
        <p className="mt-3 text-sm leading-6 text-muted">The demo cache is still available, so retrying should restore the working view.</p>
        <Button className="mt-6" onClick={reset}>
          Retry
        </Button>
      </section>
    </main>
  );
}

