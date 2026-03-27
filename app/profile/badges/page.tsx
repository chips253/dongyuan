'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaMedal } from 'react-icons/fa';
import Header from '@/components/Header';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

interface Badge {
  id: number;
  name: string;
  description: string;
  condition?: string;
  obtained: boolean;
  active: boolean;
}

export default function BadgesPage() {
  const router = useRouter();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 获取称号列表
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        const data = await fetchWithAuth('/api/badges');
        setBadges(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [router]);

  // 设置激活称号
  const setActive = async (badgeName: string) => {
    try {
      await fetchWithAuth('/api/badges/activate', {
        method: 'POST',
        body: JSON.stringify({ badgeName }),
      });
      // 更新本地状态
      setBadges(prev =>
        prev.map(b => ({
          ...b,
          active: b.name === badgeName,
        }))
      );
    } catch (err: any) {
      alert('设置失败：' + err.message);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-16 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-16 flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Link href="/profile" className="inline-flex items-center text-primary-600 mb-4">
            <FaArrowLeft className="mr-1" /> 返回个人中心
          </Link>
          <h1 className="text-3xl font-bold mb-6">我的称号</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badges.map(badge => (
              <div
                key={badge.id}
                className={`bg-white rounded-xl p-4 shadow-md border ${
                  badge.obtained ? 'border-primary-200' : 'border-gray-200 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <FaMedal
                      className={`text-3xl ${badge.obtained ? 'text-primary-500' : 'text-gray-300'}`}
                    />
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {badge.name}
                        {badge.active && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            展示中
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">{badge.description}</p>
                    </div>
                  </div>
                  {badge.obtained ? (
                    !badge.active && (
                      <button
                        onClick={() => setActive(badge.name)}
                        className="text-primary-600 text-sm hover:underline"
                      >
                        设为展示
                      </button>
                    )
                  ) : (
                    <span className="text-xs text-gray-400">{badge.condition}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}