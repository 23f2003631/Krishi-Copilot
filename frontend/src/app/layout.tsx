import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { RoleProvider } from "@/lib/contexts/RoleContext";
import { WorkflowProvider } from "@/lib/providers/workflow-context";

export const metadata: Metadata = {
  title: "Syngenta Krishi Campaign Copilot",
  description: "AI operations control room for crop-stage-aware campaign orchestration."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="antialiased">
        <RoleProvider>
          <WorkflowProvider>
            {children}
          </WorkflowProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
