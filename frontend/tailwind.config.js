/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '32px 32px',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(74, 222, 128, 0.6)' },
          '50%': { boxShadow: '0 0 0 6px rgba(74, 222, 128, 0)' },
        },
        pulseGlowRed: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(248, 113, 113, 0.6)' },
          '50%': { boxShadow: '0 0 0 6px rgba(248, 113, 113, 0)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scanLine: {
          '0%, 100%': { top: '4px' },
          '50%': { top: '72px' },
},
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-out infinite',
        'pulse-glow-red': 'pulseGlowRed 2s ease-out infinite',
        'fade-in': 'fadeIn 0.25s ease-out',
        'scan-line': 'scanLine 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}