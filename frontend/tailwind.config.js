/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "rgb(var(--color-primary) / <alpha-value>)",
                navy: "rgb(var(--color-navy) / <alpha-value>)",
                background: "rgb(var(--color-background) / <alpha-value>)",
                card: "rgb(var(--color-card) / <alpha-value>)",
                border: "rgb(var(--color-border) / <alpha-value>)",
                success: "#10B981",
                warning: "#F59E0B",
                danger: "#EF4444",
                text: {
                    primary: "rgb(var(--color-text-primary) / <alpha-value>)",
                    secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
