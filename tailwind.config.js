const forms = require('@tailwindcss/forms');
const typography = require('@tailwindcss/typography');

module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './app.html',
    './src/**/*.{js,html}'
  ],
  theme: {
    extend: {
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
          800: '#0b456a'
        },
        success: {
          500: '#10b981'
        },
        warning: {
          500: '#f59e0b'
        },
        danger: {
          500: '#ef4444'
        },
        glass: 'rgba(255,255,255,0.6)'
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(3,105,161,0.15))',
        'gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
        'gradient-dark': 'linear-gradient(135deg, rgba(3,105,161,0.65), rgba(15,23,42,0.85))'
      },
      fontFamily: {
        sans: ['Inter', 'Inter var', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glass: '0 8px 32px rgba(15, 23, 42, 0.08)',
        glow: '0 0 25px rgba(14, 165, 233, 0.25)'
      },
      borderRadius: {
        xl: '1rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'pulse-slow': 'pulseSlow 4s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.85' },
          '50%': { opacity: '1' }
        }
      }
    }
  },
  plugins: [forms, typography]
};
