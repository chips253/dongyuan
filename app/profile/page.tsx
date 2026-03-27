'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  FaUser, FaCalendarCheck, FaCalendarAlt, FaTasks, FaHeart, FaCog,
  FaSignOutAlt, FaTicketAlt, FaUsers, FaArrowRight,
  FaMedal, FaShoppingBag, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import Header from '@/components/Header';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  level: string;
  joinDate: string;
  badges: string[];
  activeBadge?: string;
  selectedBadge?: string;
  displayBadge?: string;
  role?: string;
}

interface Stats {
  bookings: number;
  projects: number;
  activities: number;
  // cases 已移除
}

const levelThresholds = [
  { level: '青铜会员', minPoints: 0, icon: '🥉' },
  { level: '白银会员', minPoints: 1000, icon: '🥈' },
  { level: '黄金会员', minPoints: 3000, icon: '🥇' },
  { level: '铂金会员', minPoints: 6000, icon: '💎' },
  { level: '钻石会员', minPoints: 10000, icon: '👑' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLevels, setShowLevels] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const [profile, statsData] = await Promise.all([
          fetchWithAuth('/api/profile'),
          fetchWithAuth('/api/profile/stats'),
        ]);

        setUser(profile);
        setStats(statsData.stats);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleLogout = () => {
    logout();
  };

  const getLevelInfo = (points: number) => {
    const sorted = [...levelThresholds].sort((a, b) => a.minPoints - b.minPoints);
    let currentLevel = sorted[0];
    let nextLevel = null;
    for (let i = 0; i < sorted.length; i++) {
      if (points >= sorted[i].minPoints) {
        currentLevel = sorted[i];
      } else {
        nextLevel = sorted[i];
        break;
      }
    }
    return { currentLevel, nextLevel };
  };

  const getDisplayBadge = (user: UserProfile): string | null => {
    if (user.activeBadge) return user.activeBadge;
    if (user.selectedBadge) return user.selectedBadge;
    if (user.displayBadge) return user.displayBadge;
    if (user.badges && user.badges.length > 0) return user.badges[0];
    return null;
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-16 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-16 flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </main>
      </>
    );
  }

  if (!user) return null;

  const { currentLevel, nextLevel } = getLevelInfo(user.points);
  const pointsProgress = nextLevel 
    ? Math.min(100, ((user.points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)
    : 100;

  const displayBadge = getDisplayBadge(user);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* 页面标题与问候 */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">个人中心</h1>
              <p className="text-gray-500 mt-1">欢迎回来，{user.name}</p>
            </div>
            <div className="flex space-x-3">
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition border border-gray-200"
                >
                  <FaCog className="text-primary-600" />
                  <span>管理后台</span>
                </Link>
              )}
            </div>
          </div>

          {/* 用户信息卡片 */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-6 mb-8 text-white shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white/20 ring-4 ring-white/30">
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl">
                    <FaUser />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-2">
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <span className="bg-white/20 text-sm px-3 py-1 rounded-full">
                    {currentLevel.level}
                  </span>
                </div>
                <p className="text-white/80 text-sm mt-1">{user.email}</p>

                {/* 积分进度条 */}
                <div className="mt-3 max-w-md">
                  <div className="flex justify-between text-xs text-white/80 mb-1">
                    <span>积分 {user.points}</span>
                    {nextLevel ? (
                      <span>
                        距离 {nextLevel.level} 还需 {nextLevel.minPoints - user.points} 分
                      </span>
                    ) : (
                      <span>已达最高等级</span>
                    )}
                  </div>
                  <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${pointsProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* 称号显示区域 */}
              <div className="flex gap-2 items-center">
                {displayBadge ? (
                  <div className="bg-yellow-500/20 text-yellow-200 px-3 py-2 rounded-full text-sm flex items-center gap-1">
                    <FaMedal className="text-yellow-300" />
                    <span className="text-white">{displayBadge}</span>
                  </div>
                ) : (
                  <Link href="/profile/badges" className="bg-white/20 px-3 py-2 rounded-full text-sm hover:bg-white/30 transition">
                    设置称号
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* 统计卡片网格（3列，移除“我的案例”） */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {stats && (
              <>
                <Link href="/profile/bookings" className="group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-primary-600">{stats.bookings}</div>
                      <div className="text-gray-500 text-sm mt-1">我的预订</div>
                    </div>
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 text-xl group-hover:scale-110 transition">
                      <FaTicketAlt />
                    </div>
                  </div>
                </Link>
                <Link href="/profile/projects" className="group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-green-600">{stats.projects}</div>
                      <div className="text-gray-500 text-sm mt-1">我的项目</div>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 text-xl group-hover:scale-110 transition">
                      <FaTasks />
                    </div>
                  </div>
                </Link>
                <Link href="/profile/activities" className="group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-orange-600">{stats.activities}</div>
                      <div className="text-gray-500 text-sm mt-1">我的活动</div>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 text-xl group-hover:scale-110 transition">
                      <FaCalendarCheck />
                    </div>
                  </div>
                </Link>
              </>
            )}
          </div>

          {/* 会员等级说明卡片 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
            <button
              onClick={() => setShowLevels(!showLevels)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <FaMedal className="text-yellow-500 text-xl" />
                <h2 className="text-xl font-semibold">会员等级说明</h2>
              </div>
              {showLevels ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {showLevels && (
              <div className="mt-4 space-y-2">
                {levelThresholds.map((level) => (
                  <div key={level.level} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{level.icon}</span>
                      <span className="font-medium">{level.level}</span>
                    </div>
                    <span className="text-gray-600">{level.minPoints} 积分起</span>
                  </div>
                ))}
                <p className="text-xs text-gray-400 mt-2">* 积分累计达到对应门槛即可升级，权益逐步解锁。</p>
              </div>
            )}
          </div>

          {/* 快速操作栏 */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/profile/settings" className="px-6 py-3 bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
              <FaCog /> 账户设置
            </Link>
            <Link href="/profile/mall" className="px-6 py-3 bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
              <FaShoppingBag /> 积分商城
            </Link>
            <Link href="/profile/badges" className="px-6 py-3 bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
              <FaMedal /> 我的称号
            </Link>
            <Link href="/profile/projects/posted" className="px-6 py-3 bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
              <FaTasks /> 我发布的项目
            </Link>
            <Link href="/profile/activities/posted" className="px-6 py-3 bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
              <FaCalendarAlt /> 我发布的活动
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-50 border border-red-200 rounded-full text-red-600 hover:bg-red-100 transition shadow-sm flex items-center gap-2"
            >
              <FaSignOutAlt /> 退出登录
            </button>
          </div>
        </div>
      </main>
    </>
  );
}