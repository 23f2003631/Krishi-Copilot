import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Syngenta Krishi Campaign Copilot",
  description: "AI operations control room for crop-stage-aware campaign orchestration."
};
import { RoleProvider } from "@/lib/contexts/RoleContext";
import { WorkflowProvider } from "@/lib/providers/workflow-context";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <RoleProvider>
          <WorkflowProvider>
            {children}
          </WorkflowProvider>
        </RoleProvider>
      </body>
    </html>
  );
}

