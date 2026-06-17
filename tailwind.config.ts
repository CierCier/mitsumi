import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          bg: '#F8F6F3',
          card: '#FFFFFF',
          border: '#EDE9E4',
        },
        ink: {
          DEFAULT: '#1C1814',
          muted: '#7A746E',
          light: '#B5B0A8',
        },
        primary: {
          DEFAULT: '#D4784C',
          hover: '#C1683E',
          light: '#F0D8CA',
        },
        secondary: {
          DEFAULT: '#4A7B9D',
          hover: '#3D6A89',
          light: '#D0E0EA',
        },
        success: { DEFAULT: '#5A8C5A', light: '#D6E8D6' },
        danger: { DEFAULT: '#C95A4E', light: '#F0D0CC' },
        warning: { DEFAULT: '#C99C40', light: '#F0E4C0' },
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        noise: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.015'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}

export default config
