'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  FaUser, FaSignInAlt, FaUserPlus, FaBars, 
  FaHome, FaCompass, FaUsers, FaImages, FaMapMarkedAlt,
  FaCog
} from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { isLoggedIn, user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: '首页', href: '/', icon: FaHome },
    { name: '产品包', href: '/products', icon: FaCompass },
    { name: '探索', href: '/explore', icon: FaMapMarkedAlt },
    { name: '社群中心', href: '/community', icon: FaUsers },
    { name: '共创案例', href: '/cases', icon: FaImages },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo 区域 */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative w-8 h-8">
              <Image
                src="/images/logo1-icon.png"
                alt="东源E栖谷"
                fill
                className="object-contain transition-transform group-hover:scale-110"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              东源E栖谷
            </span>
          </Link>

          {/* 桌面导航 */}
          <nav className="hidden md:flex items-center space-x-1 bg-white/50 backdrop-blur-sm rounded-full p-1 shadow-inner">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-4 py-2 rounded-full hover:bg-white hover:shadow-md transition flex items-center space-x-2"
              >
                <link.icon className="text-primary-500 text-sm" />
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>

          {/* 用户区域 - 桌面端 */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 transition"
                >
                  <FaUser />
                  <span>{user?.name || '个人中心'}</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  >
                    <FaCog />
                    <span>管理后台</span>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href={`/login?redirect=${encodeURIComponent(pathname)}`}
                  className="px-4 py-2 rounded-full hover:bg-gray-100 transition flex items-center space-x-2"
                >
                  <FaSignInAlt />
                  <span>登录</span>
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-full transition shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <FaUserPlus />
                  <span>注册</span>
                </Link>
              </>
            )}
          </div>

          {/* 移动端菜单按钮 */}
          <button
            className="md:hidden text-2xl text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <FaBars />
          </button>
        </div>

        {/* 移动端下拉菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 bg-white/90 backdrop-blur-md rounded-b-2xl shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block py-3 px-4 hover:bg-gray-50 transition flex items-center space-x-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="text-primary-500" />
                <span>{link.name}</span>
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2 px-4">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="block py-3 px-4 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    个人中心
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block py-3 px-4 hover:bg-gray-50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      管理后台
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-3 px-4 hover:bg-gray-50 rounded-lg text-red-600"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    className="block py-3 px-4 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    登录
                  </Link>
                  <Link
                    href="/register"
                    className="block py-3 px-4 bg-primary-600 text-white rounded-lg text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}