/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0A0A0C',
        'bg-subtle': '#101013',
        'surface': '#151518',
        'surface-hover': '#202026',
        'border-subtle': '#23232A',
        'border-default': '#2C2C35',
        'text-primary': '#FFFFFF',
        'text-secondary': '#D4D4D8',
        'text-muted': '#A1A1AA',
        'brand-primary': '#FACC15',
        'brand-primary-hover': '#EAB308',
        'brand-primary-subtle': 'rgba(250, 204, 21, 0.12)',
        'brand-primary-text': '#0A0A0C',
        'brand-success': '#34D399',
        'brand-success-subtle': 'rgba(52, 211, 153, 0.12)',
        'brand-warning': '#FB923C',
        'brand-warning-subtle': 'rgba(251, 146, 60, 0.12)',
        'brand-danger': '#F87171',
        'brand-danger-subtle': 'rgba(248, 113, 113, 0.12)',
      },
      fontFamily: {
        sans: ['Geist', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      minHeight: {
        'touch-target': '60px',
        'action-button': '52px',
      },
      height: {
        'touch-target': '60px',
        'action-button': '52px',
      }
    },
  },
  plugins: [],
};
