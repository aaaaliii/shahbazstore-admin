/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "custom-blue": "#700e77",
        "custom-red": "#F44A51",
        "custom-blue-light": "#a91e94",
        "primary": "#700e77",
      },
      backgroundImage: {
        "custom-gradient-red":
          "linear-gradient(270deg, #b824a3 0%, #700e77 100%)",
        "custom-gradient-blue":
          "linear-gradient(90deg, #700e77 0%, #a91e94 100%)",
      },
      fontFamily: {
        "open-sans-regular": ["Open-Sans-Regular", "sans-serif"],
        "open-sans-medium": ["Open-Sans-Semi-Bold", "sans-serif"],
        "open-sans-bold": ["Open-Sans-Bold", "sans-serif"],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          lg: "4rem",
          xl: "5rem",
          "2xl": "6rem",
        },
      },
    },
  },
  plugins: [],
};
