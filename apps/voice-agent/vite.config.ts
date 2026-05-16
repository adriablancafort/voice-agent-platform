import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    ssr: 'src/main.ts',
    target: 'node18',
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'main.js',
      },
    },
  },
});
