/* Tailwind CSS configuration for Spendly White Premium design system */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#7C6FF7',
        secondary: '#FF7043',
        background: '#FFFFFF',
        surface: '#F8F7FF',
        border: '#F0F0F8',
        income: '#10B981',
        expense: '#F43F5E',
        textPrimary: '#0F172A',
        textMuted: '#94A3B8',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        display: ['Nunito', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 2px 8px rgba(0,0,0,0.04)',
        md: '0 4px 16px rgba(124,111,247,0.06)',
        lg: '0 8px 32px rgba(124,111,247,0.1)',
        fab: '0 8px 24px rgba(124,111,247,0.45)',
      },
      borderRadius: {
        card: '24px',
        button: '16px',
        chip: '100px',
      },
      animation: {
        'count-up': 'countUp 1s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulseGlow 2s infinite',
        'shake': 'shake 0.5s ease-in-out',
        'bounce-in': 'bounceIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 4px 20px rgba(124,111,247,0.3)' },
          '50%': { boxShadow: '0 4px 30px rgba(124,111,247,0.5)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 50%, 90%': { transform: 'translateX(-6px)' },
          '30%, 70%': { transform: 'translateX(6px)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '60%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
