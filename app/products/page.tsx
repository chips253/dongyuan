'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaBed, FaDesktop, FaUtensils, FaCalendarAlt, FaHandsHelping
} from 'react-icons/fa';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext'; // 导入认证钩子
import { apiFetch } from '@/lib/api'; // 导入 API 请求工具

// ---------- 类型定义 ----------
interface Review {
  id: string;
  user: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  hasImage?: boolean;
}

interface Product {
  id: string;
  name: string;
  category: 'living' | 'office' | 'life' | 'social' | 'contribute';
  description: string;
  price: number;
  unit: string;
  originalPrice?: number;
  image?: string;
  tags: string[];
  features?: string[];
  // 居住特有
  nearby?: string[];
  reviews?: Review[];
  // 办公特有
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

interface Package {
  id: string;
  name: string;
  description: string;
  items: string[];
  price: number;
  originalPrice: number;
  tag?: 'hot' | 'recommend' | 'new';
}

// 分类配置
const categories = [
  { id: 'living', label: '居住', icon: FaBed },
  { id: 'office', label: '办公', icon: FaDesktop },
  { id: 'life', label: '生活', icon: FaUtensils },
  { id: 'social', label: '社交', icon: FaCalendarAlt },
  { id: 'contribute', label: '贡献', icon: FaHandsHelping },
];

// API 基础地址
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category');
  const { isLoggedIn } = useAuth(); // 从认证上下文获取登录状态
  console.log('ProductsPage isLoggedIn:', isLoggedIn); // 调试

  // 当前选中的分类
  const [activeCategory, setActiveCategory] = useState(
    categoryParam && categories.some(c => c.id === categoryParam) ? categoryParam : 'living'
  );

  // 产品列表状态
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  // 套餐列表状态
  const [packages, setPackages] = useState<Package[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  // 处理分类切换
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    router.push(`/products?category=${categoryId}`, { scroll: false });
  };

  // 获取产品列表（依赖当前分类）
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      setProductsError(null);
      try {
        const res = await fetch(`${API_BASE}/api/products?category=${activeCategory}`);
        if (!res.ok) {
          throw new Error('获取产品失败');
        }
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setProductsError('加载产品失败，请稍后重试');
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory]);

  // 获取套餐列表（只在组件挂载时获取一次）
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/packages`);
        if (!res.ok) {
          throw new Error('获取套餐失败');
        }
        const data = await res.json();
        setPackages(data);
      } catch (err) {
        console.error('获取套餐失败:', err);
        // 套餐加载失败不显示错误，可以静默处理
      } finally {
        setPackagesLoading(false);
      }
    };
    fetchPackages();
  }, []);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLoginClick={() => {}} />
      <main className="min-h-screen pt-16 bg-gradient-to-b from-gray-50 to-white">
        {/* 页面标题 */}
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent">
            产品包中心
          </h1>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            为数字游民量身打造的全维度生活工作解决方案，灵活选择单品或组合套餐
          </p>
        </div>

        {/* 分类选项卡 */}
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="inline-flex p-1 bg-white/70 backdrop-blur-sm rounded-full shadow-lg border border-gray-100">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-full transition-all duration-200 ${
                    activeCategory === cat.id
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <cat.icon className="text-sm" />
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 产品卡片网格 */}
        <div className="container mx-auto px-4 py-12">
          {productsLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          ) : productsError ? (
            <div className="text-center py-20 text-red-500">{productsError}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              暂无该分类产品，敬请期待
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* 超值套餐推荐 */}
        <section className="bg-gradient-to-r from-primary-50 via-green-50 to-primary-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">超值套餐推荐</h2>
            <p className="text-center text-gray-600 mb-12">组合预订更优惠，长居专享折扣</p>
            {packagesLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {packages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} isLoggedIn={isLoggedIn} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 温馨提示 */}
        <div className="container mx-auto px-4 py-8 text-center text-sm text-gray-400">
          * 长租优惠更多，详情咨询前台。
        </div>
      </main>
    </>
  );
}

// ---------- 产品卡片组件 ----------
function ProductCard({ product }: { product: Product }) {
  const isFree = product.price === 0;
  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
    >
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-400 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={200}
            className="object-cover"
          />
        ) : (
          <div className="text-5xl opacity-30">
            {product.category === 'living' ? '🛏️' :
             product.category === 'office' ? '💼' :
             product.category === 'life' ? '🍽️' :
             product.category === 'social' ? '🎉' : '🤝'}
          </div>
        )}
      </div>
      <div className="mb-3">
        <h3 className="text-xl font-semibold mb-1 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {product.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {tag}
          </span>
        ))}
        {product.tags.length > 3 && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            +{product.tags.length - 3}
          </span>
        )}
      </div>
      <div className="flex justify-between items-center">
        <div>
          {isFree ? (
            <span className="text-2xl font-bold text-green-600">免费</span>
          ) : (
            <>
              <span className="text-2xl font-bold text-primary-600">¥{product.price}</span>
              <span className="text-gray-500 text-sm ml-1">/{product.unit}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-400 line-through ml-2">
                  ¥{product.originalPrice}
                </span>
              )}
            </>
          )}
        </div>
        <span className="text-primary-600 text-sm group-hover:translate-x-2 transition-transform">
          查看详情 →
        </span>
      </div>
    </Link>
  );
}

// ---------- 套餐卡片组件 ----------
function PackageCard({ pkg, isLoggedIn }: { pkg: Package; isLoggedIn: boolean }) {
  const tagConfig = {
    hot: { label: '热门', className: 'bg-red-500' },
    recommend: { label: '推荐', className: 'bg-primary-600' },
    new: { label: '新品', className: 'bg-blue-500' },
  };

  const handleBooking = async () => {
    console.log('handleBooking called, isLoggedIn:', isLoggedIn); // 调试
    if (!isLoggedIn) {
      alert('请先登录后再预订');
      return;
    }

    try {
      const res = await apiFetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          productId: pkg.id,
          productName: pkg.name,
          type: 'package',       // 套餐类型
          date: new Date().toISOString(),
          price: pkg.price,
        }),
      });
      if (res.ok) {
        alert('套餐预订成功！');
        // 可选：刷新个人中心
      } else {
        const data = await res.json();
        alert(data.error || '预订失败');
      }
    } catch (err) {
      console.error(err);
      alert('网络错误，请稍后重试');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-primary-100 relative overflow-hidden hover:shadow-xl transition-shadow">
      {pkg.tag && (
        <div className={`absolute top-0 right-0 ${tagConfig[pkg.tag].className} text-white px-3 py-1 text-sm rounded-bl-2xl`}>
          {tagConfig[pkg.tag].label}
        </div>
      )}
      <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
      <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
      <ul className="text-sm text-gray-600 mb-4 space-y-1">
        {pkg.items.map((item) => (
          <li key={item} className="flex items-center">
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
            {item}
          </li>
        ))}
      </ul>
      <div className="mb-4">
        <span className="text-3xl font-bold text-primary-600">¥{pkg.price}</span>
        <span className="text-gray-400 text-sm line-through ml-2">¥{pkg.originalPrice}</span>
        <span className="text-green-600 text-sm ml-2">
          省 ¥{pkg.originalPrice - pkg.price}
        </span>
      </div>
      <button
        onClick={handleBooking}
        className="w-full bg-primary-600 text-white py-2 rounded-full hover:bg-primary-700 transition shadow-md hover:shadow-lg"
      >
        立即预订
      </button>
    </div>
  );
}