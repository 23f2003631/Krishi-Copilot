import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      borderRadius: {
        panel: "24px",
        control: "14px",
        shell: "32px"
      },
      spacing: {
        card: "20px",
        shell: "32px"
      },
      boxShadow: {
        soft: "0 16px 48px rgba(31, 56, 88, 0.08)",
        panel: "0 24px 80px rgba(31, 56, 88, 0.12)",
        active: "0 12px 32px rgba(31, 107, 255, 0.22)"
      }
    }
  }
};

export default config;

