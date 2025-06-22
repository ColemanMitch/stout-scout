export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dead Poet inspired palette
        mahogany: '#4B2E2B',
        gold: '#C9B037',
        cream: '#F5F3E7',
        guinness: '#231F20',
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
}; 