/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                brand: {
                    dark: '#0f172a',
                    accent: '#38bdf8', // Cyan
                    brown: '#8B4513', // Alquid Brown
                    gray: '#64748b', // Alquid Grey
                    secondary: '#a855f7', // Purple
                    surface: '#1e293b',
                }
            }
        }
    },
    plugins: [],
}
