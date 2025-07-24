export default {
  darkMode: "class", // enable manual toggling
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        instaPurple: "#833AB4",
        instaPink: "#FD1D1D",
        instaOrange: "#FCAF45",
      },
      backgroundImage: {
        "insta-gradient":
          "linear-gradient(to right, #833AB4, #FD1D1D, #FCAF45)",
      },
    },
  },
  plugins: [],
};
