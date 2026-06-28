import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:    'rgb(var(--bg) / <alpha-value>)',
        s0:    'rgb(var(--s0) / <alpha-value>)',
        s1:    'rgb(var(--s1) / <alpha-value>)',
        s2:    'rgb(var(--s2) / <alpha-value>)',
        ink:   'rgb(var(--ink) / <alpha-value>)',
        ink2:  'rgb(var(--ink2) / <alpha-value>)',
        ink3:  'rgb(var(--ink3) / <alpha-value>)',
        blue:  'rgb(var(--blue) / <alpha-value>)',
        gold:  'rgb(var(--gold) / <alpha-value>)',
        ok:    'rgb(var(--ok) / <alpha-value>)',
        err:   'rgb(var(--err) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem', letterSpacing: '0.06em' }],
      },
      borderRadius: {
        sm:  '0.25rem',
        DEFAULT: '0.375rem',
        md:  '0.5rem',
        lg:  '0.75rem',
        xl:  '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.32, 0.72, 0, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.32, 0.72, 0, 1) both',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
