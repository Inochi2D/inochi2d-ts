import DTSPlugin from 'vite-plugin-dts'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './src/main.ts',
      fileName: (format) => `inochi2d.${format}.js`,
      name: 'Inochi2D'
    }
  },
  plugins: [
    DTSPlugin()
  ],
  resolve: {
    alias: {
      '@/': `${__dirname}/src/`
    }
  }
})
