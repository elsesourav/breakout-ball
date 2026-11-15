/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0a0e24',
        'surface-elevated': '#0c1230',
        border: 'rgba(0, 247, 255, 0.22)',
        primary: '#00f7ff',
        foreground: '#ffffff',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        tech: ['Rajdhani', 'sans-serif'],
        ui: ['Outfit', 'sans-serif'],
        body: ['Chakra Petch', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
