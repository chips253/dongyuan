'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaCalendarAlt, FaComments, FaUsers, FaHiking, 
  FaLaptop, FaHandshake, FaCoffee, FaQrcode, FaArrowRight,
  FaTimes, FaPlus
} from 'react-icons/fa';
import Header from '@/components/Header';
import ActivityModal, { Activity } from '@/components/ActivityModal';
import TopicModal, { Topic } from '@/components/TopicModal';
import CreateTopicModal from '@/components/CreateTopicModal';
import CreateActivityModal from '@/components/CreateActivityModal';
import { useAuth } from '@/contexts/AuthContext';

// 类型定义
interface BuddyCategory {
  _id: string;
  name: string;
  description: string;
  icon: string;
  qrCode: string;
  groupLink: string;
  order: number;
}

interface WechatHighlight {
  _id: string;
  title: string;
  excerpt: string;
  messages: Array<{
    sender: string;
    avatar?: string;
    content: string;
    time: string;
    isSelf?: boolean;
  }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

// 图标映射
const iconMap: Record<string, React.ElementType> = {
  FaHiking, FaLaptop, FaHandshake, FaCoffee,
};

export default function CommunityPage() {
  const { isLoggedIn } = useAuth();
  const [selectedQr, setSelectedQr] = useState<BuddyCategory | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isTopicCreateModalOpen, setIsTopicCreateModalOpen] = useState(false);
  const [isActivityCreateModalOpen, setIsActivityCreateModalOpen] = useState(false);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [buddies, setBuddies] = useState<BuddyCategory[]>([]);
  const [wechatHighlights, setWechatHighlights] = useState<WechatHighlight[]>([]);

  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingBuddies, setLoadingBuddies] = useState(true);
  const [loadingWechat, setLoadingWechat] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取活动列表（兼容数组或对象返回）
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/activities?limit=10`);
        if (!res.ok) throw new Error('获取活动失败');
        const data = await res.json();
        // 兼容两种返回格式：直接数组 或 { activities: [...] }
        const activitiesData = Array.isArray(data) ? data : data.activities;
        const validActivities = (activitiesData || [])
          .filter(act => act && typeof act === 'object') // 过滤掉 null/undefined
          .slice(0, 4);
        setActivities(validActivities);
      } catch (err) {
        console.error(err);
        setError('活动加载失败');
      } finally {
        setLoadingActivities(false);
      }
    };
    fetchActivities();
  }, []);

  // 获取话题列表
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/topics?limit=10`);
        if (!res.ok) throw new Error('获取话题失败');
        const data = await res.json();
        const topicsData = Array.isArray(data) ? data : data.topics;
        const validTopics = (topicsData || []).filter(t => t && typeof t === 'object').slice(0, 4);
        setTopics(validTopics);
      } catch (err) {
        console.error(err);
        setError('话题加载失败');
      } finally {
        setLoadingTopics(false);
      }
    };
    fetchTopics();
  }, []);

  // 获取搭子类别
  useEffect(() => {
    const fetchBuddies = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/buddies`);
        if (!res.ok) throw new Error('获取搭子类别失败');
        const data = await res.json();
        setBuddies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBuddies(false);
      }
    };
    fetchBuddies();
  }, []);

  // 获取微信群精选
  useEffect(() => {
    const fetchWechat = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/wechat`);
        if (!res.ok) throw new Error('获取微信群精选失败');
        const data = await res.json();
        setWechatHighlights(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingWechat(false);
      }
    };
    fetchWechat();
  }, []);

  const closeQrModal = () => setSelectedQr(null);
  const closeActivityModal = () => setSelectedActivity(null);
  const closeTopicModal = () => setSelectedTopic(null);

  const handleTopicCreated = (newTopic: Topic) => {
    setTopics(prev => [newTopic, ...prev].slice(0, 4));
  };

  // 关键修改：活动创建成功后，将新活动添加到列表顶部，最多保留4条
  const handleActivityCreated = (newActivity: Activity) => {
    setActivities(prev => [newActivity, ...prev].slice(0, 4));
  };

  const handleActivitySignup = (activity: Activity) => {
    if (!isLoggedIn) {
      alert('请先登录后再报名');
      return;
    }
    alert(`报名成功！活动：${activity.title}`);
  };

  const handleCreateActivity = () => {
    if (!isLoggedIn) {
      alert('请先登录后再发起活动');
      return;
    }
    setIsActivityCreateModalOpen(true);
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLoginClick={() => {}} />
      <main className="min-h-screen pt-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent">
              社群中心
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              连接志同道合的伙伴，参与精彩活动，分享你的故事
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：活动日历 */}
            <div className="lg:col-span-1">
              <div className="backdrop-blur-md bg-white/30 rounded-3xl p-6 shadow-xl border border-white/40 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold flex items-center text-gray-800">
                    <FaCalendarAlt className="mr-2 text-primary-500" />
                    近期活动
                  </h2>
                  <button
                    onClick={handleCreateActivity}
                    className="flex items-center space-x-1 text-sm bg-primary-600 text-white px-3 py-1.5 rounded-full hover:bg-primary-700 transition"
                  >
                    <FaPlus size={12} />
                    <span>发起活动</span>
                  </button>
                </div>
                {loadingActivities ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map(activity => activity && (
                      <div
                        key={activity._id || activity.id}
                        onClick={() => setSelectedActivity(activity)}
                        className="bg-white/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition border border-gray-100 cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">{activity.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
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
                        <div className="text-sm text-gray-500 space-y-1 mb-2">
                          <div>📅 {activity.date} {activity.time}</div>
                          <div>📍 {activity.location}</div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">
                            👥 {activity.participants}/{activity.maxParticipants || '不限'} 人
                          </span>
                          <span className="text-primary-600 font-medium">点击查看详情</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-white/50 text-center">
                  <Link
                    href="/activities"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center group"
                  >
                    查看全部活动
                    <FaArrowRight className="ml-1 text-xs group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 中间：话题广场 */}
            <div className="lg:col-span-1">
              <div className="backdrop-blur-md bg-white/30 rounded-3xl p-6 shadow-xl border border-white/40">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold flex items-center text-gray-800">
                    <FaComments className="mr-2 text-primary-500" />
                    话题广场
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          alert('请先登录后再发布话题');
                          return;
                        }
                        setIsTopicCreateModalOpen(true);
                      }}
                      className="flex items-center space-x-1 text-sm bg-primary-600 text-white px-3 py-1.5 rounded-full hover:bg-primary-700 transition"
                    >
                      <FaPlus size={12} />
                      <span>发布话题</span>
                    </button>
                    <Link
                      href="/topics"
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
                    >
                      进入 <FaArrowRight className="ml-1 text-xs" />
                    </Link>
                  </div>
                </div>
                {loadingTopics ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topics.map(topic => topic && (
                      <div
                        key={topic._id || topic.id}
                        onClick={() => setSelectedTopic(topic)}
                        className="bg-white/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition border border-gray-100 cursor-pointer"
                      >
                        <h3 className="font-semibold text-gray-800 mb-1 hover:text-primary-600">
                          {topic.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{topic.content}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {topic.tags?.map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-white text-[10px]">
                              {topic.author[0]}
                            </div>
                            <span>{topic.author}</span>
                            <span>· {new Date(topic.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex space-x-2">
  <span>❤️ {topic.likes}</span>
  <span>💬 {topic.commentsCount}</span>
</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧：搭子匹配 */}
            <div className="lg:col-span-1">
              <div className="backdrop-blur-md bg-white/30 rounded-3xl p-6 shadow-xl border border-white/40 sticky top-24">
                <h2 className="text-xl font-bold flex items-center mb-5 text-gray-800">
                  <FaUsers className="mr-2 text-primary-500" />
                  搭子匹配
                </h2>
                {loadingBuddies ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {buddies.map(category => (
                      <div
                        key={category._id}
                        className="bg-white/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition border border-gray-100"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                            {(iconMap[category.icon] || FaUsers)({ size: 20 })}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{category.name}</h3>
                            <p className="text-xs text-gray-500">{category.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div
                            onClick={() => setSelectedQr(category)}
                            className="relative w-32 h-32 bg-gray-100 rounded-lg mb-2 cursor-pointer hover:scale-105 transition border-2 border-primary-100 overflow-hidden"
                          >
                            <Image
                              src={category.qrCode}
                              alt={`${category.name}微信群二维码`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mb-2">点击二维码放大，微信扫码进群</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 二维码放大模态框 */}
      {selectedQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeQrModal}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedQr.name} 微信群</h3>
              <button onClick={closeQrModal} className="p-2 hover:bg-gray-100 rounded-full transition">
                <FaTimes size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden">
              <Image
                src={selectedQr.qrCode}
                alt={selectedQr.name}
                fill
                className="object-contain"
              />
            </div>
            <p className="text-center text-gray-600 mt-4 text-sm">
              扫描二维码，加入{selectedQr.name}群
            </p>
          </div>
        </div>
      )}

      {/* 活动详情模态框 */}
      <ActivityModal
        activity={selectedActivity}
        isLoggedIn={isLoggedIn}
        onClose={closeActivityModal}
        onSignup={handleActivitySignup}
      />

      {/* 话题详情模态框 */}
      <TopicModal
        topic={selectedTopic}
        onClose={closeTopicModal}
        isLoggedIn={isLoggedIn}
      />

      {/* 发布话题模态框 */}
      <CreateTopicModal
        isOpen={isTopicCreateModalOpen}
        onClose={() => setIsTopicCreateModalOpen(false)}
        onCreateSuccess={handleTopicCreated}
      />

      {/* 发起活动模态框 */}
      <CreateActivityModal
        isOpen={isActivityCreateModalOpen}
        onClose={() => setIsActivityCreateModalOpen(false)}
        onCreateSuccess={handleActivityCreated}
      />
    </>
  );
}