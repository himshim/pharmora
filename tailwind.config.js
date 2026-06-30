const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./admin/**/*.{html,js,jsx}",
    "./components/**/*.{js,jsx}",
    "./js/**/*.{js,jsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-light": "var(--surface-light)",
        text: "var(--text)",
        "text-soft": "var(--text-soft)",
        "text-muted": "var(--text-muted)",
        border: "var(--border)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)"
      }
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        dark: {
          colors: {
            background: "#020617",
            foreground: "#ffffff",
            primary: {
              DEFAULT: "#22d3ee",
              foreground: "#000000"
            },
            success: "#22c55e",
            warning: "#f59e0b",
            danger: "#ef4444"
          }
        }
      }
    })
  ]
}
