import { defineConfig } from 'vite';
import { resolve } from 'path';

const API_PORT = process.env.API_PORT || 3110;

export default defineConfig({
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: `http://localhost:${API_PORT}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        aboutBook: resolve(__dirname, 'about-the-book.html'),
        aboutAuthor: resolve(__dirname, 'about-the-author.html'),
        contact: resolve(__dirname, 'contact-us.html'),
        reviews: resolve(__dirname, 'reviews.html'),
        blogIndex: resolve(__dirname, 'blog/index.html'),
        blogCoherence: resolve(__dirname, 'blog/reclaiming-coherence-in-a-fragmented-world.html'),
        blogSurviving: resolve(__dirname, 'blog/surviving-versus-living.html'),
        blogFramework: resolve(__dirname, 'blog/meaning-reason-purpose-framework.html'),
        blogVeteran: resolve(__dirname, 'blog/veteran-finding-direction-after-service.html'),
      },
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap', 'gsap/ScrollTrigger'],
        },
      },
    },
  },
});
