/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Light blue governance palette
        navy: { 900: '#0c1e3e', 800: '#1a3a52', 700: '#1e4976', 600: '#2563eb' },
        saffron: '#3b82f6', // primary vibrant blue
        gold: '#06b6d4',    // secondary cyan accent
        skyblue: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        glow: '0 1px 3px 0 rgba(15,23,42,0.06), 0 8px 24px -10px rgba(15,23,42,0.12)',
        'light-glow': '0 4px 15px 0 rgba(59,130,246,0.15)',
      },
      backgroundImage: {
        'gradient-blue': 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        'gradient-light': 'linear-gradient(135deg, #e0f2fe 0%, #cffafe 100%)',
      },
    },
  },
  plugins: [],
};
