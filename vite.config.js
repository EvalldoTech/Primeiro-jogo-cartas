import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' permite abrir o build localmente e hospedar em subpasta (GitHub Pages).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5173 },
});
