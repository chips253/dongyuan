'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import Image from 'next/image';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || '重置链接已发送，请检查邮箱');
        setEmail('');
      } else {
        setError(data.error || '发送失败');
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">忘记密码</h1>
          <p className="text-gray-500 text-center mb-8">输入您的邮箱，我们将发送重置链接</p>

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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white/50"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '发送中...' : '发送重置链接'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link href="/login" className="text-primary-600 font-semibold hover:underline">
              返回登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}