import { defineConfig } from 'vite';

/**
 * base — префикс, из которого отдаётся сайт.
 *
 * Локально и на Netlify/Cloudflare это корень. GitHub Pages отдаёт
 * проект из подпапки вида /english-portal/, и без префикса ломается
 * всё сразу: скрипты, иконки, манифест и service worker.
 * Значение приходит из переменной окружения при сборке.
 */
const base = process.env.PORTAL_BASE || '/';

export default defineConfig({
  base,
  server: {
    port: 5173,
    open: false,
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: 'dist',
  },
});
