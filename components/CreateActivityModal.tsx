'use client';

import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Activity } from './ActivityModal';
import { apiFetch } from '@/lib/api';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess?: (newActivity: Activity) => void;
}

const categorySuggestions = [
  '徒步',
  '工作坊',
  '分享会',
  '社交',
  '运动',
  '读书会',
  '观影',
  '桌游',
  '其他'
];

export default function CreateActivityModal({ isOpen, onClose, onCreateSuccess }: CreateActivityModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    date: '',
    time: '',
    location: '',
    description: '',
    process: [''],
    notes: [''],
    organizerName: '',
    organizerBio: '',
    maxParticipants: '',
  });

  const handleProcessChange = (index: number, value: string) => {
    const newProcess = [...formData.process];
    newProcess[index] = value;
    setFormData({ ...formData, process: newProcess });
  };

  const addProcessStep = () => {
    setFormData({ ...formData, process: [...formData.process, ''] });
  };

  const removeProcessStep = (index: number) => {
    const newProcess = formData.process.filter((_, i) => i !== index);
    setFormData({ ...formData, process: newProcess });
  };

  const handleNotesChange = (index: number, value: string) => {
    const newNotes = [...formData.notes];
    newNotes[index] = value;
    setFormData({ ...formData, notes: newNotes });
  };

  const addNote = () => {
    setFormData({ ...formData, notes: [...formData.notes, ''] });
  };

  const removeNote = (index: number) => {
    const newNotes = formData.notes.filter((_, i) => i !== index);
    setFormData({ ...formData, notes: newNotes });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.type || !formData.date || !formData.time || !formData.location) {
      alert('请填写活动标题、类型、日期、时间和地点');
      return;
    }

    const newActivity = {
      title: formData.title,
      type: formData.type,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      description: formData.description,
      process: formData.process.filter(step => step.trim() !== ''),
      notes: formData.notes.filter(note => note.trim() !== ''),
      organizer: {
        name: formData.organizerName,
        bio: formData.organizerBio,
      },
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants, 10) : undefined,
    };

    try {
      const res = await apiFetch('/api/activities', {
        method: 'POST',
        body: JSON.stringify(newActivity),
      });
      if (res.ok) {
        const created = await res.json();
        if (onCreateSuccess) onCreateSuccess(created);
        alert('活动创建成功！');
        // 刷新整个页面，使首页统计数据即时更新
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || '创建失败');
      }
    } catch (err) {
      console.error(err);
      alert('网络错误，请稍后重试');
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
          <h2 className="text-2xl font-bold text-gray-800">发起新活动</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <FaTimes size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动标题 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="例如：万绿湖徒步"
            />
          </div>

          {/* 类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动类型 *</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="例如：徒步、工作坊、分享会..."
            />
            <div className="mt-1 flex flex-wrap gap-1">
              {categorySuggestions.map(sug => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: sug })}
                  className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full hover:bg-gray-200"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* 日期和时间 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日期 *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">时间 *</label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="例如：09:00-16:00"
              />
            </div>
          </div>

          {/* 地点 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">地点 *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="例如：万绿湖景区入口"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="详细描述活动内容"
            />
          </div>

          {/* 人数上限 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">人数上限（可选）</label>
            <input
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="不填表示无限制"
            />
          </div>

          {/* 活动流程 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动流程</label>
            {formData.process.map((step, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={step}
                  onChange={(e) => handleProcessChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  placeholder={`步骤 ${index + 1}`}
                />
                {formData.process.length > 1 && (
                  <button
                    onClick={() => removeProcessStep(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addProcessStep}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              + 添加步骤
            </button>
          </div>

          {/* 注意事项 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">注意事项</label>
            {formData.notes.map((note, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => handleNotesChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  placeholder={`注意事项 ${index + 1}`}
                />
                {formData.notes.length > 1 && (
                  <button
                    onClick={() => removeNote(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addNote}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              + 添加注意事项
            </button>
          </div>

          {/* 发起人信息 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">发起人名称</label>
            <input
              type="text"
              value={formData.organizerName}
              onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="例如：户外俱乐部"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">发起人简介（可选）</label>
            <textarea
              value={formData.organizerBio}
              onChange={(e) => setFormData({ ...formData, organizerBio: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="简单介绍发起人或组织"
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
            className="px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition"
          >
            发起活动
          </button>
        </div>
      </div>
    </div>
  );
}