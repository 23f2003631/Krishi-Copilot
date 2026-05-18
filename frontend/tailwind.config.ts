import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Master Color System
        primary: "#9AFB35",
        "secondary-emerald": "#35ECA4",
        "deep-emerald": "#064E3B",
        
        // Dark Surfaces
        "dark-surface": "#020604",
        "secondary-dark": "#07110C",
        "muted-dark": "#0D1B14",
        
        // Light Surfaces
        "soft-white": "#F7F8F7",
        
        // Typography
        "muted-text": "#6B756F",
        
        // Semantic (matching old usage where necessary but adapted to new system)
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        card: "var(--color-card)",
        "card-soft": "var(--color-card-soft)",
        shell: "var(--color-shell)",
        
        // Feature accents
        ai: "var(--color-ai)",
        field: "var(--color-field)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
      },
      borderRadius: {
        panel: "24px",
        card: "20px",
        control: "14px",
        shell: "32px",
      },
      spacing: {
        // Enforcing strict spacing tokens indirectly by ensuring they exist
        // 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96, 128
        // Tailwind defaults cover: 1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px, 8=32px, 10=40px, 12=48px, 16=64px, 24=96px, 32=128px
        shell: "32px",
        card: "20px",
      },
      boxShadow: {
        // Surface Elevation Hierarchy
        "level-1": "0 8px 32px rgba(15, 23, 42, 0.04)", // Shell
        "level-2": "0 16px 40px rgba(15, 23, 42, 0.06)", // Cards
        "level-3": "0 24px 80px rgba(0, 0, 0, 0.45)",    // Overlays / Popovers / Landing Glass
        "level-4": "0 0 32px rgba(154, 251, 53, 0.35)",  // Active Focus Glow
        
        // Legacy mappings mapped to new levels for safety
        soft: "0 16px 40px rgba(15, 23, 42, 0.06)",
        panel: "0 24px 80px rgba(0, 0, 0, 0.45)",
        active: "0 0 32px rgba(154, 251, 53, 0.35)",
      },
      backgroundImage: {
        'glow-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      }
    }
  }
};

export default config;
