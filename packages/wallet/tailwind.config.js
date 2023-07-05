/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        white: '#FAFAFA',
        neutral: {
          700: '#323539',
        },
        zinc: {
          800: '#272A2F',
        },
        gray: {
          50: '#AEAEAE',
          100: '#EDEDED',
          200: '#DFDFDF',
          300: '#D3D3D3',
          400: '#D0CED1',
          500: '#737373',
          550: '#888888',
          600: '#848484',
          650: '#5C5C5C',
          700: '#565656',
          750: '#424850',
          800: '#424242',
          850: '#333333',
          900: '#2F2F2F',
          950: '#111111',
        },
        black: '#1B1B1B',
        yellow: {
          100: '#FFDD28',
          200: '#FFC107',
          250: '#FFEC44',
          300: '#FDCF44',
          500: '#E5C227',
          700: '#CB9800',
          800: '#382D11',
        },
        orange: { 400: '#FF8B36', 500: '#FF7D1F', 600: '#F94A24' },
        purple: {
          100: '#7E41CC',
          300: '#F1D6FF',
          500: '#6A008E',
          700: '#4A133C',
          800: '#32102A',
        },
        pink: {
          100: '#FF46C0',
          200: '#DB8BF7',
          900: '#AB3BD2',
        },
        green: {
          200: '#B0FFAA',
          300: '#4EAB58',
          400: '#13E000',
          450: '#50E35F',
          500: '#5BFF4D',
          600: '#11CC00',
          700: '#007408',
          800: '#34762F',
        },
        red: {
          100: '#FDD9D9',
          200: '#EE2C01',
          300: '#FA3A3A',
          350: '#F94A24',
          400: '#FF0000',
          500: '#C32806',
          550: '#ED0000',
          600: '#C71414',
          700: '#D70000',
          900: '#441111',
          950: '#323232',
        },
        blue: {
          300: '#CBDFF9',
          400: '#BADAFF',
          450: '#96C0F7',
          500: '#53A2FF',
          550: '#1F87FF',
          600: '#2B5CD9',
          700: '#005DD7',
          800: '#083575',
          900: '#112944',
        },
        gradient: {
          1: '#7e41cc',
          2: '#d83da4',
          3: '#ee2c01',
        },

        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
