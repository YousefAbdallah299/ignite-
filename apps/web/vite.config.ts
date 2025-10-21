import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

export default defineConfig({
    base: '/', // ensures assets load correctly relative to index.html
    plugins: [
        react(),       // handles JSX + React automatically
        tsconfigPaths() // resolves path aliases from tsconfig.json
    ],
    build: {
        outDir: 'build', // output folder
        emptyOutDir: true,
        sourcemap: false
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
        dedupe: ['react', 'react-dom'],
    },
    server: {
        hmr: false, // disable hot reload for preview/production
    },
});
