/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#c5a368",
          bright: "#d4af37",
          muted: "#9a7b4f",
        },
        surface: "#121212",
        ink: "#0a0a0a",
      },
      fontFamily: {
        serif: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        card: "1.25rem",
        pill: "9999px",
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #c5a368 0%, #e8d5a3 45%, #b8924a 100%)",
      },
    },
  },
  plugins: [],
};
