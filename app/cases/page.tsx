'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaSeedling, FaPalette, FaChalkboardTeacher, FaCamera,
  FaUsers, FaArrowRight, FaFilter
} from 'react-icons/fa';
import Header from '@/components/Header';

// 类型定义（保持不变）
interface CaseItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: 'agriculture' | 'culture' | 'skill' | 'other';
  tags: string[];
  outcome: string;
  participants: number;
  year: string;
}

// API 基础地址
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

// 分类配置（不变）
const categories = [
  { id: 'all', name: '全部', icon: FaFilter },
  { id: 'agriculture', name: '助农案例', icon: FaSeedling },
  { id: 'culture', name: '文化共创', icon: FaPalette },
  { id: 'skill', name: '技能传递', icon: FaChalkboardTeacher },
  { id: 'other', name: '其他', icon: FaCamera },
];

export default function CasesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 登录状态保留（可能用于其他用途）
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取案例列表
  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = selectedCategory === 'all'
          ? `${API_BASE}/api/cases`
          : `${API_BASE}/api/cases?category=${selectedCategory}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('获取案例失败');
        const data = await res.json();
        setCases(Array.isArray(data) ? data : (data.cases || []));
      } catch (err) {
        console.error(err);
        setError('加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [selectedCategory]);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLoginClick={() => setIsLoggedIn(true)} />
      <main className="min-h-screen pt-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* 页面标题（移除了按钮行，只保留标题） */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent">
              共创案例库
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              数字游民与本地社区共同创造的成果，见证价值转化
            </p>
          </div>

          {/* 分类选项卡（不变） */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 bg-white/70 backdrop-blur-sm rounded-full shadow-lg border border-gray-100 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    selectedCategory === cat.id
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <cat.icon className="text-sm" />
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 案例卡片网格（不变） */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center min-h-[400px] text-red-500">{error}</div>
          ) : cases.length === 0 ? (
            <div className="flex justify-center items-center min-h-[400px] text-gray-500">暂无该类案例，敬请期待</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cases.map(item => (
                <Link
                  key={item.id}
                  href={`/cases/${item.id}`}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                >
                  <div className="aspect-video bg-gray-200 rounded-xl mb-4 overflow-hidden">
                    {item.images?.[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={item.title}
                        width={400}
                        height={225}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📷</div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{item.year}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                  <div className="bg-green-50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-green-700 font-medium">成果</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{item.outcome}</p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaUsers className="mr-1 text-primary-500" size={14} />
                    <span>{item.participants} 人参与</span>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <span className="text-primary-600 text-sm group-hover:translate-x-2 transition-transform inline-flex items-center">
                      查看详情 <FaArrowRight className="ml-1 text-xs" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 页脚（如果原来有，可保留，此处省略） */}
    </>
  );
}