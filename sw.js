/* 墨影书城 · Service Worker（PWA 壳）
   策略（L3）：构建期注入 sw-assets.json（shell 清单 + 静态资源清单）；
   - 静态资源（assets/*）：stale-while-revalidate（缓存优先 + 后台网络更新）
   - 导航请求：网络优先 → 回退缓存的入口页
   - 业务接口 /api/* 一律直连，不缓存
   注意：业务数据（localStorage / IndexedDB）不在 SW 缓存范围，不会被污染。 */
const CACHE = 'moying-shell-20261026210217';
const MANIFEST_URL = './sw-assets.json';

async function loadManifest() {
  // 首次安装时网络可能不稳（连接黑洞/超时），重试最多 3 次、单次 12s 超时，
  // 避免清单拉取失败导致 shell 预缓存为空、刷新全走网络而卡顿
  for (let attempt = 0; attempt < 3; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    try {
      const res = await fetch(MANIFEST_URL, { cache: 'no-store', signal: ctrl.signal });
      clearTimeout(timer);
      return res.ok ? res.json() : null;
    } catch {
      clearTimeout(timer);
      /* 下一次重试 */
    }
  }
  return null;
}

self.addEventListener('install', (e) => {
  // 新版本立即进入等待→接管：配合页面端 controllerchange 自动刷新，实现"打开即最新"，
  // 不再让用户手动清缓存（旧缓存由 activate 统一清理）。
  self.skipWaiting();
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
  // 运行时配置必须每次取最新（改了出口通道后刷新即生效），不缓存
  if (url.pathname.endsWith('/config.js')) {
    e.respondWith(fetch(req, { cache: 'no-store' }).catch(() => caches.match(req)));
    return;
  }

  // 导航请求：网络优先，但带 3.5s 兜底超时——弱网/后端瞬时不可达时立即回退缓存入口页，
  // 避免刷新长时间白屏"加载不出来"；离线回退精确入口页（admin.html 打开管理端），再回退缓存 index.html
  if (req.mode === 'navigate') {
    e.respondWith(
      Promise.race([
        // 导航响应不再写入缓存：入口页一旦被旧版 HTML 占位，回退时就会带出
        // 旧 chunk（旧播放器、旧下载入口），新版本要等缓存自然过期才生效。
        fetch(req),
        new Promise((_, reject) => setTimeout(() => reject(new Error('nav-timeout')), 3500)),
      ]).catch(async () => {
        const path = new URL(req.url).pathname;
        const exact = await caches.match(path);
        return exact || (await caches.match('./')) || (await caches.match('./index.html'));
      })
    );
    return;
  }

  // 静态资源：stale-while-revalidate（缓存优先，命中秒开；后台网络更新，失败回退缓存）
  // 缓存写入前校验 Content-Type：HTML 冒充 JS/CSS/JSON 的坏响应（SPA fallback 产物）绝不入缓存，
  // 从根上防止坏缓存长期生效；SW 版本升级（activate）同时整体清空旧缓存
  if (url.pathname.includes('/assets/') || url.pathname.endsWith('/sw-assets.json')) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const ct = (res.headers.get('content-type') || '').toLowerCase();
              const isHtmlMasquerade = ct.includes('text/html') && !/\.html?$/.test(url.pathname);
              if (!isHtmlMasquerade) {
                const copy = res.clone();
                caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => null);
              }
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
