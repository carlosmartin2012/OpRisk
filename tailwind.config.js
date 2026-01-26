/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./index.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                brand: {
                    dark: '#050505',
                    accent: '#38bdf8', // Cyan
                    brown: '#8B4513', // Alquid Brown
                    gray: '#64748b', // Alquid Grey
                    secondary: '#a855f7', // Purple
                    surface: '#0d0d0d',
                }
            }
        }
    },
    plugins: [],
}
