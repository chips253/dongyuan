'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaTimes, FaHeart, FaComment, FaUser } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';

export interface Topic {
  _id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar?: string;
  createdAt: string;
  likes: number;
  commentsCount?: number;
  tags: string[];
  images?: string[];
  comments?: Array<{
    _id?: string;
    id?: string;
    user: string;
    userId?: string;
    content: string;
    createdAt: string;
  }>;
}

interface TopicModalProps {
  topic: Topic | null;
  onClose: () => void;
  onLike?: (topic: Topic) => void;
  isLoggedIn: boolean;
}

export default function TopicModal({ topic, onClose, onLike, isLoggedIn }: TopicModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // 本地评论列表
  const [localComments, setLocalComments] = useState<Topic['comments']>([]);

  // 当外部 topic 变化时，同步本地评论
  useEffect(() => {
    setLocalComments(topic?.comments ?? []);
  }, [topic]);

  if (!topic) return null;

  // 使用本地评论列表
  const comments = localComments;

  const handleLike = () => {
    if (onLike) {
      onLike(topic);
    } else {
      if (!isLoggedIn) {
        alert('请先登录后再点赞');
        return;
      }
      alert(`点赞“${topic.title}”成功！`);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('请先登录后再评论');
      return;
    }
    if (!commentText.trim()) {
      alert('请输入评论内容');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/topics/${topic._id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: commentText }),
      });
      if (res.ok) {
        const data = await res.json(); // 假设返回 { comment: {...} }
        const newComment = data.comment;
        // 将新评论添加到本地评论列表（放在最前面，便于看到最新评论）
        setLocalComments(prev => [newComment, ...prev]);
        setCommentText('');
      } else {
        const data = await res.json();
        alert(data.error || '评论失败');
      }
    } catch (err) {
      console.error(err);
      alert('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <FaTimes size={20} className="text-gray-500" />
          </button>
        </div>

        {/* 标题和标签 */}
        <h2 className="text-2xl font-bold text-gray-800 mb-3">{topic.title}</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {topic.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        {/* 作者信息 */}
        <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-primary-600 font-bold">
            {topic.author[0]}
          </div>
          <div>
            <p className="font-medium text-gray-800">{topic.author}</p>
            <p className="text-xs text-gray-400">{new Date(topic.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* 图片展示 */}
        {topic.images && topic.images.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-2">
              {topic.images.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition"
                  onClick={() => setSelectedImage(img)}
                >
                  <Image
                    src={img}
                    alt={`话题图片 ${idx + 1}`}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 正文内容 */}
        <div className="mb-6">
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{topic.content}</p>
        </div>

        {/* 互动数据 */}
        <div className="flex items-center space-x-4 mb-6 text-gray-500">
          <button
            onClick={handleLike}
            className="flex items-center space-x-2 hover:text-red-500 transition"
          >
            <FaHeart className="text-lg" />
            <span>{topic.likes}</span>
          </button>
          <div className="flex items-center space-x-2">
            <FaComment className="text-lg" />
            <span>{topic.commentsCount ?? comments.length} 条评论</span>
          </div>
        </div>

        {/* 评论区域 */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-lg font-semibold mb-3">评论</h3>
          {comments.length === 0 ? (
            <p className="text-gray-400 text-sm">暂无评论，快来抢沙发~</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment, index) => (
                <div key={comment._id || comment.id || index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs">
                    {comment.user[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{comment.user}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleCommentSubmit} className="mt-4">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="写下你的评论..."
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={2}
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-full text-sm hover:bg-primary-700 transition disabled:opacity-50"
            >
              {submitting ? '发布中...' : '发布评论'}
            </button>
          </form>
        </div>
      </div>

      {/* 图片放大预览模态框 */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <Image
              src={selectedImage}
              alt="放大图片"
              width={1200}
              height={1200}
              className="object-contain w-full h-full"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}