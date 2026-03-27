'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaCalendarAlt, FaUsers, FaArrowLeft, 
  FaSeedling, FaPalette, FaChalkboardTeacher, FaCamera
} from 'react-icons/fa';
import Header from '@/components/Header';

// 案例类型定义（与列表页一致）
interface CaseItem {
  id: string;
  title: string;
  description: string;
  image: string;
  images?: string[];
  category: 'agriculture' | 'culture' | 'skill' | 'other';
  tags: string[];
  outcome: string;
  participants: number;
  year: string;
  detail?: string;
  contributors?: string[];
}

// API 基础地址
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

// 获取分类图标
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'agriculture': return FaSeedling;
    case 'culture': return FaPalette;
    case 'skill': return FaChalkboardTeacher;
    default: return FaCamera;
  }
};

export default function CaseDetailPage() {
  const { id } = useParams();
  const [caseItem, setCaseItem] = useState<CaseItem | null>(null);
  const [relatedCases, setRelatedCases] = useState<CaseItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 获取当前案例
  useEffect(() => {
    if (!id) return;
    const fetchCase = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/cases/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('案例不存在');
          throw new Error('获取案例失败');
        }
        const data = await res.json();
        setCaseItem(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id]);

  // 获取相关案例（同类别，排除自身）
  useEffect(() => {
    if (!caseItem) return;
    const fetchRelated = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/cases?category=${caseItem.category}&limit=3`);
        if (!res.ok) return;
        const data = await res.json();
        const allCases = Array.isArray(data) ? data : (data.cases || []);
        const filtered = allCases.filter((c: CaseItem) => c.id !== caseItem.id).slice(0, 3);
        setRelatedCases(filtered);
      } catch (err) {
        console.error('获取相关案例失败', err);
      }
    };
    fetchRelated();
  }, [caseItem]);

  if (loading) {
    return (
      <>
        <Header isLoggedIn={isLoggedIn} onLoginClick={() => setIsLoggedIn(true)} />
        <main className="min-h-screen pt-16 bg-gray-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </main>
      </>
    );
  }

  if (error || !caseItem) {
    return (
      <>
        <Header isLoggedIn={isLoggedIn} onLoginClick={() => setIsLoggedIn(true)} />
        <main className="min-h-screen pt-16 bg-gray-50">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold text-gray-800">{error || '案例不存在'}</h1>
            <Link href="/cases" className="inline-block mt-6 text-primary-600 hover:underline">
              返回案例库
            </Link>
          </div>
        </main>
      </>
    );
  }

  const CategoryIcon = getCategoryIcon(caseItem.category);
  const images = caseItem.images && caseItem.images.length > 0 ? caseItem.images : [caseItem.image];

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLoginClick={() => setIsLoggedIn(true)} />
      <main className="min-h-screen pt-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* 面包屑导航 */}
          <div className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary-600 transition">首页</Link>
            <span className="mx-2">/</span>
            <Link href="/cases" className="hover:text-primary-600 transition">共创案例库</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">{caseItem.title}</span>
          </div>

          {/* 返回按钮（移动端） */}
          <div className="mb-4 lg:hidden">
            <Link href="/cases" className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
              <FaArrowLeft size={16} />
              <span>返回案例库</span>
            </Link>
          </div>

          {/* 两列布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* 左侧图片轮播 */}
            <div>
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 shadow-xl border border-white/40">
                <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden relative">
                  <Image
                    src={images[currentImageIndex]}
                    alt={caseItem.title}
                    fill
                    className="object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition ${
                          index === currentImageIndex ? 'bg-primary-600 w-4' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧信息 */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">{caseItem.title}</h1>
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  <CategoryIcon className="mr-1 text-primary-500" size={14} />
                  <span>{
                    caseItem.category === 'agriculture' ? '助农案例' :
                    caseItem.category === 'culture' ? '文化共创' :
                    caseItem.category === 'skill' ? '技能传递' : '其他'
                  }</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FaCalendarAlt className="mr-1 text-gray-400" size={14} />
                  <span>{caseItem.year}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FaUsers className="mr-1 text-gray-400" size={14} />
                  <span>{caseItem.participants}人参与</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {caseItem.tags.map(tag => (
                  <span key={tag} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="bg-green-50 rounded-2xl p-5 mb-6 border border-green-100">
                <h3 className="text-lg font-semibold text-green-800 mb-2">成果摘要</h3>
                <p className="text-green-700">{caseItem.outcome}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">项目详情</h3>
                <p className="text-gray-600 leading-relaxed">{caseItem.detail || caseItem.description}</p>
              </div>

              {caseItem.contributors && caseItem.contributors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">参与人员</h3>
                  <div className="flex flex-wrap gap-2">
                    {caseItem.contributors.map(name => (
                      <span key={name} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 相关案例推荐 */}
          {relatedCases.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-6">相关案例</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedCases.map(rel => (
                  <Link
                    key={rel.id}
                    href={`/cases/${rel.id}`}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
                  >
                    <div className="aspect-video bg-gray-200 rounded-lg mb-3 overflow-hidden">
                      <Image
                        src={rel.images?.[0] || rel.image}
                        alt={rel.title}
                        width={300}
                        height={169}
                        className="object-cover w-full h-full group-hover:scale-105 transition"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition line-clamp-1">
                      {rel.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{rel.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 返回顶部按钮 */}
          <div className="text-center mt-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-primary-600 hover:underline text-sm"
            >
              返回顶部 ↑
            </button>
          </div>
        </div>
      </main>
    </>
  );
}