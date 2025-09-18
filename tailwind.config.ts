import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent-peach': '#FFB3BA',
        'accent-lavender': '#BFCCFF',
        'accent-honey': '#FFDFBA',
        'accent-green': '#BAFFC9',
      },
      fontFamily: {
        sans: ['var(--font-lexend)'],
        serif: ['var(--font-lora)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [],
};
export default config;