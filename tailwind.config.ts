import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        app: "var(--bg-app)",
        surface: "var(--bg-surface)",
        sunken: "var(--bg-sunken)",
        line: "var(--border)",
        "line-strong": "var(--border-strong)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-fg": "var(--accent-fg)",
        success: "var(--success)",
        "success-mid": "var(--success-mid)",
        "success-bg": "var(--success-bg)",
        "success-border": "var(--success-border)",
        warning: "var(--warning)",
        "warning-mid": "var(--warning-mid)",
        "warning-bg": "var(--warning-bg)",
        "warning-border": "var(--warning-border)",
        danger: "var(--danger)",
        "danger-mid": "var(--danger-mid)",
        "danger-bg": "var(--danger-bg)",
        "danger-border": "var(--danger-border)",
        info: "var(--info)",
        "info-mid": "var(--info-mid)",
        "info-bg": "var(--info-bg)",
        "info-border": "var(--info-border)",
        n: {
          0: "var(--n-0)",
          50: "var(--n-50)",
          100: "var(--n-100)",
          200: "var(--n-200)",
          300: "var(--n-300)",
          400: "var(--n-400)",
          500: "var(--n-500)",
          600: "var(--n-600)",
          700: "var(--n-700)",
          800: "var(--n-800)",
          900: "var(--n-900)",
          950: "var(--n-950)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.55" }],
        sm: ["0.8125rem", { lineHeight: "1.55" }],
        base: ["0.9375rem", { lineHeight: "1.55" }],
        lg: ["1.125rem", { lineHeight: "1.35" }],
        xl: ["1.375rem", { lineHeight: "1.35" }],
        "2xl": ["1.75rem", { lineHeight: "1.15" }],
        "3xl": ["2.5rem", { lineHeight: "1.15" }],
      },
      letterSpacing: {
        label: "0.06em",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
      },
      boxShadow: {
        // Point at the CSS-var tokens so utilities follow globals.css and
        // adapt to dark mode (see the [data-theme="dark"] block).
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        panel: "var(--shadow-panel)",
      },
      spacing: {
        sidebar: "248px",
        topbar: "60px",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
