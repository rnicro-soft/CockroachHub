const CACHE_PREFIX = "cockroachhub-cache-";

interface CacheEntry {
  data: any;
  fetchedAt: string;
}

export async function fetchWithCache<T>(url: string, key: string, fallback: T): Promise<T> {
  const cacheKey = CACHE_PREFIX + key;

  // Try to serve from cache first
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      const entry: CacheEntry = JSON.parse(cached);
      // Serve stale cache immediately, then refresh
      fetchAndCache(url, cacheKey);
      return entry.data as T;
    } catch {}
  }

  // Try network
  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const entry: CacheEntry = { data, fetchedAt: new Date().toISOString() };
      try { sessionStorage.setItem(cacheKey, JSON.stringify(entry)); } catch {}
      return data as T;
    }
  } catch {}

  // Try localStorage (persists across sessions)
  const stored = localStorage.getItem(cacheKey);
  if (stored) {
    try {
      const entry: CacheEntry = JSON.parse(stored);
      return entry.data as T;
    } catch {}
  }

  // Ultimate fallback
  return fallback;
}

async function fetchAndCache(url: string, cacheKey: string) {
  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const entry: CacheEntry = { data, fetchedAt: new Date().toISOString() };
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(entry));
        localStorage.setItem(cacheKey, JSON.stringify(entry));
      } catch {}
    }
  } catch {}
}

export function getCacheAge(key: string): string | null {
  const cacheKey = CACHE_PREFIX + key;
  const stored = sessionStorage.getItem(cacheKey) || localStorage.getItem(cacheKey);
  if (!stored) return null;
  try {
    const entry: CacheEntry = JSON.parse(stored);
    const diff = Date.now() - new Date(entry.fetchedAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  } catch {
    return null;
  }
}
