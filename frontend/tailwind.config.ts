import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6f7f8',
          100: '#b3e8ec',
          400: '#00b3be',
          500: '#009ca6',
          600: '#007a83',
          700: '#005e63',
        },
        gray: {
          50: '#f9f9f9',
          100: '#f3f3f3',
          200: '#e8e8e8',
          300: '#d4d4d4',
          400: '#c0c0c0',
          500: '#adadad',
          600: '#8a8a8a',
          700: '#6b6b6b',
          800: '#3d3d3d',
          900: '#1a1a1a',
        },
        success: { 50: '#edf7f2', 500: '#2d9e6b' },
        danger: { 50: '#fdf0f0', 500: '#d94040' },
        warning: { 50: '#fdf6e6', 500: '#c78b1a' },
      },
      fontSize: {
        xs: ['11px', { lineHeight: '1.4' }],
        sm: ['12px', { lineHeight: '1.4' }],
        md: ['13px', { lineHeight: '1.4' }],
        base: ['14px', { lineHeight: '1.5' }],
        lg: ['15px', { lineHeight: '1.5' }],
        xl: ['16px', { lineHeight: '1.2' }],
        '2xl': ['20px', { lineHeight: '1.2' }],
        '3xl': ['22px', { lineHeight: '1.2' }],
        '4xl': ['24px', { lineHeight: '1.2' }],
        '5xl': ['28px', { lineHeight: '1' }],
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.08)',
        md: '0 4px 12px rgba(0,0,0,0.10)',
        lg: '0 8px 24px rgba(0,0,0,0.12)',
        modal: '0 20px 60px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '10px',
        '2xl': '12px',
        full: '9999px',
      },
      keyframes: {
        spin: { to: { transform: 'rotate(360deg)' } },
        pulse: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
        slideIn: {
          from: { transform: 'translateX(16px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        spin: 'spin 0.7s linear infinite',
        pulse: 'pulse 1.5s ease-in-out infinite',
        slideIn: 'slideIn 0.2s ease',
      },
    },
  },
  plugins: [],
} satisfies Config
