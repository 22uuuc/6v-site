/* 墨影书城 · Service Worker（PWA 壳）
   策略（L3）：构建期注入 sw-assets.json（shell 清单 + 静态资源清单）；
   - 静态资源（assets/*）：stale-while-revalidate（缓存优先 + 后台网络更新）
   - 导航请求：网络优先 → 回退缓存的入口页
   - 业务接口 /api/* 一律直连，不缓存
   注意：业务数据（localStorage / IndexedDB）不在 SW 缓存范围，不会被污染。 */
const CACHE = 'moying-shell-v3';
const MANIFEST_URL = './sw-assets.json';

async function loadManifest() {
  try {
    const res = await fetch(MANIFEST_URL, { cache: 'no-store' });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const manifest = await loadManifest();
    if (manifest && Array.isArray(manifest.shell) && manifest.shell.length) {
      // 分批预缓存，避免单次 addAll 列表过大
      const chunkSize = 25;
      for (let i = 0; i < manifest.shell.length; i += chunkSize) {
        await cache.addAll(manifest.shell.slice(i, i + chunkSize)).catch(() => null);
      }
    }
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // 只接管同源请求；GitHub raw 云端内容库走网络直连，不缓存
  if (url.origin !== self.location.origin) return;
  // 业务接口一律直连，不缓存、不干预
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return;

  // 导航请求：网络优先，离线先回退精确入口页（admin.html 打开管理端），再回退缓存的 index.html
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./', copy)).catch(() => null);
          return res;
        })
        .catch(async () => {
          const path = new URL(req.url).pathname;
          const exact = await caches.match(path);
          return exact || (await caches.match('./')) || (await caches.match('./index.html'));
        })
    );
    return;
  }

  // 静态资源：stale-while-revalidate（缓存优先，后台网络刷新；离线直接回缓存）
  if (url.pathname.includes('/assets/') || url.pathname.endsWith('/sw-assets.json')) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => null);
            }
            return res;
          })
          .catch(() => hit);
        return hit || network;
      })
    );
    return;
  }

  // 其它同源 GET：网络优先回退缓存
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => null);
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});

/* ---------- C10 手机推送：接收服务端 Web Push → 显示系统通知 ---------- */
self.addEventListener('push', (e) => {
  let data = { title: '墨影书城', body: '', url: '/', tag: 'moying' };
  try {
    if (e.data) data = { ...data, ...e.data.json() };
  } catch {
    try { data.body = e.data ? e.data.text() : ''; } catch { /* 忽略非 JSON 载荷 */ }
  }
  e.waitUntil(
    self.registration.showNotification(data.title || '墨影书城', {
      body: data.body || '',
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: data.tag || 'moying',
      data: { url: data.url || '/' },
    }),
  );
});

/* 点击通知：聚焦已有窗口或新开 */
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if (c.url.includes(url) && 'focus' in c) return c.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow(url);
    return undefined;
  })());
});
