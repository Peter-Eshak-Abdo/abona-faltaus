import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  important: true,
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        "13": "repeat(13, minmax(0, 1fr))",
      },
      colors: {
        blue: { 400: "#2589FE", 500: "#0070F3", 600: "#2F6FEB" },
        // "primary": "#4a0012",
        // "primary-container": "#6b1124",
        // "secondary-fixed": "#ffe088",
        // "surface-container": "#f0eded",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
    },
  },
  plugins: [forms],
};
export default config;
