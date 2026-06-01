/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Government-grade blue / slate palette (matches infra dashboard).
        // Token names kept (navy/saffron/gold) so existing classes remap centrally.
        navy: { 900: '#0f172a', 800: '#1e293b', 700: '#1e3a8a', 600: '#1e40af' },
        saffron: '#2563eb', // primary brand blue
        gold: '#0ea5e9',    // secondary sky accent
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: { glow: '0 1px 3px 0 rgba(15,23,42,0.06), 0 8px 24px -10px rgba(15,23,42,0.12)' },
    },
  },
  plugins: [],
};
