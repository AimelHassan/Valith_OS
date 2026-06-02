/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#FAFAFA',
          soft: '#F4F4F3',
          card: '#FFFFFF',
        },
        typography: {
          DEFAULT: '#111111',
          muted: '#666666',
          light: '#8E8E8E',
        },
        aurum: {
          light: '#F4E3B1',
          DEFAULT: '#C5A059',
          dark: '#9A7B3E',
          glow: 'rgba(197, 160, 89, 0.15)',
        },
        border: '#EBEBEB',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.03), 0 2px 8px -1px rgba(0, 0, 0, 0.02)',
        'premium-hover': '0 12px 30px -4px rgba(197, 160, 89, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'glow': '0 0 15px rgba(197, 160, 89, 0.2)',
      },
    },
  },
  plugins: [],
}
