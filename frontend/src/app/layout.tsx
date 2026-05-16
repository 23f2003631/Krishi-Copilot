import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Syngenta Krishi Campaign Copilot",
  description: "AI operations control room for crop-stage-aware campaign orchestration."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

