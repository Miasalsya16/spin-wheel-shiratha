import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Netlify root: https://shiratha-spin-wheel.netlify.app/
  base: '/',
})
