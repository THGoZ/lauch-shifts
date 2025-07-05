/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        primaryForeground: "var(--primary-foreground)",
        secondary: "var(--secondary)",
        secondaryForeground: "var(--secondary-foreground)",
        accent: "var(--accent)",
        accentForeground: "var(--accent-foreground)",
        muted: "var(--muted)",
        mutedForeground: "var(--muted-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        destructive: "var(--destructive)",
        destructiveForeground: "var(--destructive-foreground)",
        destructiveMuted: "var(--destructive-muted)",
        destructiveMutedForeground: "var(--destructive-muted-foreground)",
        warning: "var(--warning)",
        success: "var(--success)",
        successForeground: "var(--success-foreground)",
      },
    },
  },
  plugins: [],
}

