import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Hydrava brand palette
        navy: {
          900: "#0a0f1e",
          800: "#0d1528",
          700: "#111e38",
          600: "#162447",
          500: "#1a2d56",
        },
        hydrava: {
          blue: "#3b82f6",
          cyan: "#06b6d4",
          teal: "#14b8a6",
        },
        status: {
          normal: "#22c55e",
          "normal-bg": "#052e16",
          low: "#f59e0b",
          "low-bg": "#292524",
          critical: "#ef4444",
          "critical-bg": "#2d0707",
          offline: "#6b7280",
          "offline-bg": "#111827",
          overflow: "#a855f7",
          "overflow-bg": "#1e0a2a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
