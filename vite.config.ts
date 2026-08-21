import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Базовый путь совпадает с именем репозитория — это требование GitHub Pages
// для адресов вида username.github.io/snapbuild-test-task/
export default defineConfig({
  base: '/snapbuild-test-task/',
  plugins: [react()],
})
