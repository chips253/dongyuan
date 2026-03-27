'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  points: number;
}

export default function AdminUsersPage() {
  const { isLoggedIn } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiFetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />
      <main className="min-h-screen pt-16 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Link href="/admin" className="inline-flex items-center text-primary-600 mb-4">
            <FaArrowLeft className="mr-1" /> 返回管理后台
          </Link>
          <h1 className="text-3xl font-bold mb-6">用户管理</h1>
          {loading ? (
            <div>加载中...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">姓名</th>
                    <th className="px-4 py-2">邮箱</th>
                    <th className="px-4 py-2">角色</th>
                    <th className="px-4 py-2">积分</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="border-t">
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">{user.role}</td>
                      <td className="px-4 py-2">{user.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}