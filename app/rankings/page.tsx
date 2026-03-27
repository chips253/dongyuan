'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaTrophy, FaMedal, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';

interface UserRank {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  rank: number;      // 后端返回的全局排名
  skills: string[];
}

const ITEMS_PER_PAGE = 20;

export default function RankingsPage() {
  const { isLoggedIn } = useAuth();
  const [rankings, setRankings] = useState<UserRank[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // 获取排行榜数据
  const fetchRankings = async (page: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/api/rankings?page=${page}&limit=${ITEMS_PER_PAGE}`);
      if (!res.ok) throw new Error('获取排行榜失败');
      const data = await res.json();
      setRankings(data.rankings || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings(currentPage);
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLoginClick={() => {}} />
      <main className="min-h-screen pt-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* 面包屑导航 */}
          <div className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary-600 transition">首页</Link>
            <span className="mx-2">/</span>
            <Link href="/explore" className="hover:text-primary-600 transition">探索</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">完整积分榜</span>
          </div>

          {/* 页面标题 */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
              E栖积分总榜
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              社区成员贡献值排名，实时更新，每周更有专属奖励
            </p>
          </div>

          {/* 排行榜列表 */}
          <div className="max-w-4xl mx-auto">
            <div className="backdrop-blur-md bg-white/30 rounded-3xl p-6 shadow-xl border border-white/40">
              {/* 表头 */}
              <div className="grid grid-cols-12 gap-2 py-3 px-4 border-b border-gray-200 font-semibold text-gray-600">
                <div className="col-span-1 text-center">排名</div>
                <div className="col-span-6 md:col-span-5">用户</div>
                <div className="col-span-3 md:col-span-4">主要技能</div>
                <div className="col-span-2 text-right">积分</div>
              </div>

              {/* 内容区域 */}
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="text-center py-20 text-red-500">{error}</div>
              ) : rankings.length === 0 ? (
                <div className="text-center py-20 text-gray-500">暂无数据</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {rankings.map((user) => (
                    <div
                      key={user.id}
                      className="grid grid-cols-12 gap-2 py-4 px-4 hover:bg-white/50 transition rounded-lg items-center"
                    >
                      {/* 排名 */}
                      <div className="col-span-1 text-center font-bold">
                        {user.rank <= 3 ? (
                          <FaMedal className={`text-xl mx-auto ${
                            user.rank === 1 ? 'text-yellow-400' :
                            user.rank === 2 ? 'text-gray-400' : 'text-amber-600'
                          }`} />
                        ) : (
                          <span className="text-gray-500">{user.rank}</span>
                        )}
                      </div>

                      {/* 用户信息 */}
                      <div className="col-span-6 md:col-span-5 flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-600 overflow-hidden shadow-sm">
                          {user.avatar ? (
                            <Image src={user.avatar} alt={user.name} width={40} height={40} />
                          ) : (
                            <span className="font-medium">{user.name[0]}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.name}</p>
                        </div>
                      </div>

                      {/* 主要技能 */}
                      <div className="col-span-3 md:col-span-4 text-sm text-gray-600 truncate">
                        {user.skills.slice(0, 2).join(' · ')}
                      </div>

                      {/* 积分 */}
                      <div className="col-span-2 text-right font-bold text-primary-600">
                        {user.points}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 分页控件 */}
              {!loading && totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full ${
                      currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <FaChevronLeft />
                  </button>
                  <span className="text-sm text-gray-600">
                    第 {currentPage} 页 / 共 {totalPages} 页
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-full ${
                      currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 返回探索页面的链接 */}
          <div className="text-center mt-8">
            <Link
              href="/explore"
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <span>← 返回探索</span>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}