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
        background: "var(--background)",
        foreground: "var(--foreground)",
        landing: {
          surface: "rgba(255, 255, 255, 0.10)",
          "surface-hover": "rgba(255, 255, 255, 0.16)",
          border: "rgba(255, 255, 255, 0.10)",
          "border-strong": "rgba(255, 255, 255, 0.20)",
          text: "rgba(255, 255, 255, 0.80)",
          "text-muted": "rgba(255, 255, 255, 0.60)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-noto-sans-thai)", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "var(--font-noto-serif-thai)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
