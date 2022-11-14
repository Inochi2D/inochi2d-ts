import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'lib/main.ts'),
            name: "inochi2d",
            fileName: (format) => `inochi2d.${format}.js`
        }
    }
});