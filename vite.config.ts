import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The legal pages are served at absolute paths (/privacy.html), and the
  // favicon links are absolute too, so the base must be '/' rather than the
  // relative './' a single-page build could get away with.
  base: '/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 2048,
    target: 'es2019',
    rollupOptions: {
      // One entry per standalone page. They share the tokens, the typography
      // and the hairlines, but deliberately pull in neither the 3D layer nor
      // the scroll machine — nobody needs WebGL to read a privacy policy.
      //
      // Paths are relative on purpose. `resolve(__dirname, …)` would drag in
      // `@types/node`, and this config is the only place in the project that
      // would have wanted it.
      input: {
        main: 'index.html',
        privacy: 'privacy.html',
        terms: 'terms.html',
        copyright: 'copyright.html',
        cookies: 'cookies.html',
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
