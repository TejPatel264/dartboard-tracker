self.addEventListener('install', (e) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('activate', (e) => {
  console.log('Service Worker: Activated');
});

self.addEventListener('fetch', (e) => {
  // You can add caching here later if you want offline support
  console.log('Fetch intercepted for:', e.request.url);
});