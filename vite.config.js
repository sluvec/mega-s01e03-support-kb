// Build scaffolding added around the kb export (it ships src/ only) so the pages render
// the way the desk sees them. Not part of the desk's kb.
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const runbook = fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url));

export default defineConfig({
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.svx'],
      preprocess: [
        vitePreprocess(),
        mdsvex({ extensions: ['.svx'], layout: { runbook } }),
      ],
      adapter: adapter({ pages: 'build', assets: 'build', strict: true }),
      inlineStyleThreshold: Infinity,
      prerender: { entries: ['*'] },
    }),
  ],
});
