import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#C14A6E",
          dark: "#9E3556",
          soft: "#F9A8D4",
          pale: "#FCE7F0",
        },
        cream: {
          DEFAULT: "#FDF6F1",
          dark: "#F5EBE1",
        },
        cocoa: {
          DEFAULT: "#4A2C35",
          soft: "#7A5560",
          muted: "#9C8A90",
        },
        accent: {
          DEFAULT: "#8B5CF6",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(193, 74, 110, 0.25)",
        card: "0 2px 12px -4px rgba(74, 44, 53, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
