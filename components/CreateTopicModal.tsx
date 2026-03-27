'use client';

import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Topic } from './TopicModal';

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess?: (newTopic: Topic) => void;
}

const categories = [
  { id: 'guide', name: '旅居攻略' },
  { id: 'creator', name: '创造者说' },
  { id: 'village', name: '乡村见闻' },
  { id: 'review', name: '活动回顾' },
];

export default function CreateTopicModal({ isOpen, onClose, onCreateSuccess }: CreateTopicModalProps) {
  const { user, isLoggedIn } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'guide',
    tags: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      alert('请先登录后再发布话题');
      return;
    }
    if (!formData.title || !formData.content) {
      alert('请填写标题和内容');
      return;
    }

    setLoading(true);
    try {
      const newTopic = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        author: user?.name || '匿名用户',
        authorId: user?.id || '',
      };

      const res = await apiFetch('/api/topics', {
        method: 'POST',
        body: JSON.stringify(newTopic),
      });
      if (res.ok) {
        const created = await res.json();
        if (onCreateSuccess) onCreateSuccess(created);
        alert('话题发布成功！');
        onClose();
        setFormData({ title: '', content: '', category: 'guide', tags: '' });
      } else {
        const data = await res.json();
        alert(data.error || '发布失败');
      }
    } catch (err) {
      console.error(err);
      alert('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">发布新话题</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <FaTimes size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="例如：万绿湖徒步攻略"
            />
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* 内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">内容 *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="分享你的经验、故事或想法..."
            />
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签（用逗号分隔）</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="例如：摄影, 攻略, 徒步"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? '发布中...' : '发布'}
          </button>
        </div>
      </div>
    </div>
  );
}