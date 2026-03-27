'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle, FaListAlt, FaUser } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';

export interface Activity {
  _id?: string;          // MongoDB 自动生成的 _id
  id?: string;           // 前端自定义 id（可能使用）
  title: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants?: number;
  type: 'hiking' | 'workshop' | 'talk' | 'social';
  image?: string;
  description?: string;
  process?: string[];
  notes?: string[];
  organizer?: {
    name: string;
    avatar?: string;
    bio?: string;
  };
}

interface ActivityModalProps {
  activity: Activity | null;
  isLoggedIn: boolean;
  onClose: () => void;
  onApply?: (activity: Activity) => void; // 可选，自定义报名逻辑
}

export default function ActivityModal({ activity: propActivity, isLoggedIn, onClose, onApply }: ActivityModalProps) {
  const [activity, setActivity] = useState<Activity | null>(propActivity);
  const [joining, setJoining] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registerStatus, setRegisterStatus] = useState<string | null>(null);

  // 当传入的 activity 变化时，同步到本地状态
  useEffect(() => {
    setActivity(propActivity);
  }, [propActivity]);

  // 获取当前用户的报名状态
  useEffect(() => {
    if (!activity || !isLoggedIn || !activity._id) return;
    const fetchRegistration = async () => {
      try {
        const res = await apiFetch(`/api/activities/${activity._id}/registration`);
        if (res.ok) {
          const data = await res.json();
          setIsRegistered(data.registered);
          setRegisterStatus(data.status);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRegistration();
  }, [activity, isLoggedIn]);

  if (!activity) return null;

  const isFull = activity.maxParticipants && activity.participants >= activity.maxParticipants;

  const handleApply = async () => {
    // 如果父组件提供了自定义报名逻辑，则使用之
    if (onApply) {
      onApply(activity);
      return;
    }

    // 默认报名逻辑
    if (!isLoggedIn) {
      alert('请先登录后再报名');
      return;
    }

    if (isFull) {
      alert('活动已满员');
      return;
    }

    setJoining(true);
    try {
      const activityId = activity._id || activity.id;
      const res = await apiFetch(`/api/activities/${activityId}/join`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        // 更新本地活动状态，增加参与人数
        setActivity(prev => prev ? { ...prev, participants: data.participants } : null);
        setIsRegistered(true);
        setRegisterStatus('registered');
        alert('报名成功！');
      } else {
        const data = await res.json();
        alert(data.error || '报名失败');
      }
    } catch (err) {
      console.error(err);
      alert('网络错误，请稍后重试');
    } finally {
      setJoining(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('确定要取消报名吗？')) return;
    try {
      const activityId = activity._id || activity.id;
      const res = await apiFetch(`/api/activities/${activityId}/join`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        setActivity(prev => prev ? { ...prev, participants: data.participants } : null);
        setIsRegistered(false);
        setRegisterStatus(null);
        alert('取消报名成功');
      } else {
        const data = await res.json();
        alert(data.error || '取消失败');
      }
    } catch (err) {
      alert('网络错误');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* 关闭按钮 */}
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <FaTimes size={20} className="text-gray-500" />
          </button>
        </div>

        {/* 标题和类型标签 */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{activity.title}</h2>
          <span className={`text-sm px-3 py-1 rounded-full ml-2 ${
            activity.type === 'hiking' ? 'bg-green-100 text-green-700' :
            activity.type === 'workshop' ? 'bg-blue-100 text-blue-700' :
            activity.type === 'talk' ? 'bg-purple-100 text-purple-700' :
            'bg-orange-100 text-orange-700'
          }`}>
            {activity.type === 'hiking' ? '徒步' :
             activity.type === 'workshop' ? '工作坊' :
             activity.type === 'talk' ? '分享会' : '社交'}
          </span>
        </div>

        {/* 时间和地点 */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-gray-700">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-3 text-primary-500" />
            <span>{activity.date} {activity.time}</span>
          </div>
          <div className="flex items-center">
            <FaMapMarkerAlt className="mr-3 text-primary-500" />
            <span>{activity.location}</span>
          </div>
        </div>

        {/* 活动简介 */}
        {activity.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FaInfoCircle className="mr-2 text-primary-500" /> 活动简介
            </h3>
            <p className="text-gray-600 whitespace-pre-line">{activity.description}</p>
          </div>
        )}

        {/* 活动流程 */}
        {activity.process && activity.process.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FaListAlt className="mr-2 text-primary-500" /> 活动流程
            </h3>
            <ul className="space-y-2">
              {activity.process.map((step, index) => (
                <li key={index} className="flex items-start text-gray-600">
                  <span className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 注意事项 */}
        {activity.notes && activity.notes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FaInfoCircle className="mr-2 text-primary-500" /> 注意事项
            </h3>
            <ul className="space-y-1 text-gray-600">
              {activity.notes.map((note, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 mr-2"></span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 发起人信息 */}
        {activity.organizer && (
          <div className="mb-6 border-t border-gray-100 pt-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FaUser className="mr-2 text-primary-500" /> 发起人
            </h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                {activity.organizer.name[0]}
              </div>
              <div>
                <p className="font-medium text-gray-800">{activity.organizer.name}</p>
                {activity.organizer.bio && (
                  <p className="text-sm text-gray-500">{activity.organizer.bio}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 报名/取消按钮区域 */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">
              已报名 <span className="font-bold text-primary-600">{activity.participants}</span>
              {activity.maxParticipants && ` / ${activity.maxParticipants}`} 人
            </span>
            {isFull ? (
              <span className="text-red-500 font-medium">已满员</span>
            ) : (
              activity.maxParticipants && (
                <span className="text-green-600 font-medium">
                  剩余 {activity.maxParticipants - activity.participants} 名额
                </span>
              )
            )}
          </div>

          {isRegistered && registerStatus === 'registered' ? (
            <button
              onClick={handleCancel}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-full text-lg font-semibold transition shadow-md"
            >
              取消报名
            </button>
          ) : (
            <button
              onClick={handleApply}
              disabled={joining || isFull}
              className={`w-full py-3 rounded-full text-lg font-semibold transition shadow-md ${
                joining || isFull
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {joining ? '报名中...' : isFull ? '已满员' : '立即报名'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}