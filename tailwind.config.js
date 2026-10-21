/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AutoNear Design System
        bg: {
          primary: '#090909',
          secondary: '#111111',
          card: '#171717',
          elevated: '#202020',
        },
        border: {
          DEFAULT: '#303030',
          light: '#3a3a3a',
        },
        text: {
          primary: '#F5F5F5',
          secondary: '#A3A3A3',
          muted: '#737373',
        },
        surface: {
          100: '#171717',
          200: '#202020',
          300: '#2a2a2a',
          400: '#303030',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.6), 0 0 0 1px rgba(48,48,48,0.4)',
        elevated: '0 4px 16px rgba(0,0,0,0.7)',
        glow: '0 0 20px rgba(255,255,255,0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
