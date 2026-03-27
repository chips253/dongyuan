'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaCompass, FaLightbulb, FaTree, FaCamera, FaUsers,
  FaHeart, FaComment, FaQrcode, FaTimes, FaArrowLeft, FaPlus,
  FaHiking, FaLaptop, FaHandshake, FaCoffee
} from 'react-icons/fa';
import Header from '@/components/Header';
import TopicModal, { Topic } from '@/components/TopicModal';
import CreateTopicModal from '@/components/CreateTopicModal';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api'; // 统一 API 请求工具

// 分类定义
const categories = [
  { id: 'guide', name: '旅居攻略', icon: FaCompass, description: '东源吃喝玩乐指南' },
  { id: 'creator', name: '创造者说', icon: FaLightbulb, description: '作品展示、项目招募' },
  { id: 'village', name: '乡村见闻', icon: FaTree, description: '游民眼中的东源故事' },
  { id: 'review', name: '活动回顾', icon: FaCamera, description: '往期活动图文精华' },
  { id: 'buddy', name: '搭子匹配', icon: FaUsers, description: '寻找徒步、学习、项目搭档' },
];

// 类型定义
interface BuddyCategory {
  _id: string;
  name: string;
  description: string;
  icon: string;
  qrCode: string;
  groupLink: string;
}

interface WechatMessage {
  sender: string;
  avatar?: string;
  content: string;
  time: string;
  isSelf?: boolean;
}

interface WechatHighlight {
  _id: string;
  title: string;
  excerpt: string;
  messages: WechatMessage[];
}

// 图标映射
const iconMap: Record<string, React.ElementType> = {
  FaHiking, FaLaptop, FaHandshake, FaCoffee,
};

export default function TopicsPage() {
  const { isLoggedIn } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('guide');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [buddies, setBuddies] = useState<BuddyCategory[]>([]);
  const [wechatHighlights, setWechatHighlights] = useState<WechatHighlight[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedQr, setSelectedQr] = useState<BuddyCategory | null>(null);
  const [selectedDiscussion, setSelectedDiscussion] = useState<WechatHighlight | null>(null);
  const [isTopicCreateModalOpen, setIsTopicCreateModalOpen] = useState(false);

  // 加载状态
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingBuddies, setLoadingBuddies] = useState(true);
  const [loadingWechat, setLoadingWechat] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 发布话题按钮点击处理
  const handleCreateTopic = () => {
    if (!isLoggedIn) {
      alert('请先登录后再发布话题');
      return;
    }
    setIsTopicCreateModalOpen(true);
  };

  // 获取话题（根据分类）
  useEffect(() => {
    if (selectedCategory === 'buddy') return;
    const fetchTopics = async () => {
      setLoadingTopics(true);
      setError(null);
      try {
        // 使用 apiFetch 替代原生 fetch
        const res = await apiFetch(`/api/topics?category=${selectedCategory}&limit=20`);
        if (!res.ok) throw new Error('获取话题失败');
        const data = await res.json();
        setTopics(data.topics);
      } catch (err: any) {
        console.error(err);
        setError(err.message || '话题加载失败');
      } finally {
        setLoadingTopics(false);
      }
    };
    fetchTopics();
  }, [selectedCategory]);

  // 获取搭子类别（全局一次）
  useEffect(() => {
    const fetchBuddies = async () => {
      setLoadingBuddies(true);
      try {
        const res = await apiFetch('/api/buddies');
        if (!res.ok) throw new Error('获取搭子类别失败');
        const data = await res.json();
        setBuddies(data);
      } catch (err) {
        console.error(err);
        // 搭子类别失败不影响主功能，静默处理
      } finally {
        setLoadingBuddies(false);
      }
    };
    fetchBuddies();
  }, []);

  // 获取微信群精选
  useEffect(() => {
    const fetchWechat = async () => {
      setLoadingWechat(true);
      try {
        const res = await apiFetch('/api/wechat');
        if (!res.ok) throw new Error('获取微信群精选失败');
        const data = await res.json();
        setWechatHighlights(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingWechat(false);
      }
    };
    fetchWechat();
  }, []);

  const closeTopicModal = () => setSelectedTopic(null);
  const closeQrModal = () => setSelectedQr(null);
  const closeDiscussionModal = () => setSelectedDiscussion(null);

  const handleTopicCreated = (newTopic: Topic) => {
    if (newTopic.category === selectedCategory) {
      setTopics(prev => [newTopic, ...prev]);
    }
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
            <span className="text-gray-700">话题广场</span>
          </div>

          {/* 页面标题和按钮行 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-0">话题广场</h1>
            <div className="flex space-x-3">
              <Link
                href="/community"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 border border-primary-200 px-4 py-2 rounded-full"
              >
                <FaArrowLeft />
                <span>返回社群中心</span>
              </Link>
              <button
                onClick={handleCreateTopic}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-full hover:bg-primary-700 transition"
              >
                <FaPlus />
                <span>发布话题</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 左侧：分类导航 */}
            <div className="lg:col-span-1">
              <div className="backdrop-blur-md bg-white/30 rounded-3xl p-6 shadow-xl border border-white/40 sticky top-24">
                <h2 className="text-xl font-bold mb-5 text-gray-800">话题分类</h2>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl transition ${
                        selectedCategory === cat.id
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'hover:bg-white/50 text-gray-700'
                      }`}
                    >
                      <cat.icon className="text-lg" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{cat.name}</div>
                        <div className={`text-xs ${selectedCategory === cat.id ? 'text-white/80' : 'text-gray-500'}`}>
                          {cat.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 中间：话题列表 或 搭子卡片 */}
            <div className="lg:col-span-2">
              <div className="backdrop-blur-md bg-white/30 rounded-3xl p-6 shadow-xl border border-white/40">
                <h2 className="text-xl font-bold mb-5 text-gray-800">
                  {categories.find(c => c.id === selectedCategory)?.name || '话题'}
                </h2>
                {selectedCategory === 'buddy' ? (
                  loadingBuddies ? (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {buddies.map(category => {
                        const Icon = iconMap[category.icon] || FaUsers;
                        return (
                          <div
                            key={category._id}
                            className="bg-white/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition border border-gray-100"
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                                <Icon size={20} />
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
                        );
                      })}
                    </div>
                  )
                ) : (
                  loadingTopics ? (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-10 text-red-500">{error}</div>
                  ) : topics.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      暂无话题，去其他分类看看吧
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topics.map(topic => (
                        <div
                          key={topic._id}
                          onClick={() => setSelectedTopic(topic)}
                          className="bg-white/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition border border-gray-100 cursor-pointer"
                        >
                          <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-primary-600">
                            {topic.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{topic.content}</p>
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
                  )
                )}
              </div>
            </div>

            {/* 右侧：微信群精选 */}
            <div className="lg:col-span-1">
              <div className="backdrop-blur-md bg-white/30 rounded-3xl p-6 shadow-xl border border-white/40 sticky top-24">
                <h3 className="text-lg font-bold flex items-center mb-4 text-gray-800">
                  <FaComment className="mr-2 text-primary-500" />
                  微信群精选
                </h3>
                {loadingWechat ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {wechatHighlights.map(item => (
                      <div key={item._id} className="bg-white/80 rounded-xl p-3">
                        <h4 className="font-medium text-gray-800 mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-500 mb-2">{item.excerpt}</p>
                        <button
                          onClick={() => setSelectedDiscussion(item)}
                          className="text-xs text-primary-600 hover:underline"
                        >
                          查看讨论 →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-white/50 text-center text-xs text-gray-400">
                  以上内容精选自社群微信群
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 话题详情模态框 */}
      <TopicModal
        topic={selectedTopic}
        onClose={closeTopicModal}
        isLoggedIn={isLoggedIn}
      />

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

      {/* 微信群讨论详情模态框 */}
      {selectedDiscussion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeDiscussionModal}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <FaUsers className="mr-2 text-primary-500" size={16} />
                {selectedDiscussion.title}
              </h3>
              <button onClick={closeDiscussionModal} className="p-2 hover:bg-gray-100 rounded-full transition">
                <FaTimes size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {selectedDiscussion.messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[80%] ${msg.isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                        {msg.sender[0]}
                      </div>
                    </div>
                    <div className={`mx-2 ${msg.isSelf ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-baseline space-x-2 mb-1">
                        <span className="text-xs font-medium text-gray-700">{msg.sender}</span>
                        <span className="text-[10px] text-gray-400">{msg.time}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl text-sm ${
                          msg.isSelf
                            ? 'bg-primary-600 text-white rounded-br-none'
                            : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 bg-white">
              <div className="text-xs text-gray-400 text-center">仅展示精选讨论，完整内容请加入微信群</div>
            </div>
          </div>
        </div>
      )}

      {/* 发布话题模态框 */}
      <CreateTopicModal
        isOpen={isTopicCreateModalOpen}
        onClose={() => setIsTopicCreateModalOpen(false)}
        onCreateSuccess={handleTopicCreated}
      />
    </>
  );
}