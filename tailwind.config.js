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
        background: '#050B18',
        surface: 'rgba(255,255,255,0.04)',
        border: 'rgba(255,255,255,0.08)',
        cyan: {
          glow: '#00D4FF',
          dim: 'rgba(0,212,255,0.15)',
        },
        blue: {
          glow: '#0066FF',
          dim: 'rgba(0,102,255,0.15)',
        },
        income: '#00FF87',
        expense: '#FF4D6D',
        textPrimary: '#F0F4FF',
        textMuted: '#7B8DB0',
      },
      fontFamily: {
        display: ['Clash Display', 'sans-serif'],
        body: ['Satoshi', 'sans-serif'],
        sora: ['Clash Display', 'sans-serif'], // Remapping sora to display for fallback
        dm: ['Satoshi', 'sans-serif'], // Remapping dm to body for fallback
      },
      backdropBlur: {
        glass: '24px',
        heavy: '40px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        glow: '0 0 20px rgba(0,212,255,0.3)',
        glowLg: '0 0 40px rgba(0,102,255,0.4)',
        fab: '0 4px 20px rgba(0,212,255,0.5)',
      },
      borderRadius: {
        card: '24px',
        button: '16px',
        chip: '100px',
      },
      animation: {
        glowPulse: 'glowPulse 2s infinite',
        borderSpin: 'borderSpin 4s linear infinite',
        countUp: 'countUp 1s ease-out',
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
