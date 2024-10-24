import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/bundle.js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
  base: './'
})
