import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171411",
        paper: "#fbfaf7",
        bone: "#ece7dd",
        moss: "#5f7a54",
        iris: "#6b5b95",
        tomato: "#c94b3a",
        ocean: "#326d8f",
        pollen: "#d4a73f"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-serif)", "Georgia", "serif"]
      },
      boxShadow: {
        editorial: "0 20px 60px rgba(23, 20, 17, 0.11)"
      }
    }
  },
  plugins: []
};

export default config;
