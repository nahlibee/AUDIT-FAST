/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sap: {
          yellow: {
            DEFAULT: '#facc15', // Same as yellow-400
            light: '#fef08a',   // Same as yellow-200
            dark: '#eab308',    // Same as yellow-500
          },
          black: {
            DEFAULT: '#1f2937', // Same as gray-800
            light: '#374151',   // Same as gray-700
            dark: '#111827',    // Same as gray-900
          }
        }
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            a: {
              color: theme('colors.yellow.600'),
              '&:hover': {
                color: theme('colors.yellow.700'),
              },
            },
            h1: {
              color: theme('colors.gray.900'),
            },
            h2: {
              color: theme('colors.gray.900'),
            },
            h3: {
              color: theme('colors.gray.900'),
            },
            h4: {
              color: theme('colors.gray.900'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    // Add the forms plugin if needed
    // require('@tailwindcss/forms'),
    
    // Add the typography plugin if needed
    // require('@tailwindcss/typography'),
  ],
}