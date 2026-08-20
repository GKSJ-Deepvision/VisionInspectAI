/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        hud: {
          bg: "#090D16",
          card: "#111827",
          border: "#1F2937",
          accent: "#06B6D4",
          glow: "#0891B2",
        },
      },
    },
  },
  plugins: [],
};