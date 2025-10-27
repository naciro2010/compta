/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Claude Code inspired color palette
        'claude': {
          'bg': '#1a1a1a',
          'surface': '#242424',
          'surface-hover': '#2d2d2d',
          'border': '#3d3d3d',
          'text': '#e8e8e8',
          'text-muted': '#a8a8a8',
          'text-subtle': '#6b6b6b',
          'accent': '#d97706',
          'accent-hover': '#ea580c',
          'success': '#10b981',
          'danger': '#ef4444',
          'warning': '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'claude': '0.5rem',
      },
    },
  },
  plugins: [],
}
