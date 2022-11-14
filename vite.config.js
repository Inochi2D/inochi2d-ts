import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'lib/main.js'),
            name: "Inochi2D",
            fileName: (format) => `inochi2d.${format}.js`
        }
    }
});