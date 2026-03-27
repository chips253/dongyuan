'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

// 密码规则定义
const passwordRules = [
  { id: 'length', label: '至少8位', test: (p: string) => p.length >= 8 },
  { id: 'lowercase', label: '包含小写字母', test: (p: string) => /[a-z]/.test(p) },
  { id: 'uppercase', label: '包含大写字母', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number', label: '包含数字', test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');

  // 实时密码规则检查
  const passwordChecks = passwordRules.map(rule => ({
    ...rule,
    passed: rule.test(formData.password),
  }));

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入姓名';
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = '请输入有效的邮箱';
    
    const allRulesPassed = passwordChecks.every(c => c.passed);
    if (!allRulesPassed) newErrors.password = '密码不符合要求';
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = '两次密码不一致';
    if (!formData.agreeTerms) newErrors.agreeTerms = '请同意用户协议';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setApiError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '注册失败');
      }

      // 注册成功，调用 login 方法存储 token 和用户信息
      // 第三个参数为 remember，注册时通常不需要长期记住，传 false
      login(data.token, data.user, false);
      router.push('/');
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-primary-600 mb-4 transition">
          <FaArrowLeft className="mr-1" /> 返回首页
        </Link>

        <Link href="/" className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="relative w-10 h-10">
              <Image
                src="/images/logo-icon.png"
                alt="东源E栖谷"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent">
              东源E栖谷
            </span>
          </div>
        </Link>

        <div className="backdrop-blur-md bg-white/70 rounded-3xl p-8 shadow-2xl border border-white/40">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">创建账号</h1>
          <p className="text-gray-500 text-center mb-8">加入东源数字游民社区</p>

          {apiError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 昵称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 border ${errors.name ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white/50`}
                  placeholder="你的昵称"
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white/50`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-10 pr-12 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white/50`}
                  placeholder="至少8位，包含大小写字母和数字"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
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
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* 确认密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-10 pr-12 py-3 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white/50`}
                  placeholder="再次输入密码"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* 同意条款 */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label className="text-sm text-gray-600">
                我已阅读并同意{' '}
                <Link href="/terms" className="text-primary-600 hover:underline">用户协议</Link>
                {' '}和{' '}
                <Link href="/privacy" className="text-primary-600 hover:underline">隐私政策</Link>
              </label>
            </div>
            {errors.agreeTerms && <p className="text-xs text-red-500">{errors.agreeTerms}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            已有账号？{' '}
            <Link href="/login" className="text-primary-600 font-semibold hover:underline">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}