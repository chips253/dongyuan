'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { mockProducts } from '../page';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';

// 评价类型（保留但不再使用，可删除）
interface Review {
  id: string;
  user: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  hasImage?: boolean;
}

// 产品类型定义（添加 weeklyPrice 和 monthlyPrice）
interface Product {
  id: string;
  name: string;
  category: 'living' | 'office' | 'life' | 'social' | 'contribute';
  description: string;
  price: number;
  unit: string;
  originalPrice?: number;
  weeklyPrice?: number;   // 周租价格（可选）
  monthlyPrice?: number;  // 月租价格（可选）
  image?: string;
  tags: string[];
  features?: string[];

  // 居住特有
  nearby?: string[];
  reviews?: Review[];

  // 办公产品特有
  capacity?: string;
  availableHours?: string;
  rules?: string[];
  additionalServices?: string[];
  availableCount?: number;
  totalCount?: number;

  // 生活服务特有
  openingHours?: string;
  location?: string;
  usageMethod?: string;

  // 社交活动特有
  eventTime?: string;
  organizer?: string;
  currentParticipants?: number;
  maxParticipants?: number;
  registrationDeadline?: string;

  // 贡献通道特有
  projectPeriod?: string;
  timeCommitment?: string;
  projectStatus?: string;
  projectOutcome?: string;
}

// API 基础地址
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth(); // 从认证上下文获取登录状态
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<'day' | 'week' | 'month'>('day');

  // 获取产品详情
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('产品不存在');
          throw new Error('获取产品失败');
        }
        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // 获取相关推荐（同类产品，排除自身）
  useEffect(() => {
    if (!product) return;

    const fetchRelated = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products?category=${product.category}`);
        if (!res.ok) throw new Error('获取相关产品失败');
        const allProducts = await res.json();
        const filtered = allProducts.filter((p: Product) => p.id !== product.id).slice(0, 4);
        setRelatedProducts(filtered);
      } catch (err) {
        console.error('获取相关推荐失败:', err);
      }
    };

    fetchRelated();
  }, [product]);

  // 处理立即预订/报名
  const handleBooking = async () => {
    if (!isLoggedIn) {
      alert('请先登录后再预订');
      return;
    }
    if (!product) return;

    try {
      const res = await apiFetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          type: product.category,
          date: new Date().toISOString(),
          nights: selectedDuration === 'day' ? 1 : selectedDuration === 'week' ? 7 : 30,
          price: currentPrice,
        }),
      });
      if (res.ok) {
        alert(product.category === 'social' ? '报名成功！' : '预订成功！');
      } else {
        const data = await res.json();
        alert(data.error || (product.category === 'social' ? '报名失败' : '预订失败'));
      }
    } catch (err) {
      console.error(err);
      alert('网络错误，请稍后重试');
    }
  };

  // 价格计算（支持独立周租/月租）
  const getPriceForDuration = (duration: 'day' | 'week' | 'month') => {
    if (!product) return 0;
    if (product.price === 0) return 0;
    if (product.unit === '小时' || product.unit === '次' || product.unit === '志愿') {
      return product.price;
    }
    switch (duration) {
      case 'day':
        return product.price;
      case 'week':
        // 优先使用独立周租价格，否则按日租*6
        return product.weeklyPrice ?? product.price * 6;
      case 'month':
        // 优先使用独立月租价格，否则按日租*20
        return product.monthlyPrice ?? product.price * 20;
      default:
        return product.price;
    }
  };

  const currentPrice = getPriceForDuration(selectedDuration);

  const getCategoryName = (category: string) => {
    const map: Record<string, string> = {
      living: '居住',
      office: '办公',
      life: '生活',
      social: '社交',
      contribute: '贡献',
    };
    return map[category] || category;
  };

  // 加载状态
  if (loading) {
    return (
      <>
        <Header isLoggedIn={isLoggedIn} onLoginClick={() => {}} />
        <main className="min-h-screen pt-16 bg-gray-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </main>
      </>
    );
  }

  // 错误或无产品
  if (error || !product) {
    return (
      <>
        <Header isLoggedIn={isLoggedIn} onLoginClick={() => {}} />
        <main className="min-h-screen pt-16 bg-gray-50">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold text-gray-800">{error || '产品不存在'}</h1>
            <Link href="/products" className="inline-block mt-6 text-primary-600 hover:underline">
              返回产品包中心
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLoginClick={() => {}} />
      <main className="min-h-screen pt-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* 面包屑导航 */}
          <div className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary-600 transition">首页</Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-primary-600 transition">产品包中心</Link>
            <span className="mx-2">/</span>
            <Link
              href={`/products?category=${product.category}`}
              className="hover:text-primary-600 transition"
            >
              {getCategoryName(product.category)}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">{product.name}</span>
          </div>

          {/* 两列布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* 左侧图片区 */}
            <div className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={600}
                    height={600}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-8xl opacity-30">
                    {product.category === 'living' ? '🛏️' :
                     product.category === 'office' ? '💼' :
                     product.category === 'life' ? '🍽️' :
                     product.category === 'social' ? '🎉' : '🤝'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-sm">
                    📷
                  </div>
                ))}
              </div>
            </div>

            {/* 右侧信息区 */}
            <div>
              {/* 产品名称（移除收藏和评分） */}
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
              <p className="text-gray-600 text-lg mb-4">{product.description}</p>

              {/* 标签 */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 价格区域 */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    {product.price === 0 ? (
                      <span className="text-3xl font-bold text-green-600">免费</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-primary-600">
                          ¥{currentPrice}
                        </span>
                        <span className="text-gray-500 ml-2">/{selectedDuration === 'day' ? '天' : selectedDuration === 'week' ? '周' : '月'}</span>
                      </>
                    )}
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-gray-400 line-through ml-3 text-lg">
                        ¥{product.originalPrice}
                      </span>
                    )}
                  </div>
                  {product.price > 0 && product.unit !== '小时' && product.unit !== '次' && (
                    <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      长租优惠
                    </span>
                  )}
                </div>

                {/* 时长选择 */}
                {product.price > 0 && product.unit !== '小时' && product.unit !== '次' && product.unit !== '志愿' && (
                  <div className="flex gap-2 mb-4">
                    {(['day', 'week', 'month'] as const).map(duration => (
                      <button
                        key={duration}
                        onClick={() => setSelectedDuration(duration)}
                        className={`flex-1 py-2 rounded-full border transition ${
                          selectedDuration === duration
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        {duration === 'day' ? '日租' : duration === 'week' ? '周租' : '月租'}
                      </button>
                    ))}
                  </div>
                )}

                {/* 预订/报名按钮 */}
                <button
                  onClick={handleBooking}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-full text-lg font-semibold transition shadow-md"
                >
                  {product.category === 'social' ? '立即报名' : '立即预订'}
                </button>
                <p className="text-xs text-gray-400 text-center mt-3">
                  {isLoggedIn ? '您已登录，可直接预订' : '您还未登录，预订前请先登录'}
                </p>
              </div>

              {/* 设施/特点 */}
              {product.features && product.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">设施与服务</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {product.features.map(feature => (
                      <div key={feature} className="flex items-center space-x-2 text-gray-700">
                        <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========== 办公产品特有信息（已移除企业长期租赁入口） ========== */}
              {product.category === 'office' && (
                <div className="mb-6 space-y-4">
                  {/* 容纳人数 */}
                  {product.capacity && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">容纳人数</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{product.capacity}</p>
                    </div>
                  )}

                  {/* 实时占用状态 */}
                  {product.availableCount !== undefined && product.totalCount !== undefined && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg">实时占用</h3>
                        <span className="text-sm font-medium text-orange-600">
                          仅剩 {product.availableCount} 个
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-orange-500 h-2.5 rounded-full" 
                          style={{ width: `${(1 - product.availableCount / product.totalCount) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        总数 {product.totalCount}，已占用 {product.totalCount - product.availableCount}
                      </p>
                    </div>
                  )}

                  {/* 可预订时段 */}
                  {product.availableHours && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">可预订时段</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{product.availableHours}</p>
                    </div>
                  )}

                  {/* 使用规则 */}
                  {product.rules && product.rules.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">使用规则</h3>
                      <ul className="space-y-1">
                        {product.rules.map((rule, idx) => (
                          <li key={idx} className="flex items-start text-gray-600 text-sm">
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 mr-2"></span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 附加服务 */}
                  {product.additionalServices && product.additionalServices.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">附加服务</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.additionalServices.map((service, idx) => (
                          <span key={idx} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 企业长期租赁入口已删除 */}
                </div>
              )}

              {/* ========== 生活服务特有信息 ========== */}
              {product.category === 'life' && (
                <div className="mb-6 space-y-4">
                  {product.openingHours && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">开放时间</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{product.openingHours}</p>
                    </div>
                  )}
                  {product.location && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">位置</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg flex items-center">
                        <span className="mr-2">📍</span> {product.location}
                      </p>
                    </div>
                  )}
                  {product.usageMethod && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">使用方式</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{product.usageMethod}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ========== 社交活动特有信息 ========== */}
              {product.category === 'social' && (
                <div className="mb-6 space-y-4">
                  {product.eventTime && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">活动时间</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg flex items-center">
                        <span className="mr-2">📅</span> {product.eventTime}
                      </p>
                    </div>
                  )}
                  {product.location && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">活动地点</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg flex items-center">
                        <span className="mr-2">📍</span> {product.location}
                      </p>
                    </div>
                  )}
                  {product.organizer && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">组织者</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg flex items-center">
                        <span className="mr-2">👥</span> {product.organizer}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ========== 贡献通道特有信息 ========== */}
              {product.category === 'contribute' && (
                <div className="mb-6 space-y-4">
                  {product.projectStatus && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">项目状态</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                        product.projectStatus === '招募中' ? 'bg-green-100 text-green-700' :
                        product.projectStatus === '进行中' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {product.projectStatus}
                      </span>
                    </div>
                  )}
                  {product.organizer && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">发起人</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg flex items-center">
                        <span className="mr-2">🏢</span> {product.organizer}
                      </p>
                    </div>
                  )}
                  {product.projectPeriod && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">项目周期</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg flex items-center">
                        <span className="mr-2">📅</span> {product.projectPeriod}
                      </p>
                    </div>
                  )}
                  {product.timeCommitment && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">时间投入</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg flex items-center">
                        <span className="mr-2">⏳</span> {product.timeCommitment}
                      </p>
                    </div>
                  )}
                  {product.projectOutcome && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">项目成果</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{product.projectOutcome}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 周边配套（仅居住） */}
              {product.category === 'living' && product.nearby && product.nearby.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">周边配套</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.nearby.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                        <span className="text-xl">📍</span>
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 预订须知 */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-semibold text-lg mb-3">预订须知</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 使用时间：预订成功后按所选时段使用</li>
                  <li>• 取消政策：提前24小时免费取消</li>
                  <li>• 押金：无需押金</li>
                  <li>• 包含：水电、Wi-Fi、公共区域使用</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 详细描述 */}
          <div className="mt-12 bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <h2 className="text-xl font-bold mb-4">详细描述</h2>
            <p className="text-gray-600 leading-relaxed">
              {product.description}。这里是更详细的介绍，包括房间布局、周边环境、适合人群等。实际内容可根据不同产品类型填充，此处为示例文本。
            </p>
          </div>

          {/* 相关推荐 */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-6">你可能还喜欢</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map(rel => (
                  <Link
                    key={rel.id}
                    href={`/products/${rel.id}`}
                    className="group bg-white rounded-xl p-4 shadow hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100"
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-300 text-4xl">
                      {rel.category === 'living' ? '🛏️' :
                       rel.category === 'office' ? '💼' :
                       rel.category === 'life' ? '🍽️' :
                       rel.category === 'social' ? '🎉' : '🤝'}
                    </div>
                    <h3 className="font-semibold group-hover:text-primary-600 transition-colors line-clamp-1">
                      {rel.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {rel.price === 0 ? '免费' : `¥${rel.price}/${rel.unit}`}
                    </p>
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