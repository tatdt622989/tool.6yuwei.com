import type { APIRoute } from 'astro';

// Kill switch. The site is intentionally online-only (every visit should load ads), so no service
// worker is registered. This file stays so any browser that installed an earlier caching worker
// replaces it with this one, which deletes all caches and unregisters itself.
const source = `self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister()),
  );
});
`;

export const GET: APIRoute = () =>
  new Response(source, { headers: { 'Content-Type': 'application/javascript; charset=utf-8' } });
