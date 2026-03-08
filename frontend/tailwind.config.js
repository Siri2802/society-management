/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        bg: { DEFAULT: '#0C0F1A', surface: '#131726', card: '#1A1F35', border: '#252A42' },
        accent: { DEFAULT: '#6EE7B7', dim: '#34D399', muted: '#1F4037' },
        primary: { DEFAULT: '#818CF8', dim: '#6366F1', muted: '#1E1B4B' },
        warn: { DEFAULT: '#FCD34D', muted: '#422006' },
        danger: { DEFAULT: '#F87171', muted: '#3B0000' },
        ink: { DEFAULT: '#E2E8F0', muted: '#94A3B8', faint: '#475569' },
      },
      boxShadow: {
        glow: '0 0 20px rgba(110,231,183,0.15)',
        card: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
      }
    },
  },
  plugins: [],
}
