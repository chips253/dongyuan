'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import Image from 'next/image';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

// 密码规则（与注册一致）
const passwordRules = [
  { id: 'length', label: '至少8位', test: (p: string) => p.length >= 8 },
  { id: 'lowercase', label: '包含小写字母', test: (p: string) => /[a-z]/.test(p) },
  { id: 'uppercase', label: '包含大写字母', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number', label: '包含数字', test: (p: string) => /[0-9]/.test(p) },
];

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const passwordChecks = passwordRules.map(rule => ({
    ...rule,
    passed: rule.test(newPassword),
  }));

  const validate = () => {
    if (!passwordChecks.every(c => c.passed)) return '密码不符合要求';
    if (newPassword !== confirmPassword) return '两次密码不一致';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('密码重置成功，即将跳转到登录页...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(data.error || '重置失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">设置新密码</h1>
          <p className="text-gray-500 text-center mb-8">请输入您的新密码</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 text-green-600 p-3 rounded-xl mb-4 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 新密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white/50"
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
            </div>

            {/* 确认密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white/50"
                  placeholder="再次输入密码"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirm ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '提交中...' : '重置密码'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}