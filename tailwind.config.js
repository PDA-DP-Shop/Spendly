/* Tailwind CSS configuration for Spendly design system */
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
        // Background
        'app-bg': '#F5F5F5',
        'dark-bg': '#0F0F1A',
        // Cards
        'card-white': '#FFFFFF',
        'dark-card': '#1A1A2E',
        'dark-card-elevated': '#242438',
        // Balance card gradient stops
        'balance-dark': '#2D2D3A',
        'balance-darker': '#1A1A2E',
        // Purple accent
        'purple': {
          DEFAULT: '#7C3AED',
          light: '#EDE9FE',
          pale: '#F3E8FF',
          dark: '#6D28D9',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          900: '#4C1D95',
        },
        // Orange
        'orange': {
          DEFAULT: '#F97316',
          dark: '#EA580C',
          darker: '#DC2626',
        },
        // Status colors
        'success': '#22C55E',
        'danger': '#EF4444',
        'warning': '#F59E0B',
        // Text
        'text-dark': '#111827',
        'text-grey': '#9CA3AF',
        'text-light': '#F9FAFB',
        // Border
        'border-light': '#F3F4F6',
        'dark-border': '#2D2D45',
      },
      fontFamily: {
        'sora': ['Sora', 'sans-serif'],
        'dm': ['DM Sans', 'sans-serif'],
      },
      fontSize: {
        'balance': '36px',
        'card-amount': '26px',
        'title': '22px',
        'greeting': '26px',
        'item-name': '15px',
        'item-detail': '12px',
        'label': '12px',
        'btn': '15px',
      },
      spacing: {
        'screen-pad': '24px',
        'card-pad': '20px',
        'card-gap': '16px',
        'item-gap': '12px',
        'tab-height': '72px',
      },
      borderRadius: {
        'card': '20px',
        'chip': '100px',
        'btn': '14px',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0,0,0,0.06)',
        'fab': '0 4px 20px rgba(249,115,22,0.4)',
        'balance': '0 8px 32px rgba(0,0,0,0.15)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulseGlow 2s infinite',
        'count-up': 'countUp 1s ease-out',
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
          '0%, 100%': { boxShadow: '0 4px 20px rgba(249,115,22,0.4)' },
          '50%': { boxShadow: '0 4px 30px rgba(249,115,22,0.7)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 50%, 90%': { transform: 'translateX(-8px)' },
          '30%, 70%': { transform: 'translateX(8px)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '60%': { transform: 'scale(1.05)' },
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
