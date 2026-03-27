'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaUsers, FaRegCalendarAlt, FaRegHandshake, FaLeaf,
  FaUser, FaSignInAlt, FaUserPlus, FaBars, FaHome,
  FaCompass, FaImages, FaNewspaper
} from 'react-icons/fa';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';

// 静态数据
const ecoHighlights = [
  { label: '森林覆盖率', value: '70.48%', icon: FaLeaf },
  { label: '空气质量', value: '优良率 98%', icon: HiOutlineLocationMarker },
  { label: '水质标准', value: 'Ⅰ类', icon: HiOutlineLocationMarker },
  { label: '候鸟旅居', value: '中国候鸟旅居小城', icon: HiOutlineLocationMarker },
];

const productLinks = [
  { name: '居住套餐', href: '/products?category=living', icon: '🏡' },
  { name: '办公空间', href: '/products?category=office', icon: '💻' },
  { name: '生活配套', href: '/products?category=life', icon: '🍽️' },
  { name: '社交活动', href: '/products?category=social', icon: '🎉' },
  { name: '贡献通道', href: '/products?category=contribute', icon: '🌾' },
];

// 轮播图图片数组
const bannerImages = [
  {
    src: '/images/wanlvhu1.jpg',
    alt: '万绿湖航拍',
    title: '东源E栖谷',
    subtitle: '于万绿湖旁，做自在数字游民'
  }
];

// 静态统计数据（固定值）
const staticStats = {
  currentResidents: 24,
  skillTypes: 16,
  monthlyEvents: 8,
  localProjects: 5,
};

export default function Home() {
  return (
    <>
      <Header />

      <main className="min-h-screen pt-16 bg-gradient-to-b from-gray-50 to-white">
        {/* 轮播Banner */}
        <CarouselBanner />

        {/* 数据卡片（使用静态数据） */}
        <StatsCards stats={staticStats} />

        {/* 生态基底 */}
        <EcoHighlights highlights={ecoHighlights} />

        {/* 产品快捷入口 */}
        <ProductQuickLinks links={productLinks} />
      </main>

      {/* 简约页脚 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">东源E栖谷</h3>
              <p className="text-gray-400 text-sm">于万绿湖旁，做自在数字游民</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">快速链接</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/products" className="hover:text-white transition">产品包</Link></li>
                <li><Link href="/community" className="hover:text-white transition">社群中心</Link></li>
                <li><Link href="/cases" className="hover:text-white transition">共创案例</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">联系我们</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>邮箱：hello@dongyuanexi.com</li>
                <li>电话：0762-1234567</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">关注我们</h4>
              <div className="flex space-x-4 text-gray-400">
                <span className="hover:text-white cursor-pointer transition">微信</span>
                <span className="hover:text-white cursor-pointer transition">小红书</span>
                <span className="hover:text-white cursor-pointer transition">抖音</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2026 东源E栖谷. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}

// ---------- 轮播Banner组件（保持不变） ----------
function CarouselBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isSingleImage = bannerImages.length === 1;

  useEffect(() => {
    if (isSingleImage) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isSingleImage]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
  };

  const currentImage = bannerImages[currentIndex];

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={currentImage.src}
          alt={currentImage.alt}
          fill
          className="object-cover transition-transform duration-10000 scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-2xl text-white">
          <div className="overflow-hidden">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in-up">
              {currentImage.title}
            </h1>
          </div>
          <p className="text-xl md:text-2xl mb-8 text-white/90 backdrop-blur-sm bg-white/10 inline-block px-6 py-3 rounded-full">
            {currentImage.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              href="/products"
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              探索旅居套餐
            </Link>
            <Link
              href="/community"
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-8 py-3 rounded-full text-lg font-semibold transition border border-white/30"
            >
              加入社群
            </Link>
          </div>
        </div>
      </div>

      {!isSingleImage && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-full transition"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-full transition"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}

      {!isSingleImage && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-16 right-8 z-20 animate-bounce">
        <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7m14-6l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}

// ---------- 数据卡片组件（仅展示静态数据） ----------
function StatsCards({ stats }: { stats: { currentResidents: number; skillTypes: number; monthlyEvents: number; localProjects: number } }) {
  const cards = [
    { icon: FaUsers, label: '当前入驻游民', value: stats.currentResidents, color: 'from-blue-500 to-cyan-500' },
    { icon: FaRegHandshake, label: '技能种类', value: stats.skillTypes, color: 'from-green-500 to-emerald-500' },
    { icon: FaRegCalendarAlt, label: '本月活动', value: stats.monthlyEvents, color: 'from-orange-500 to-amber-500' },
    { icon: FaLeaf, label: '助农项目', value: stats.localProjects, color: 'from-primary-500 to-green-600' },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">东源E栖谷·实时动态</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">数字游民社区的活力脉搏，数据每5分钟更新</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${card.color} rounded-t-2xl`} />
              <div className={`w-16 h-16 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform`}>
                <card.icon className="text-3xl text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-800 mb-2">{card.value}</div>
              <div className="text-gray-600">{card.label}</div>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-t from-white/50 to-transparent" />
            </div>
          ))}
        </div>
        
        <p className="text-center text-sm text-gray-400 mt-8">
          *数据实时同步自东源E栖谷运营中心
        </p>
      </div>
    </section>
  );
}

// ---------- 生态基底组件（保持不变） ----------
function EcoHighlights({ highlights }: { highlights: typeof ecoHighlights }) {
  return (
    <section className="py-20 bg-gradient-to-b from-green-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(62,156,76,0.1)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">东源·生态基底</h2>
          <p className="text-primary-600 font-medium">全国第一批“绿水青山就是金山银山”实践创新基地</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {highlights.map((item, idx) => (
            <div key={idx} className="text-center group">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-green-50 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <item.icon className="text-4xl text-primary-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-2">{item.value}</div>
              <div className="text-gray-600">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0L60 10C120 20 240 40 360 45C480 50 600 40 720 35C840 30 960 30 1080 35C1200 40 1320 50 1380 55L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}

// ---------- 产品快捷入口组件（保持不变） ----------
function ProductQuickLinks({ links }: { links: typeof productLinks }) {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">旅居产品包</h2>
          <p className="text-gray-600">为数字游民量身打造的全维度生活工作解决方案</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="group bg-white rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-gray-100"
            >
              <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">{link.icon}</div>
              <div className="font-medium text-gray-800 group-hover:text-primary-600 transition-colors">{link.name}</div>
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-primary-500">
                了解更多 →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}