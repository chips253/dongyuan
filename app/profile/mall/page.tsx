'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaShoppingBag } from 'react-icons/fa';
import Header from '@/components/Header';
import { apiFetch } from '@/lib/api';

interface Reward {
  _id: string;
  name: string;
  description: string;
  points: number;
  stock: number;
  image?: string;
  type: string;
}

export default function MallPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exchangeLoading, setExchangeLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 获取商品列表和用户积分
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取用户信息（积分）
        const profileRes = await apiFetch('/api/profile');
        if (profileRes.ok) {
          const user = await profileRes.json();
          setUserPoints(user.points);
        }

        // 获取商品列表
        const rewardsRes = await apiFetch('/api/rewards');
        if (rewardsRes.ok) {
          const data = await rewardsRes.json();
          setRewards(data);
        }
      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: '加载失败，请稍后重试' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 兑换商品
  const handleExchange = async (rewardId: string, rewardName: string, points: number) => {
    if (userPoints < points) {
      setMessage({ type: 'error', text: '积分不足，无法兑换' });
      return;
    }

    setExchangeLoading(rewardId);
    setMessage(null);
    try {
      const res = await apiFetch('/api/rewards/exchange', {
        method: 'POST',
        body: JSON.stringify({ rewardId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `成功兑换 ${rewardName}！` });
        // 更新用户积分
        setUserPoints(prev => prev - points);
        // 可选：刷新商品列表（如果库存变化）
        // 简单处理：重新获取商品列表（或本地更新库存）
        const rewardsRes = await apiFetch('/api/rewards');
        if (rewardsRes.ok) {
          const newRewards = await rewardsRes.json();
          setRewards(newRewards);
        }
      } else {
        setMessage({ type: 'error', text: data.error || '兑换失败' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: '网络错误，请稍后重试' });
    } finally {
      setExchangeLoading(null);
    }
  };

  return (
    <>
      <Header isLoggedIn={true} onLoginClick={() => {}} />
      <main className="min-h-screen pt-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* 返回个人中心链接 */}
          <div className="mb-6">
            <Link href="/profile" className="inline-flex items-center text-primary-600 hover:underline">
              <FaArrowLeft className="mr-1" /> 返回个人中心
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-2">积分商城</h1>
          <p className="text-gray-600 mb-6">
            当前积分：<span className="font-bold text-primary-600 text-xl">{userPoints}</span>
          </p>

          {message && (
            <div
              className={`p-3 rounded-xl mb-4 ${
                message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}
            >
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-20 text-gray-500">暂无商品</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map(reward => (
                <div
                  key={reward._id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md hover:shadow-xl transition border border-gray-100"
                >
                  {/* 商品图片占位 */}
                  <div className="aspect-square bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-gray-400 text-4xl">
                    {reward.image ? (
                      <img src={reward.image} alt={reward.name} className="object-cover w-full h-full rounded-xl" />
                    ) : (
                      <FaShoppingBag />
                    )}
                  </div>

                  <h3 className="text-xl font-semibold mb-1">{reward.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{reward.description}</p>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-primary-600 font-bold text-lg">{reward.points} 积分</span>
                    {reward.stock !== undefined && reward.stock >= 0 && (
                      <span className="text-sm text-gray-400">库存: {reward.stock === 0 ? '已售罄' : reward.stock}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleExchange(reward._id, reward.name, reward.points)}
                    disabled={exchangeLoading === reward._id || userPoints < reward.points || reward.stock === 0}
                    className={`w-full py-2 rounded-full font-semibold transition ${
                      userPoints >= reward.points && reward.stock !== 0
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {exchangeLoading === reward._id ? '兑换中...' : '立即兑换'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}