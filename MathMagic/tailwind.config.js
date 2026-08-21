/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#8B5CF6", // Bubbly Purple
          light: "#A78BFA",
          dark: "#6D28D9",
        },
        background: {
          DEFAULT: "#FFFDF6", // Warm Cream
          light: "#F3E8FF",   // Soft Lavender
          lighter: "#FFEBF0", // Soft Pink
        },
        surface: {
          DEFAULT: "#FFFFFF",
          light: "#F8F6F0",
        },
        text: {
          primary: "#4C1D95", // Dark Purple/Indigo
          secondary: "#6D28D9",
          tertiary: "#8B5CF6",
        },
        card: {
          blue: "#E0F2FE",    // Pastel Blue
          orange: "#FFEDD5",  // Pastel Orange
          green: "#DCFCE7",   // Pastel Green
          pink: "#FCE7F3",    // Pastel Pink
          purple: "#F3E8FF",  // Pastel Purple
        },
        accent: {
          DEFAULT: "#FACC15", // Bubbly Yellow
          red: "#F87171",
          yellow: "#FACC15",
        },
      },
      fontFamily: {
        serif: ["PlayfairDisplay", "serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
