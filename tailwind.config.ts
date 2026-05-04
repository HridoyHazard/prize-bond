import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    borderRadius: {
      none: "0",
      sm:   "6px",
      md:   "10px",
      lg:   "14px",
      xl:   "18px",
      full: "9999px",
    },
    fontSize: {
      xs:   ["clamp(0.75rem,   0.72rem + 0.15vw, 0.8125rem)",  { lineHeight: "1.5"  }],
      sm:   ["clamp(0.8125rem, 0.78rem + 0.2vw,  0.9375rem)",  { lineHeight: "1.6"  }],
      base: ["clamp(0.9375rem, 0.9rem  + 0.2vw,  1rem)",       { lineHeight: "1.6"  }],
      lg:   ["clamp(1.125rem,  1rem    + 0.5vw,  1.375rem)",   { lineHeight: "1.35" }],
      xl:   ["clamp(1.375rem,  1.1rem  + 1.1vw,  1.875rem)",   { lineHeight: "1.2"  }],
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-geist)",      "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        bg:      "#0a0a0c",
        surface: {
          DEFAULT: "#111116",
          2:       "#17171f",
          3:       "#1e1e28",
        },
        divide: {
          DEFAULT: "rgba(255,255,255,0.07)",
          bright:  "rgba(255,255,255,0.14)",
        },
        ink: {
          DEFAULT: "#e8e8f0",
          muted:   "#8b8b9e",
          faint:   "#4a4a5a",
        },
        accent: {
          DEFAULT: "#7c6af7",
          glow:    "rgba(124,106,247,0.18)",
          dim:     "#6457d4",
          border:  "rgba(124,106,247,0.25)",
          bg:      "rgba(124,106,247,0.06)",
          label:   "#b0a5fa",
        },
        success: {
          DEFAULT: "#34d399",
          bg:      "rgba(52,211,153,0.08)",
          border:  "rgba(52,211,153,0.18)",
          label:   "#6ee7b7",
        },
        danger: {
          DEFAULT: "#f87171",
          bg:      "rgba(248,113,113,0.08)",
          border:  "rgba(248,113,113,0.18)",
          label:   "#fca5a5",
        },
        warn: {
          DEFAULT: "#fbbf24",
          bg:      "rgba(251,191,36,0.08)",
          border:  "rgba(251,191,36,0.18)",
          label:   "#fde68a",
        },
      },
      boxShadow: {
        card:            "0 1px 2px rgba(0,0,0,.4), 0 8px 32px rgba(0,0,0,.3)",
        "accent-glow":   "0 4px 20px rgba(124,106,247,0.18)",
        "success-dot":   "0 0 6px #34d399",
        "accent-dot":    "0 0 8px #7c6af7",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1",   transform: "scale(1)"  },
          "50%":       { opacity: ".45", transform: "scale(.8)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to:   { opacity: "1", transform: "translateY(0)"    },
        },
        spin: { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        pulse:        "pulse 2.2s ease-in-out infinite",
        "fade-up":    "fadeUp .35s ease forwards",
        spin:         "spin .85s linear infinite",
        "spin-fast":  "spin .7s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
