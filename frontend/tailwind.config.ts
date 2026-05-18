import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // ═══════════════════════════════════════════════
        // MASTER COLOR SYSTEM - Muted Premium Operational Green
        // ═══════════════════════════════════════════════
        primary: "#0D7A43",
        "primary-light": "#1F9D62",
        "primary-muted": "#B7D8C3",
        "primary-surface": "#DDEADF",
        "primary-deep": "#0B5B34",
        "sage-accent": "#B7D8C3",

        // Dark Cinematic Surfaces
        "dark-surface": "#060A08",
        "dark-mid": "#0B120E",
        "dark-elevated": "#111A14",

        // Light Operational Surfaces
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        card: "var(--color-card)",
        "card-soft": "var(--color-card-soft)",
        shell: "var(--color-shell)",
        "soft-white": "#F7F9F8",

        // Typography
        "muted-text": "#64748B",
        "dark-muted-text": "#94A3B8",

        // Semantic Feature Accents
        ai: "var(--color-ai)",
        field: "var(--color-field)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        cyan: "var(--color-cyan)",
      },
      borderRadius: {
        panel: "24px",
        card: "16px",
        control: "12px",
        shell: "32px",
      },
      spacing: {
        shell: "32px",
        card: "20px",
      },
      boxShadow: {
        // Explicit Surface Elevation System
        "level-1": "0 1px 3px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.03)",
        "level-2": "0 2px 6px rgba(0,0,0,0.04), 0 8px 30px rgba(0,0,0,0.05)",
        "level-3": "0 4px 12px rgba(0,0,0,0.06), 0 20px 60px rgba(0,0,0,0.08)",
        "level-4": "0 8px 24px rgba(0,0,0,0.12), 0 40px 120px rgba(0,0,0,0.4)",

        // Cinematic Hero Shadows (multi-layer)
        "hero-glass": "0 8px 16px rgba(0,0,0,0.3), 0 32px 64px rgba(0,0,0,0.4), 0 80px 160px rgba(0,0,0,0.5)",

        // Atmospheric glows
        "glow-subtle": "0 0 20px rgba(29,155,98,0.12)",
        "glow-medium": "0 0 32px rgba(29,155,98,0.16)",
        "glow-strong": "0 0 48px rgba(29,155,98,0.2)",
        "glow-atmospheric": "0 0 120px rgba(29,155,98,0.12)",
      },
      backgroundImage: {
        "glow-radial": "radial-gradient(circle at center, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "pulse-subtle": "pulse-subtle 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
    },
  },
};

export default config;
