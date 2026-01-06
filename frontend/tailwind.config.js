/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx,vue}",
    ],
    theme: {
        extend: {
            colors: {
                neutral: {
                    950: '#0a0a0a',
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
