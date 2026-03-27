// utils/fetchWithAuth.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // token 无效或过期，跳转到登录页
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('请重新登录');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || '请求失败');
  }

  return res.json();
};