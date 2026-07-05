/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: "#0F1115",
        panel: "#171A21",
        gridline: "#242A35",
        ink: "#E8EAED",
        muted: "#8B93A1",
        signal: "#FF6A3D",   // defect / critical accent
        ok: "#3ED98A",       // pass accent
        warn: "#F2C94C",     // medium severity accent
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        blueprint:
          "linear-gradient(#242A35 1px, transparent 1px), linear-gradient(90deg, #242A35 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "28px 28px",
      },
    },
  },
  plugins: [],
};
