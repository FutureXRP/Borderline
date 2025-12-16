import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Correct base path for your repo
export default defineConfig({
  plugins: [react()],
  base: '/borderline-orders-and-supply/',
})
