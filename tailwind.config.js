module.exports = {
  content: ["./index.html","./app.html","./src/**/*.{js,html}"],
  theme: {
    extend: {
      container: { center: true, padding: "1.5rem" },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e'
        }
      },
      boxShadow: {
        glass: '0 20px 45px rgba(15, 23, 42, 0.35)'
      }
    }
  },
  plugins: []
}
