import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import packageJson from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: './', // Important for Electron to find assets
    define: {
        'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version)
    },
    server: {
        port: 5173,
        strictPort: true,
    }
})
