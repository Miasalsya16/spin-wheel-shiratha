import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // GitHub Pages: https://miasalsya16.github.io/spin-wheel-shiratha/
  base: '/spin-wheel-shiratha/',
})
