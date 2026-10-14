// Design tokens for INDUSTRA AI.
//
// `gray` is remapped to a blue-steel ramp, so every page that already uses gray-* picks
// up the new palette. Colour is kept for meaning: `rule` marks what the ontology
// contributed, `warn` and `crit` mark severity. Everything else stays quiet.
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Archivo Variable"', "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      colors: {
        gray: {
          50:  "#F4F7FA",
          100: "#E8EEF4",
          200: "#D3DEE8",
          300: "#B6C7D6",
          400: "#93A9C0",
          500: "#6F8BA8",
          600: "#4A6A8A",
          700: "#284664",
          800: "#17304A",
          900: "#102235",
          950: "#0A1624",
        },
        rule: "#5BD1F5",
        warn: "#F6B73C",
        crit: "#FF6F61",
      },
    },
  },
  plugins: [],
}
