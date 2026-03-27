'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  points?: number;
  level?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string, user: User, remember?: boolean) => void; // 增加 remember 参数
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 初始化时读取存储（优先 localStorage，其次 sessionStorage）
  useEffect(() => {
    let storedToken = localStorage.getItem('token');
    let storedUser = localStorage.getItem('user');
    if (!storedToken) {
      storedToken = sessionStorage.getItem('token');
      storedUser = sessionStorage.getItem('user');
    }
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
      } catch (e) {
        console.error('解析用户信息失败', e);
      }
    }
    setIsLoading(false);
  }, []);

  // 登录方法，增加 remember 参数
  const login = (token: string, user: User, remember = false) => {
    if (remember) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
    }
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const updateUser = (user: User) => {
    // 更新存储中的用户信息（同时更新 localStorage 和 sessionStorage 中存在的那个）
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      localStorage.setItem('user', JSON.stringify(user));
    } else if (sessionStorage.getItem('token')) {
      sessionStorage.setItem('user', JSON.stringify(user));
    }
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoggedIn: !!user,
      isLoading,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};