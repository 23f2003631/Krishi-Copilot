import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/lib/contexts/RoleContext";
import { WorkflowProvider } from "@/lib/providers/workflow-context";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Syngenta Krishi Campaign Copilot",
  description: "AI operations control room for crop-stage-aware campaign orchestration."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${playfair.variable}`} data-scroll-behavior="smooth">
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
