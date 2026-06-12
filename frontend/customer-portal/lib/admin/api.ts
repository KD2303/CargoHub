const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const apiCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

async function doFetch(endpoint: string, options: RequestInit, token: string) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || 'API Error');
  }
  return data;
}

export async function adminFetch(endpoint: string, options: RequestInit = {}, forceRefresh = false) {
  let token = '';
  try {
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('adminToken') || '';
    }
  } catch (e) {
    console.error('Failed to get auth token', e);
  }

  const isGet = !options.method || options.method.toUpperCase() === 'GET';

  if (isGet && !forceRefresh) {
    const cached = apiCache.get(endpoint);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      // Fire background refresh (stale-while-revalidate)
      doFetch(endpoint, options, token).then(data => {
        apiCache.set(endpoint, { data, timestamp: Date.now() });
      }).catch(console.error);
      return cached.data; // Return cached instantly
    }
  }

  // Clear all cache on mutations so we don't serve stale data after an update
  if (!isGet) {
    apiCache.clear();
  }

  const data = await doFetch(endpoint, options, token);
  
  if (isGet) {
    apiCache.set(endpoint, { data, timestamp: Date.now() });
  }
  
  return data;
}
