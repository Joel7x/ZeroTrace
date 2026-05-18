/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0e1a',
        bg2: '#111827',
        bg3: '#1a2236',
        border: 'rgba(255,255,255,0.07)',
        border2: 'rgba(255,255,255,0.13)',
        text: '#e8eaf0',
        muted: '#6b7280',
        amber: '#f59e0b',
        red: '#ef4444',
        green: '#10b981',
        blue: '#3b82f6',
        teal: '#14b8a6',
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
