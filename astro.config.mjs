// @ts-check
import { defineConfig } from 'astro/config';
import sharp from 'sharp';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://jmr-visuals.com',
  output: 'static',
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  integrations: [react()],
});
