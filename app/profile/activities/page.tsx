'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';

interface UserActivity {
  _id: string;
  title: string;           // 活动标题
  date: string;            // 活动日期
  status: string;          // registered, attended, cancelled
  registeredAt: string;
}

export default function ActivitiesPage() {
  const { isLoggedIn } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchActivities = async () => {
      try {
        const res = await apiFetch('/api/profile/activities');
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        } else {
          setError('获取活动列表失败');
        }
      } catch (err) {
        console.error(err);
        setError('网络错误');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [isLoggedIn]);

  if (loading) {
    return (
      <>
        <Header isLoggedIn={isLoggedIn} onLoginClick={() => {}} />
        <div className="min-h-screen pt-16 flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLoginClick={() => {}} />
      <main className="min-h-screen pt-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/profile" className="inline-flex items-center text-primary-600 hover:underline">
              <FaArrowLeft className="mr-1" /> 返回个人中心
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-6">我的活动</h1>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-10">暂无报名记录</p>
          ) : (
            <div className="space-y-4">
              {activities.map(activity => (
                <div key={activity._id} className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                  <h3 className="text-xl font-semibold">{activity.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">日期：{new Date(activity.date).toLocaleDateString()}</p>
                  <p className="text-gray-600 text-sm">报名时间：{new Date(activity.registeredAt).toLocaleString()}</p>
                  <div className="mt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                      activity.status === 'registered' ? 'bg-green-100 text-green-700' :
                      activity.status === 'attended' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {activity.status === 'registered' ? '已报名' :
                       activity.status === 'attended' ? '已参加' : '已取消'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}