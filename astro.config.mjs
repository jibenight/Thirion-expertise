import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://thirion-expertise.fr',
  vite: {
    plugins: [tailwindcss()],
  },
});
