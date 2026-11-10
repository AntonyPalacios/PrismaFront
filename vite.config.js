import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the backend runs on :8080 and the SPA on :5173. Proxying
// /api makes both look like one origin (as in production), so the auth
// cookie and the XSRF-TOKEN cookie work without CORS gymnastics.
// The Google login button is the exception: it navigates the whole page
// to the backend (see LoginPage), so it doesn't go through this proxy.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});
