'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCalendarAlt, FaMapMarkerAlt, FaArrowLeft, FaPlus } from 'react-icons/fa';
import Header from '@/components/Header';
import ActivityModal, { Activity } from '@/components/ActivityModal';
import CreateActivityModal from '@/components/CreateActivityModal';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';

export default function ActivitiesPage() {
  const { isLoggedIn } = useAuth(); // 从认证上下文获取真实登录状态
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取活动列表
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await apiFetch('/api/activities?limit=100');
        if (!res.ok) throw new Error('获取活动失败');
        const data = await res.json();
        // 兼容直接返回数组或 { activities: [...] } 结构
        setActivities(Array.isArray(data) ? data : data.activities || []);
      } catch (err) {
        console.error(err);
        setError('加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const closeActivityModal = () => setSelectedActivity(null);

  const handleActivityCreated = (newActivity: Activity) => {
    setActivities(prev => [newActivity, ...prev]);
  };

  const handleCreateActivity = () => {
    if (!isLoggedIn) {
      alert('请先登录后再发起活动');
      return;
    }
    setIsCreateModalOpen(true);
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLoginClick={() => {}} />
      <main className="min-h-screen pt-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* 面包屑导航 */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary-600 transition">首页</Link>
            <span>/</span>
            <Link href="/community" className="hover:text-primary-600 transition">社群中心</Link>
            <span>/</span>
            <span className="text-gray-700">全部活动</span>
          </div>

          {/* 页面标题和按钮行 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-0">全部活动</h1>
            <div className="flex space-x-3">
              <Link
                href="/community"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 border border-primary-200 px-4 py-2 rounded-full"
              >
                <FaArrowLeft />
                <span>返回社群中心</span>
              </Link>
              <button
                onClick={handleCreateActivity}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-full hover:bg-primary-700 transition"
              >
                <FaPlus />
                <span>发起活动</span>
              </button>
            </div>
          </div>

          {/* 活动列表网格 */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map(activity => (
                <div
                  key={activity._id}
                  onClick={() => setSelectedActivity(activity)}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition border border-gray-100 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      activity.type === 'hiking' ? 'bg-green-100 text-green-700' :
                      activity.type === 'workshop' ? 'bg-blue-100 text-blue-700' :
                      activity.type === 'talk' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {activity.type === 'hiking' ? '徒步' :
                       activity.type === 'workshop' ? '工作坊' :
                       activity.type === 'talk' ? '分享会' : '社交'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {activity.participants}/{activity.maxParticipants || '∞'} 人
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold mb-2 text-gray-800">{activity.title}</h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.description || activity.title}</p>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-400" size={14} />
                      {activity.date} {activity.time}
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-gray-400" size={14} />
                      {activity.location}
                    </div>
                  </div>

                  <div className="text-center text-primary-600 font-medium text-sm">点击查看详情</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 活动详情模态框 */}
      <ActivityModal
        activity={selectedActivity}
        isLoggedIn={isLoggedIn}
        onClose={closeActivityModal}
      />

      {/* 发起活动模态框 */}
      <CreateActivityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSuccess={handleActivityCreated}
      />
    </>
  );
}