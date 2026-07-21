/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        civic: {
          blue: "#1E3A5F",
          gold: "#C9A84C",
          green: "#2D7A4F",
          red: "#C0392B",
          amber: "#E67E22",
          slate: "#2C3E50",
          light: "#ECF0F1",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
