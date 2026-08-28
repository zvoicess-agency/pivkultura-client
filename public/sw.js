/* eslint-disable no-restricted-globals */

// Меняйте версию (например, v2, v3), когда хотите принудительно обновить кэш у пользователей
const CACHE_NAME = 'pivkultura-v1';

// Файлы, которые можно безопасно закэшировать (картинки, иконки, стили)
// ВНИМАНИЕ: index.html сюда лучше не добавлять!
const ASSETS_TO_CACHE = [
  '/icon.png',
  '/badge.png',
  // если есть другие статические картинки
];

// 1. Установка: сохраняем статику в кэш
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Активация: удаляем старые кэши, если версия изменилась
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Удаляем старый кэш:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

// 3. Перехват запросов (Стратегия: сеть с фоллбеком на кэш)
self.addEventListener('fetch', (event) => {
  // Для обычных страниц (HTML) всегда идем в сеть, чтобы не словить застрявшую версию
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }

  // Для остальных файлов (картинки, стили) — сначала сеть, если нет — из кэша
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// 4. Пуш-уведомления
self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : { title: 'Пивкультура', body: 'Новое уведомление!' };
    
    const options = {
        body: data.body,
        icon: '/icon.png',
        badge: '/badge.png'
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});