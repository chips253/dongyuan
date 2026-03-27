'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaTachometerAlt, FaCalendarAlt, FaComments, FaImage,
  FaUsers, FaBoxOpen, FaCog, FaSignOutAlt
} from 'react-icons/fa';
import Header from '@/components/Header';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

interface DashboardStats {
  users: number;
  bookings: number;
  activities: number;
  topics: number;
  cases: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        const data = await fetchWithAuth('/api/admin/dashboard');
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <>
        <Header isLoggedIn={true} onLoginClick={() => {}} />
        <main className="min-h-screen pt-16 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header isLoggedIn={true} onLoginClick={() => {}} />
        <main className="min-h-screen pt-16 flex items-center justify-center text-red-500">
          {error}
        </main>
      </>
    );
  }

  const adminLinks = [
    { href: '/admin/users', icon: FaUsers, label: '用户管理', color: 'orange', stats: stats?.users },
  ];

  return (
    <>
      <Header isLoggedIn={true} onLoginClick={() => {}} />
      <main className="min-h-screen pt-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">管理后台</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {adminLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Icon className={`text-3xl text-${link.color}-600 mb-3`} />
                      <h2 className="text-xl font-semibold">{link.label}</h2>
                      {link.stats !== null && (
                        <p className="text-sm text-gray-500 mt-1">总计 {link.stats} 项</p>
                      )}
                    </div>
                    {link.stats !== null && (
                      <span className="text-2xl font-bold text-gray-700">{link.stats}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition flex items-center gap-2"
            >
              <FaSignOutAlt /> 返回前台
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}