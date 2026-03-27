'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';

interface Booking {
  _id: string;
  productName: string;
  date: string;
  nights?: number;
  months?: number;
  price: number;
  status: string;
  type?: string;
}

export default function BookingsPage() {
  const { isLoggedIn } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await apiFetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error(err);
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchBookings();
  }, [isLoggedIn]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm('确定要取消这个预订吗？')) return;
    setCancelling(bookingId);
    try {
      const res = await apiFetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
      });
      if (res.ok) {
        // 刷新列表
        await fetchBookings();
      } else {
        const data = await res.json();
        alert(data.error || '取消失败');
      }
    } catch (err) {
      alert('网络错误');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <>
        <Header isLoggedIn={isLoggedIn} onLoginClick={() => {}} />
        <div className="flex justify-center items-center min-h-screen pt-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLoginClick={() => {}} />
      <main className="min-h-screen pt-16 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/profile" className="inline-flex items-center text-primary-600 hover:underline">
              <FaArrowLeft className="mr-1" /> 返回个人中心
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-6">我的预订</h1>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center">暂无预订记录</p>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking._id} className="bg-white rounded-2xl p-4 shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{booking.productName}</h3>
                      <p className="text-sm text-gray-500">
                        日期：{new Date(booking.date).toLocaleDateString()}
                        {booking.nights && ` · ${booking.nights}晚`}
                        {booking.months && ` · ${booking.months}月`}
                      </p>
                      <p className="text-sm text-gray-500">价格：¥{booking.price}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm mb-2 ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.status === 'confirmed' ? '已确认' :
                         booking.status === 'pending' ? '待确认' : '已取消'}
                      </span>
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <div>
                          <button
                            onClick={() => handleCancel(booking._id)}
                            disabled={cancelling === booking._id}
                            className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 mt-1 disabled:opacity-50"
                          >
                            <FaTrash size={12} />
                            {cancelling === booking._id ? '取消中...' : '取消预订'}
                          </button>
                        </div>
                      )}
                    </div>
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