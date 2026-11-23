// Service Worker do RachaAI: guarda a casca do app (HTML, JS, CSS, ícones) para abrir instantaneamente no celular (mesmo com internet fraca no bar).
// O build (vite.config.ts) injeta VERSAO e ARQUIVOS e grava em dist/sw.js.
const VERSAO = '__VERSAO__';
const ARQUIVOS = __ARQUIVOS__;
const CACHE = 'rachaai-' + VERSAO;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ARQUIVOS.map((a) => new Request(a, { cache: 'reload' }))))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith('rachaai-') && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'atualizar') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Apenas requisições GET para o mesmo domínio
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // Navegações de página: estratégia Stale-While-Revalidate com timeout de 4s
  if (req.mode === 'navigate') {
    return e.respondWith(abrirPagina(req));
  }

  e.respondWith(
    caches.match(req, { cacheName: CACHE, ignoreVary: true }).then((r) => r || fetch(req))
  );
});

async function abrirPagina(req) {
  const rede = fetch(req);
  rede.catch(() => {});
  try {
    const r = await Promise.race([rede, new Promise((ok) => setTimeout(ok, 4000))]);
    if (r && r.ok) return r;
    const guardado = await caches.match('/', { cacheName: CACHE, ignoreVary: true });
    if (guardado) return guardado;
    if (r) return r;
  } catch {
    // Modo offline / sem rede
  }
  return (await caches.match('/', { cacheName: CACHE, ignoreVary: true })) || rede;
}
