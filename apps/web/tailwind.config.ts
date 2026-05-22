import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#0f4d3f",
        leaf: "#1b9a7a",
        gold: "#f59e0b",
        cream: "#f8faf7",
        ember: "#d14343",
        ink: "#16211d",
        slate: "#3f524c",
        cloud: "#d6ddd8"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 20px 45px -20px rgba(15, 28, 23, 0.24)",
        card: "0 12px 30px rgba(22, 33, 29, 0.1)",
        glow: "0 0 0 1px rgba(245, 158, 11, 0.22), 0 16px 34px rgba(15, 77, 63, 0.22)"
      },
      backgroundImage: {
        "hero-grid": "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.22) 1px, transparent 0)",
        "kerala-wave":
          "radial-gradient(120% 130% at 0% 0%, rgba(27,154,122,0.26) 0%, rgba(27,154,122,0) 58%), radial-gradient(100% 120% at 100% 0%, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0) 54%)"
      }
    }
  },
  plugins: []
};

export default config;
