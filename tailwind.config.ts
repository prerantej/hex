import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // 👈 important for next-themes toggle
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}" // 👈 include src if you keep auth/db here
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: "1rem"
      },
      colors: {
        bg: "var(--bg)",
        card: "var(--card)",
        border: "var(--border)",
        text: "var(--text)",
        muted: "var(--muted)"
      },
      boxShadow: {
        soft: "0 2px 16px rgba(0,0,0,.06)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem"
      }
    }
  },
  plugins: []
};

export default config;
