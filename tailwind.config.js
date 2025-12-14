/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--color-primary)',
                'primary-hover': 'var(--color-primary-hover)',
                'skin-base': 'var(--color-bg-base)',
                'skin-card': 'var(--color-bg-card)',
                'skin-input': 'var(--color-bg-input)',
                'skin-base-text': 'var(--color-text-base)',
                'skin-muted': 'var(--color-text-muted)',
                'skin-border': 'var(--color-border)',
                'skin-accent': 'var(--color-accent)',
                success: 'var(--color-success)',
                danger: 'var(--color-danger)',
            }
        },
    },
    plugins: [],
}
