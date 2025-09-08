import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  important: true, // يخلي Tailwind يكسب لو رجعت Bootstrap
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // اختياري: لو عندك كلاسّات شرطية بتتفلتر وقت الـ build
  // safelist: [
  //   "bg-green-100",
  //   "bg-red-100",
  //   "bg-gray-50",
  //   "bg-green-500",
  //   "bg-red-500",
  //   "bg-blue-500",
  //   "bg-yellow-500",
  //   "border-2",
  //   "border-4",
  //   "border-gray-200",
  //   "border-green-500",
  //   "border-red-500",
  // ],
  theme: {
    extend: {
      gridTemplateColumns: {
        "13": "repeat(13, minmax(0, 1fr))",
      },
      colors: {
        blue: { 400: "#2589FE", 500: "#0070F3", 600: "#2F6FEB" },
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
    },
  },
  plugins: [forms],
};
export default config;
