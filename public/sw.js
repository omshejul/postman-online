const CACHE_NAME = 'api-tester-v1';
const STATIC_CACHE_NAME = 'api-tester-static-v1';
const API_CACHE_NAME = 'api-tester-api-v1';

// Cache duration for different types of content
const CACHE_DURATIONS = {
  static: 7 * 24 * 60 * 60 * 1000, // 1 week
  api: 60 * 60 * 1000, // 1 hour
  default: 24 * 60 * 60 * 1000, // 1 day
};

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/_next/static/',
  '/api/health',
];

// API endpoints that should be cached
const CACHEABLE_API_PATTERNS = [
  /^https:\/\/jsonplaceholder\.typicode\.com/,
  /^https:\/\/httpbin\.org/,
  /^https:\/\/reqres\.in/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old cache versions
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for caching
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request));
  } else if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request));
  }
});

// Check if request is for a static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/_next/') ||
         url.pathname.startsWith('/static/') ||
         url.pathname.includes('/favicon') ||
         url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$/);
}

// Check if request is for an API endpoint
function isApiRequest(request) {
  const url = new URL(request.url);
  return CACHEABLE_API_PATTERNS.some(pattern => pattern.test(request.url)) ||
         url.pathname.startsWith('/api/');
}

// Check if request is for a page
function isPageRequest(request) {
  const url = new URL(request.url);
  return request.headers.get('accept')?.includes('text/html');
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse, CACHE_DURATIONS.static)) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Static asset fetch failed', error);
    
    // Return cached version if available, even if expired
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a fallback response
    return new Response('Resource not available offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 5000)
      )
    ]);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', error.message);
    
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse, CACHE_DURATIONS.api)) {
      // Add a header to indicate this is from cache
      const response = cachedResponse.clone();
      response.headers.set('X-Served-From', 'cache');
      return response;
    }
    
    // Return a meaningful error response
    return new Response(JSON.stringify({
      error: 'Network unavailable and no cached response available',
      message: 'Please check your internet connection and try again',
      cached: false
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json',
        'X-Served-From': 'service-worker'
      }
    });
  }
}

// Handle page requests with network-first, cache fallback
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Page network failed, trying cache');
    
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page or fallback
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - API Tester</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 50px; }
            .offline { color: #666; }
          </style>
        </head>
        <body>
          <div class="offline">
            <h1>You're offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>
    `, {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'text/html'
      }
    });
  }
}

// Check if cached response is expired
function isExpired(response, maxAge) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return true;
  
  const responseDate = new Date(dateHeader);
  const now = new Date();
  
  return (now.getTime() - responseDate.getTime()) > maxAge;
}

// Handle background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'retry-failed-requests') {
    event.waitUntil(retryFailedRequests());
  }
});

// Retry failed requests when online
async function retryFailedRequests() {
  console.log('Service Worker: Retrying failed requests');
  // Implementation for retrying failed requests would go here
  // This could involve reading from IndexedDB where failed requests are stored
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/favicon-192x192.png',
      badge: '/favicon-192x192.png',
      tag: 'api-tester-notification'
    };
    
    event.waitUntil(
      self.registration.showNotification('API Tester', options)
    );
  }
});

// Clean up old cache entries periodically
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEANUP_CACHE') {
    event.waitUntil(cleanupCache());
  }
});

async function cleanupCache() {
  console.log('Service Worker: Cleaning up cache');
  
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response && isExpired(response, CACHE_DURATIONS.default)) {
        await cache.delete(request);
      }
    }
  }
}