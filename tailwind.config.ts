import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
      colors: {
        paper: { DEFAULT: "#F5F6F8", card: "#FFFFFF" },
        ink: { DEFAULT: "#151821", soft: "#5B6272", night: "#0E1016", raised: "#181B24" },
        accent: { DEFAULT: "#4357F5", soft: "#E8EBFE" },
      },
    },
  },
  plugins: [],
};

export default config;
