'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';

interface UserProject {
  _id: string;
  title: string;
  role: string;
  status: string;
  projectStatus?: string; // 从关联的项目获取（预留）
  joinedAt: string;
}

export default function MyProjectsPage() {
  const { isLoggedIn } = useAuth();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchProjects = async () => {
      try {
        const res = await apiFetch('/api/profile/projects');
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        } else {
          setError('获取项目失败');
        }
      } catch (err) {
        console.error(err);
        setError('网络错误');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [isLoggedIn]);

  if (loading) {
    return (
      <>
        <Header isLoggedIn={isLoggedIn} onLoginClick={() => {}} />
        <div className="min-h-screen pt-16 flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLoginClick={() => {}} />
      <main className="min-h-screen pt-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/profile" className="inline-flex items-center text-primary-600 hover:underline">
              <FaArrowLeft className="mr-1" /> 返回个人中心
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-6">我的项目</h1>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {projects.length === 0 ? (
            <p className="text-gray-500 text-center">暂无参与的项目</p>
          ) : (
            <div className="space-y-4">
              {projects.map(proj => (
                <div key={proj._id} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{proj.title}</h3>
                      <p className="text-sm text-gray-500">角色：{proj.role}</p>
                      <p className="text-sm text-gray-500">加入时间：{new Date(proj.joinedAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      proj.status === 'ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {proj.status === 'ongoing' ? '进行中' : '已完成'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}