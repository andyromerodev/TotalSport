import { defineConfig } from 'astro/config';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const defaultBase = process.env.CI && repoName ? `/${repoName}` : '/';

export default defineConfig({
  output: 'static',
  site: process.env.PUBLIC_SITE_URL || 'https://example.github.io',
  base: process.env.PUBLIC_BASE_PATH || defaultBase
});
