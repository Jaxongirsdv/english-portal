/**
 * Service worker портала.
 *
 * Задача одна: сделать так, чтобы приложение открывалось без сети.
 * Для приложения с интервальными повторениями это не удобство, а условие
 * работы — заниматься нужно каждый день, в том числе в метро и самолёте.
 *
 * Стратегия намеренно простая, без сборочных плагинов:
 *   навигация — сеть вперёд, при отказе отдаём сохранённую оболочку;
 *   остальное — кэш вперёд, обновление тихо подтягивается в фоне.
 *
 * Имена файлов сборки содержат хеш, поэтому новая версия просто попадёт
 * в кэш при первой загрузке, а старые записи вычистятся при смене CACHE.
 */

const CACHE = 'english-portal-v1';

/**
 * Все пути считаем от области действия воркера, а не от корня домена.
 * На GitHub Pages сайт живёт в подпапке, и абсолютный «/index.html»
 * указывал бы на чужую страницу за пределами проекта.
 */
const scope = self.registration.scope;
const at = (path) => new URL(path, scope).href;

/** Минимум, без которого приложение не откроется офлайн. */
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'].map(at);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // Отдельными запросами: если один файл не найден, addAll отменил бы всю установку
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Кэшируем только собственные GET-запросы
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    const shellUrl = at('./index.html');
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(shellUrl, copy));
          return response;
        })
        .catch(() => caches.match(shellUrl)),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      // Есть в кэше — отдаём сразу, сеть догоняет в фоне
      return cached || network;
    }),
  );
});
