/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  // Disable preflight to prevent conflicts with the existing App.css base styles
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1A3C6E",
          light: "#2a5298",
          50: "rgba(26,60,110,0.05)",
          100: "rgba(26,60,110,0.10)",
        },
        secondary: {
          DEFAULT: "#F4A823",
        },
        ncpl: {
          success: "#10B981",
          error: "#EF4444",
          warn: "#F59E0B",
          info: "#0891B2",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,.08)",
        "card-hover": "0 4px 12px rgba(0,0,0,.10)",
      },
    },
  },
  plugins: [],
};
