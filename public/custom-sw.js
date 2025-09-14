/**
 * Custom Service Worker with advanced caching strategies
 * This file implements cache-first, network-first, and stale-while-revalidate strategies
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-assets-cache-${CACHE_VERSION}`;
const API_CACHE = `api-cache-${CACHE_VERSION}`;
const PAGES_CACHE = `pages-cache-${CACHE_VERSION}`;
const FONTS_CACHE = `fonts-cache-${CACHE_VERSION}`;
const IMAGES_CACHE = `images-cache-${CACHE_VERSION}`;

// Cache configurations
const CACHE_CONFIGS = {
  [STATIC_CACHE]: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 days
  [API_CACHE]: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }, // 24 hours
  [PAGES_CACHE]: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7 days
  [FONTS_CACHE]: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }, // 1 year
  [IMAGES_CACHE]: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 days
};

// URL patterns for different cache strategies
const CACHE_PATTERNS = {
  static: /\.(js|css|woff|woff2|ttf|eot|ico|png|jpg|jpeg|gif|svg|webp)$/i,
  api: /\/api\//,
  fonts: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
  images: /\/_next\/image\?/,
  pages: /\.html$|\/$/,
};

/**
 * Install event - precache essential resources
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // Precache essential resources
      return cache.addAll([
        '/',
        '/manifest.json',
        // Add other essential resources here
      ]);
    }).then(() => {
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

/**
 * Activate event - cleanup old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Claim all clients
      self.clients.claim(),
      // Cleanup old caches
      cleanupOldCaches(),
    ])
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine caching strategy based on URL pattern
  if (CACHE_PATTERNS.static.test(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (CACHE_PATTERNS.api.test(url.pathname)) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
  } else if (CACHE_PATTERNS.fonts.test(url.href)) {
    event.respondWith(cacheFirstStrategy(request, FONTS_CACHE));
  } else if (CACHE_PATTERNS.images.test(url.href)) {
    event.respondWith(staleWhileRevalidateStrategy(request, IMAGES_CACHE));
  } else if (CACHE_PATTERNS.pages.test(url.pathname)) {
    event.respondWith(staleWhileRevalidateStrategy(request, PAGES_CACHE));
  } else {
    // Default to network first for other requests
    event.respondWith(networkFirstStrategy(request, PAGES_CACHE));
  }
});

/**
 * Message event - handle commands from main thread
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CLEANUP_CACHES':
      event.waitUntil(cleanupCaches());
      break;
    case 'WARM_CACHE':
      if (payload?.urls) {
        event.waitUntil(warmCache(payload.urls));
      }
      break;
    case 'GET_CACHE_STATUS':
      event.waitUntil(
        getCacheStatus().then((status) => {
          event.ports[0]?.postMessage({ type: 'CACHE_STATUS', payload: status });
        })
      );
      break;
  }
});

/**
 * Cache-first strategy: Check cache first, fallback to network
 */
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse && !isExpired(cachedResponse, cacheName)) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = addTimestamp(networkResponse.clone());
      await cache.put(request, responseToCache);
      await enforceMaxEntries(cache, cacheName);
    }

    return networkResponse;
  } catch (error) {
    console.error('Cache-first strategy failed:', error);
    
    // Try to return stale cache as fallback
    const cache = await caches.open(cacheName);
    const staleResponse = await cache.match(request);
    if (staleResponse) {
      return staleResponse;
    }
    
    throw error;
  }
}

/**
 * Network-first strategy: Try network first, fallback to cache
 */
async function networkFirstStrategy(request, cacheName, timeout = 3000) {
  try {
    const cache = await caches.open(cacheName);
    
    // Race network request against timeout
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    );

    try {
      const networkResponse = await Promise.race([networkPromise, timeoutPromise]);
      
      if (networkResponse.ok) {
        const responseToCache = addTimestamp(networkResponse.clone());
        await cache.put(request, responseToCache);
        await enforceMaxEntries(cache, cacheName);
      }

      return networkResponse;
    } catch (networkError) {
      // Network failed or timed out, try cache
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      throw networkError;
    }
  } catch (error) {
    console.error('Network-first strategy failed:', error);
    throw error;
  }
}

/**
 * Stale-while-revalidate strategy: Return cache immediately, update in background
 */
async function staleWhileRevalidateStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    // Start network request in background
    const networkPromise = fetch(request).then(async (networkResponse) => {
      if (networkResponse.ok) {
        const responseToCache = addTimestamp(networkResponse.clone());
        await cache.put(request, responseToCache);
        await enforceMaxEntries(cache, cacheName);
      }
      return networkResponse;
    }).catch((error) => {
      console.warn('Background update failed:', error);
    });

    // Return cached response immediately if available
    if (cachedResponse && !isExpired(cachedResponse, cacheName)) {
      // Don't await the network promise - let it update in background
      networkPromise;
      return cachedResponse;
    }

    // No cache or expired, wait for network
    return await networkPromise;
  } catch (error) {
    console.error('Stale-while-revalidate strategy failed:', error);
    throw error;
  }
}

/**
 * Add timestamp to response for expiration tracking
 */
function addTimestamp(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', new Date().toISOString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Check if cached response is expired
 */
function isExpired(response, cacheName) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return false;

  const config = CACHE_CONFIGS[cacheName];
  if (!config?.maxAgeSeconds) return false;

  const cachedTime = new Date(cachedAt).getTime();
  const now = Date.now();
  return (now - cachedTime) > (config.maxAgeSeconds * 1000);
}

/**
 * Enforce maximum entries in cache
 */
async function enforceMaxEntries(cache, cacheName) {
  const config = CACHE_CONFIGS[cacheName];
  if (!config?.maxEntries) return;

  const keys = await cache.keys();
  if (keys.length <= config.maxEntries) return;

  // Remove oldest entries
  const entriesToRemove = keys.length - config.maxEntries;
  for (let i = 0; i < entriesToRemove; i++) {
    await cache.delete(keys[i]);
  }
}

/**
 * Cleanup old caches from previous versions
 */
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = Object.values(CACHE_CONFIGS).map(config => config.name);
  
  const oldCaches = cacheNames.filter(name => 
    !Object.keys(CACHE_CONFIGS).includes(name) && 
    name.includes('cache')
  );

  await Promise.all(
    oldCaches.map(cacheName => caches.delete(cacheName))
  );
}

/**
 * Cleanup expired entries from all caches
 */
async function cleanupCaches() {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    if (!CACHE_CONFIGS[cacheName]) continue;
    
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response && isExpired(response, cacheName)) {
        await cache.delete(request);
      }
    }
  }
}

/**
 * Warm cache with specified URLs
 */
async function warmCache(urls) {
  const promises = urls.map(async (url) => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        // Determine appropriate cache based on URL
        let cacheName = PAGES_CACHE; // default
        
        if (CACHE_PATTERNS.static.test(url)) {
          cacheName = STATIC_CACHE;
        } else if (CACHE_PATTERNS.api.test(url)) {
          cacheName = API_CACHE;
        } else if (CACHE_PATTERNS.fonts.test(url)) {
          cacheName = FONTS_CACHE;
        } else if (CACHE_PATTERNS.images.test(url)) {
          cacheName = IMAGES_CACHE;
        }
        
        const cache = await caches.open(cacheName);
        const responseToCache = addTimestamp(response.clone());
        await cache.put(url, responseToCache);
      }
    } catch (error) {
      console.warn(`Failed to warm cache for ${url}:`, error);
    }
  });

  await Promise.allSettled(promises);
}

/**
 * Get cache status information
 */
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = [];

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    let totalSize = 0;
    for (const request of keys) {
      try {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      } catch {
        // Skip entries that can't be read
      }
    }

    status.push({
      name: cacheName,
      entryCount: keys.length,
      size: totalSize,
      lastAccessed: new Date().toISOString(),
    });
  }

  return status;
}

console.log('Custom Service Worker loaded');