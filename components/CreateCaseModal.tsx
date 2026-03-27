'use client';

import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess?: (newCase: any) => void;
}

const categories = [
  { id: 'agriculture', name: '助农案例' },
  { id: 'culture', name: '文化共创' },
  { id: 'skill', name: '技能传递' },
  { id: 'other', name: '其他' },
];

const MAX_IMAGES = 9;

export default function CreateCaseModal({ isOpen, onClose, onCreateSuccess }: CreateCaseModalProps) {
  const { isLoggedIn, user } = useAuth(); // 获取真实登录状态和用户信息
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'agriculture',
    tags: '',
    outcome: '',
    participants: '',
    year: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (imageFiles.length + files.length > MAX_IMAGES) {
      alert(`最多只能上传 ${MAX_IMAGES} 张图片`);
      return;
    }
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      alert('请先登录后再提交案例');
      return;
    }
    if (!formData.title || !formData.description || !formData.outcome) {
      alert('请填写标题、描述和成果');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      // 前端 tags 是逗号分隔的字符串，后端可接收字符串（内部再处理）或数组；这里直接传字符串
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('outcome', formData.outcome);
      formDataToSend.append('participants', formData.participants);
      formDataToSend.append('year', formData.year);
      if (user?.id) formDataToSend.append('authorId', user.id);
      if (user?.name) formDataToSend.append('author', user.name);

      imageFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      const res = await apiFetch('/api/cases', {
        method: 'POST',
        body: formDataToSend,
      });
      if (res.ok) {
        const created = await res.json();
        if (onCreateSuccess) onCreateSuccess(created);
        alert('案例提交成功！');
        onClose();
        setFormData({ title: '', description: '', category: 'agriculture', tags: '', outcome: '', participants: '', year: '' });
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        setImageFiles([]);
        setImagePreviews([]);
      } else {
        const data = await res.json();
        alert(data.error || '提交失败');
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
          <h2 className="text-2xl font-bold text-gray-800">提交共创案例</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <FaTimes size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">案例标题 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="例如：仙坑村茶叶包装设计"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">简短描述 *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="一句话概括案例"
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

          {/* 图片上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">图片（最多9张）</label>
            <div className="flex flex-wrap gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={preview}
                    alt={`预览 ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 text-xs"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
              {imagePreviews.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary-500 hover:text-primary-500 transition"
                >
                  <FaPlus />
                  <span className="text-xs mt-1">上传</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签（用逗号分隔）</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="例如：设计, 助农, 乡村振兴"
            />
          </div>

          {/* 成果 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">成果摘要 *</label>
            <input
              type="text"
              value={formData.outcome}
              onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="例如：销量提升30%，建立线上档案库"
            />
          </div>

          {/* 参与人数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">参与人数（可选）</label>
            <input
              type="number"
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="例如：5"
            />
          </div>

          {/* 年份 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">年份（可选）</label>
            <input
              type="text"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="例如：2025"
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
            {loading ? '提交中...' : '提交案例'}
          </button>
        </div>
      </div>
    </div>
  );
}