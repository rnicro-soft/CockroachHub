/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cjp: {
          maroon: "#800000",
          "maroon-light": "#a52a2a",
          tricolor: { orange: "#FF9933", white: "#FFFFFF", green: "#138808" },
        },
        ph: {
          black: "#0d0d0d",
          dark: "#171717",
          "dark-2": "#1a1a1a",
          card: "#1f1f1f",
          "card-hover": "#2a2a2a",
          orange: "#FF9900",
          "orange-hover": "#FFB033",
          "orange-muted": "rgba(255,153,0,0.1)",
          text: "#ffffff",
          "text-secondary": "#999999",
          "text-muted": "#666666",
          "text-dark": "#333333",
          border: "#333333",
          "border-light": "#e6e6e6",
          "green": "#2ecc71",
          "red": "#e74c3c",
          "yellow": "#f39c12",
          light: "#f5f5f5",
          white: "#ffffff",
        },
      },
      fontFamily: {
        sans: ['Geist', 'Arial', 'Helvetica', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};
