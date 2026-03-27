'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import Header from '@/components/Header';
import { apiFetch } from '@/lib/api';

// 密码规则定义（与注册页面一致）
const passwordRules = [
  { id: 'length', label: '至少8位', test: (p: string) => p.length >= 8 },
  { id: 'lowercase', label: '包含小写字母', test: (p: string) => /[a-z]/.test(p) },
  { id: 'uppercase', label: '包含大写字母', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number', label: '包含数字', test: (p: string) => /[0-9]/.test(p) },
];

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 实时密码规则检查
  const passwordChecks = passwordRules.map(rule => ({
    ...rule,
    passed: rule.test(passwordForm.newPassword),
  }));

  // 获取当前用户信息
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile({ name: data.name, email: data.email });
        } else if (res.status === 401) {
          router.push('/login');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [router]);

  // 更新基本信息
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: profile.name, email: profile.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: '个人信息更新成功' });
      } else {
        setMessage({ type: 'error', text: data.error || '更新失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '网络错误，请稍后重试' });
    } finally {
      setLoading(false);
    }
  };

  // 修改密码（增加规则验证）
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. 检查新密码是否满足所有规则
    const allRulesPassed = passwordChecks.every(c => c.passed);
    if (!allRulesPassed) {
      setMessage({ type: 'error', text: '新密码不符合规则（至少8位，包含大小写字母和数字）' });
      return;
    }

    // 2. 检查两次密码是否一致
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: '两次输入的新密码不一致' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await apiFetch('/api/profile/password', {
        method: 'PUT',
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: '密码修改成功，请重新登录' });
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          localStorage.removeItem('token');
          router.push('/login');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || '修改失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '网络错误，请稍后重试' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header isLoggedIn={true} onLoginClick={() => {}} />
      <main className="min-h-screen pt-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* 返回个人中心链接 */}
          <div className="mb-6">
            <Link href="/profile" className="inline-flex items-center text-primary-600 hover:underline">
              <FaArrowLeft className="mr-1" /> 返回个人中心
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-6">账户设置</h1>

          {message && (
            <div
              className={`p-3 rounded-xl mb-4 ${
                message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* 基本信息修改（不变） */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100 mb-8">
            <h2 className="text-xl font-semibold mb-4">基本信息</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full transition disabled:opacity-50"
              >
                <FaSave />
                <span>保存修改</span>
              </button>
            </form>
          </div>

          {/* 修改密码（添加规则提示） */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">修改密码</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    className="w-full px-4 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showOldPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                  </button>
                </div>
                {/* 密码规则提示 */}
                <div className="mt-2 space-y-1">
                  {passwordChecks.map((rule) => (
                    <div key={rule.id} className="flex items-center text-xs">
                      <span className={`mr-2 ${rule.passed ? 'text-green-500' : 'text-gray-400'}`}>
                        {rule.passed ? <FaCheckCircle /> : '○'}
                      </span>
                      <span className={rule.passed ? 'text-green-600' : 'text-gray-500'}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full transition disabled:opacity-50"
              >
                <FaSave />
                <span>修改密码</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}