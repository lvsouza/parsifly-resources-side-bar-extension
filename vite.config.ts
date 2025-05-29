import { defineConfig } from 'vite';


export default defineConfig({
  root: './',
  build: {
    sourcemap: false,
    emptyOutDir: true,
    lib: {
      formats: ['es'],
      entry: './src/extension.ts',
      name: 'export-project-extension',
      fileName: () => `index.js`,
    },
  },
  server: {
    port: 5555,
    cors: { origin: '*' },
  }
})
