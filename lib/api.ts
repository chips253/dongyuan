const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = { ...options.headers };
  
  // 如果 body 不是 FormData，则设置 Content-Type 为 application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  return response;
}