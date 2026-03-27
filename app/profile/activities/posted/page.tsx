'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaUsers, FaEye, FaCopy, FaCheck, FaCheckCircle } from 'react-icons/fa';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';

interface Activity {
  _id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  description?: string;
  participants: number;
  maxParticipants?: number;
  status: 'ongoing' | 'completed';
  createdAt: string;
}

interface Application {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
  };
  message: string;
  status: string;
  createdAt: string;
}

export default function PostedActivitiesPage() {
  const { isLoggedIn } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/profile/activities/posted');
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      } else {
        setError('获取活动失败');
      }
    } catch (err) {
      console.error(err);
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchActivities();
  }, [isLoggedIn]);

  const handleViewApplications = async (activity: Activity) => {
    setSelectedActivity(activity);
    setModalOpen(true);
    setLoadingApps(true);
    try {
      const res = await apiFetch(`/api/activities/${activity._id}/applications`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      } else {
        alert('获取申请列表失败');
      }
    } catch (err) {
      console.error(err);
      alert('网络错误');
    } finally {
      setLoadingApps(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCompleteActivity = async (activityId: string) => {
    if (!confirm('确定将该活动标记为已完成吗？')) return;
    try {
      const res = await apiFetch(`/api/activities/${activityId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });
      if (res.ok) {
        await fetchActivities();
        alert('活动已标记为已完成');
      } else {
        const data = await res.json();
        alert(data.error || '操作失败');
      }
    } catch (err) {
      alert('网络错误');
    }
  };

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

  if (error) {
    return (
      <>
        <Header isLoggedIn={isLoggedIn} onLoginClick={() => {}} />
        <div className="min-h-screen pt-16 text-center text-red-500">{error}</div>
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
          <h1 className="text-3xl font-bold mb-6">我发布的活动</h1>
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-10">暂无发布的活动</p>
          ) : (
            <div className="space-y-4">
              {activities.map(activity => (
                <div key={activity._id} className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-semibold">{activity.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          activity.status === 'ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {activity.status === 'ongoing' ? '进行中' : '已完成'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">
                        📅 {activity.date} {activity.time} &nbsp; 📍 {activity.location}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          类型：{activity.type}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          报名：{activity.participants}{activity.maxParticipants ? `/${activity.maxParticipants}` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => handleViewApplications(activity)}
                        className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm"
                      >
                        <FaUsers size={14} />
                        <span>查看申请</span>
                      </button>
                      {activity.status === 'ongoing' && (
                        <button
                          onClick={() => handleCompleteActivity(activity._id)}
                          className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm"
                        >
                          <FaCheckCircle size={14} />
                          <span>标记为已完成</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 申请列表模态框 */}
      {modalOpen && selectedActivity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">申请列表 - {selectedActivity.title}</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                ✕
              </button>
            </div>
            {loadingApps ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
              </div>
            ) : applications.length === 0 ? (
              <p className="text-gray-500 text-center py-10">暂无申请</p>
            ) : (
              <div className="space-y-4">
                {applications.map(app => (
                  <div key={app._id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{app.userId.name}</p>
                        <p className="text-sm text-gray-500">{app.userId.email}</p>
                        {app.userId.phone && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">{app.userId.phone}</span>
                            <button
                              onClick={() => copyToClipboard(app.userId.phone, `phone-${app._id}`)}
                              className="text-gray-400 hover:text-primary-600"
                              title="复制电话"
                            >
                              {copiedField === `phone-${app._id}` ? <FaCheck size={12} /> : <FaCopy size={12} />}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(app.userId.email, `email-${app._id}`)}
                          className="text-gray-400 hover:text-primary-600 flex items-center gap-1 text-sm"
                          title="复制邮箱"
                        >
                          {copiedField === `email-${app._id}` ? <FaCheck size={12} /> : <FaCopy size={12} />}
                          复制邮箱
                        </button>
                        {app.message && (
                          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                            留言: {app.message}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      申请时间：{new Date(app.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}