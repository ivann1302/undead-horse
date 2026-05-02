import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/undead-horse/',
  plugins: [react()],
  build: {
    outDir: 'docs',
  },
});
