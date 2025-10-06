module.exports = {
  content: [
    './index.html',
    './app.html',
    './src/**/*.{js,html}'
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: '1.5rem'
      },
      boxShadow: {
        glass: '0 20px 45px rgba(15, 23, 42, 0.35)'
      },
      transitionDuration: {
        0: '0ms'
      }
    }
  },
  plugins: []
}
