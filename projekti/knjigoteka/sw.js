const VERSION = "2.0.3";
const SHELL_CACHE = `knjigoteka-shell-${VERSION}`;
const API_CACHE = "knjigoteka-api";
const COVER_CACHE = "knjigoteka-covers";
const KEEP = [SHELL_CACHE, API_CACHE, COVER_CACHE];

const API_LIMIT = 150;
const COVER_LIMIT = 400;
const NETWORK_TIMEOUT = 7000;

const SHELL_FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/app.css",
  "js/theme-init.js",
  "js/app.bundle.js",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES.map((url) => new Request(url, { cache: "reload" }))))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names.filter((name) => name.startsWith("knjigoteka") && !KEEP.includes(name)).map((name) => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (request.mode === "navigate") {
      event.respondWith(appShell(request));
      return;
    }
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  if (url.hostname === "openlibrary.org" && /^\/(search\.json|works\/OL\d+W\.json|trending\/)/.test(url.pathname)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.hostname === "covers.openlibrary.org") {
    event.respondWith(cacheFirst(request, COVER_CACHE, COVER_LIMIT));
  }
});

async function appShell(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match("index.html");
  if (cached) return cached;
  try {
    return await fetch(request);
  } catch {
    return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}

async function cacheFirst(request, cacheName, limit) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: cacheName === SHELL_CACHE });
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok || response.type === "opaque") {
      await cache.put(request, response.clone());
      if (limit) trim(cacheName, limit);
    }
    return response;
  } catch {
    return Response.error();
  }
}

async function networkFirst(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const response = await withTimeout(fetch(request), NETWORK_TIMEOUT);
    if (response.ok) {
      await cache.put(request, response.clone());
      trim(API_CACHE, API_LIMIT);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ offline: true }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); }
    );
  });
}

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  await Promise.all(keys.slice(0, keys.length - max).map((key) => cache.delete(key)));
}
