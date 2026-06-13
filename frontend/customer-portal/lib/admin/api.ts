export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const _fetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  }
  
  return res;
};

// Named exports — both names used across codebase
export const fetchApi = _fetch;
export const adminFetch = async (endpoint: string, options: RequestInit = {}) => {
  const res = await _fetch(endpoint, options);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = {};
  }
  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
};

// Cache for GET requests
const CACHE = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 30_000;

export async function adminFetchCached(endpoint: string): Promise<any> {
  const cached = CACHE.get(endpoint);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
  const res = await _fetch(endpoint);
  const data = await res.json();
  CACHE.set(endpoint, { data, ts: Date.now() });
  return data;
}
