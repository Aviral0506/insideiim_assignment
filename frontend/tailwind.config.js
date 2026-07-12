/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#03060a",
          raised: "#0a0f18",
          border: "#1e293b",
          borderHover: "#334155",
        },
        signal: {
          invest: "#10b981", // Emerald-500
          pass: "#f43f5e",   // Rose-500
          hold: "#f59e0b",   // Amber-500
        },
        brand: {
          DEFAULT: "#6366f1", // Indigo-500
          hover: "#4f46e5",   // Indigo-600
          light: "#a5b4fc",   // Indigo-300
          glow: "rgba(99, 102, 241, 0.15)",
        },
        "brand-neon": "#818cf8",
        accent: {
          cyan: "#22d3ee",
          violet: "#a78bfa",
          emerald: "#34d399",
          rose: "#fb7185",
        }
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      animation: {
        'pulse-slow': 'pulse 3.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        fadeIn: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        slideUp: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        slideInRight: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(99, 102, 241, 0.15), inset 0 0 5px rgba(99, 102, 241, 0.05)' },
          '50%': { boxShadow: '0 0 25px rgba(99, 102, 241, 0.4), inset 0 0 10px rgba(99, 102, 241, 0.2)' },
        }
      },
    },
  },
  plugins: [],
};
