'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaSearch, FaUsers, FaTrophy, FaMedal, FaPlus,
  FaStar, FaRegClock, FaTimes
} from 'react-icons/fa';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';

interface Project {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  postedBy: string;
  reward?: string;
  deadline?: string;
  hot?: boolean;
}

interface UserRank {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  rank: number;
  skills: string[];
}

interface Skill {
  name: string;
  count: number;
}

export default function ExplorePage() {
  const { isLoggedIn } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [rankings, setRankings] = useState<UserRank[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    requiredSkills: [] as string[],
    reward: '',
    deadline: '',
  });
  const [customSkillsInput, setCustomSkillsInput] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch('/api/explore');
        if (!res.ok) throw new Error('获取项目失败');
        const data = await res.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error(err);
        setError('加载项目失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await apiFetch('/api/skills');
        if (!res.ok) throw new Error('获取技能失败');
        const data = await res.json();
        setSkills(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await apiFetch('/api/rankings?limit=8');
        if (!res.ok) throw new Error('获取排行榜失败');
        const data = await res.json();
        setRankings(data.rankings || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRankings();
  }, []);

  const toggleRequiredSkill = (skill: string) => {
    setNewProject(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...prev.requiredSkills, skill]
    }));
  };

  const handlePublish = async () => {
    if (!isLoggedIn) {
      alert('请先登录后再发布项目');
      return;
    }

    const customSkills = customSkillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== '');
    const allSkills = Array.from(new Set([...newProject.requiredSkills, ...customSkills]));

    if (!newProject.title || !newProject.description || allSkills.length === 0) {
      alert('请填写项目标题、描述，并至少选择一个或填写一个技能');
      return;
    }

    try {
      const res = await apiFetch('/api/explore', {
        method: 'POST',
        body: JSON.stringify({
          title: newProject.title,
          description: newProject.description,
          requiredSkills: allSkills,
          reward: newProject.reward,
          deadline: newProject.deadline,
          postedBy: '当前用户',
        }),
      });
      if (!res.ok) throw new Error('发布失败');
      const created = await res.json();

      setProjects(prev => [created, ...prev]);

      setIsModalOpen(false);
      setNewProject({ title: '', description: '', requiredSkills: [], reward: '', deadline: '' });
      setCustomSkillsInput('');
    } catch (err) {
      console.error(err);
      alert('发布失败，请稍后重试');
    }
  };

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLoginClick={() => {}} />
      <main className="min-h-screen pt-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* 页面标题与发布按钮 */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-primary-600 via-green-500 to-primary-400 bg-clip-text text-transparent">
                探索 · 东源
              </h1>
              <p className="text-gray-600 max-w-2xl text-lg">
                发现与你技能匹配的共创项目，或发布你的需求
              </p>
            </div>
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  alert('请先登录');
                  return;
                }
                setIsModalOpen(true);
              }}
              className="mt-4 md:mt-0 flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full shadow-lg transition"
            >
              <FaPlus />
              <span>发布项目</span>
            </button>
          </div>

          {/* 主内容区 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧项目列表 */}
            <div className="lg:col-span-2">
              <div className="mb-5">
                <h2 className="text-xl font-bold flex items-center text-gray-800">
                  <div className="w-1 h-6 bg-primary-500 rounded-full mr-3"></div>
                  项目列表
                </h2>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="text-center py-20 text-red-500">{error}</div>
              ) : projects.length === 0 ? (
                <div className="backdrop-blur-sm bg-white/50 rounded-3xl p-12 text-center text-gray-500 border border-dashed border-gray-300">
                  <FaSearch className="mx-auto text-4xl text-gray-300 mb-3" />
                  <p className="text-lg">暂无项目</p>
                  <p className="text-sm mt-1">点击“发布项目”创建第一个需求</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {projects.map(project => (
                    <div
                      key={project._id}
                      onClick={() => openProjectDetail(project)}
                      className="group relative bg-white rounded-3xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer"
                    >
                      <h3 className="text-lg font-semibold mb-2 pr-16 group-hover:text-primary-600 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {project.requiredSkills.map(skill => (
                          <span
                            key={skill}
                            className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center justify-between text-sm">
                        <div className="flex items-center text-gray-500">
                          <FaUsers className="mr-1 text-gray-400" size={12} />
                          <span className="truncate max-w-[120px]">{project.postedBy}</span>
                        </div>
                        {project.reward && (
                          <span className="text-primary-600 font-medium bg-primary-50 px-2 py-0.5 rounded-full text-xs">
                            {project.reward}
                          </span>
                        )}
                      </div>
                      {project.deadline && (
                        <div className="mt-2 flex items-center text-xs text-gray-400">
                          <FaRegClock className="mr-1" size={10} />
                          截止：{new Date(project.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 右侧排行榜 */}
            <div className="lg:col-span-1">
              <div className="backdrop-blur-md bg-white/30 rounded-3xl p-6 shadow-xl border border-white/40 sticky top-24">
                <h2 className="text-xl font-bold flex items-center mb-5 text-gray-800">
                  <FaTrophy className="mr-2 text-yellow-500" />
                  E栖积分榜
                  <span className="ml-auto text-sm font-normal text-gray-500">每周更新</span>
                </h2>
                <div className="space-y-2">
                  {rankings.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center p-3 rounded-2xl hover:bg-white/50 transition group"
                    >
                      <div className="w-8 text-center font-bold">
                        {user.rank <= 3 ? (
                          <FaMedal className={`text-xl ${
                            user.rank === 1 ? 'text-yellow-400' :
                            user.rank === 2 ? 'text-gray-400' : 'text-amber-600'
                          }`} />
                        ) : (
                          <span className="text-gray-400">{user.rank}</span>
                        )}
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-600 overflow-hidden ml-2 shadow-sm">
                        {user.avatar ? (
                          <Image src={user.avatar} alt={user.name} width={40} height={40} />
                        ) : (
                          <span className="font-medium">{user.name[0]}</span>
                        )}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.skills.slice(0, 2).join(' · ')}</p>
                      </div>
                      <div className="ml-2 text-primary-600 font-bold bg-primary-50 px-2 py-1 rounded-full text-sm">
                        {user.points}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/50 text-center">
                  <Link
                    href="/rankings"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center group"
                  >
                    查看完整榜单
                    <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 底部说明 */}
          <div className="mt-10 text-center text-sm text-gray-400 bg-white/30 backdrop-blur-sm rounded-full py-2 px-6 inline-block mx-auto">
            * 积分每5分钟更新，项目需求来自社区成员
          </div>
        </div>
      </main>

      {/* 发布项目模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">发布新项目</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目标题 *</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="例如：仙坑村茶叶包装设计"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目描述 *</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="详细描述项目需求、背景等"
                />
              </div>

              {/* 所需技能：按钮选择 + 自定义输入框 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">所需技能 *</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map(skill => (
                    <button
                      key={skill.name}
                      type="button"
                      onClick={() => toggleRequiredSkill(skill.name)}
                      className={`px-3 py-1.5 rounded-full text-sm transition ${
                        newProject.requiredSkills.includes(skill.name)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={customSkillsInput}
                    onChange={(e) => setCustomSkillsInput(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="或输入新技能，多个技能用英文逗号分隔，例如：设计,摄影"
                  />
                  <p className="text-xs text-gray-400 mt-1">可手动输入自定义技能，多个技能用英文逗号分隔</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">回报（可选）</label>
                <input
                  type="text"
                  value={newProject.reward}
                  onChange={(e) => setNewProject({ ...newProject, reward: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="例如：署名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">截止日期（可选）</label>
                <input
                  type="date"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition"
              >
                取消
              </button>
              <button
                onClick={handlePublish}
                className="px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition"
              >
                发布项目
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 项目详情模态框 */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={closeProjectModal}
          isLoggedIn={isLoggedIn}
        />
      )}
    </>
  );
}

// 项目详情模态框组件（已移除热门标签）
function ProjectDetailModal({ project, onClose, isLoggedIn }: { 
  project: Project; 
  onClose: () => void; 
  isLoggedIn: boolean;
}) {
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyProjects, setHistoryProjects] = useState<Project[]>([]);
  const [applying, setApplying] = useState(false);
  const [application, setApplication] = useState<any>(null); // 存储当前用户的申请状态

  // 获取当前用户的申请状态
  useEffect(() => {
    const fetchApplicationStatus = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await apiFetch(`/api/explore/${project._id}/application`);
        if (res.ok) {
          const data = await res.json();
          setApplication(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchApplicationStatus();
  }, [project, isLoggedIn]);

  // 获取发起人的其他项目
  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await apiFetch(`/api/explore?postedBy=${encodeURIComponent(project.postedBy)}&exclude=${project._id}&limit=3`);
        if (res.ok) {
          const data = await res.json();
          setHistoryProjects(data.projects || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [project]);

  const handleApply = async () => {
    if (!isLoggedIn) {
      alert('请先登录后再申请');
      return;
    }
    setApplying(true);
    try {
      const res = await apiFetch(`/api/explore/${project._id}/apply`, { method: 'POST' });
      if (res.ok) {
        alert('申请已提交，发起人将尽快与您联系');
        // 刷新申请状态
        const statusRes = await apiFetch(`/api/explore/${project._id}/application`);
        if (statusRes.ok) {
          const data = await statusRes.json();
          setApplication(data);
        }
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || '申请失败');
      }
    } catch (err) {
      alert('网络错误，请稍后重试');
    } finally {
      setApplying(false);
    }
  };

  const handleCancelApplication = async () => {
    if (!application || !application.exists) return;
    if (!confirm('确定取消申请吗？')) return;
    try {
      const res = await apiFetch(`/api/explore/applications/${application._id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('申请已取消');
        setApplication(null); // 清除申请状态
        onClose(); // 关闭模态框
      } else {
        const data = await res.json();
        alert(data.error || '取消失败');
      }
    } catch (err) {
      alert('网络错误');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <FaTimes size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{project.title}</h2>
          {/* 热门标签已移除 */}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">项目描述</h3>
          <p className="text-gray-600 whitespace-pre-line">{project.description}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">所需技能</h3>
          <div className="flex flex-wrap gap-2">
            {project.requiredSkills.map(skill => (
              <span key={skill} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">发起人</h3>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
              {project.postedBy[0]}
            </div>
            <div>
              <p className="font-medium text-gray-800">{project.postedBy}</p>
            </div>
          </div>
        </div>

        {historyProjects.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">该发起人的其他项目</h3>
            <div className="space-y-3">
              {historyProjects.map(hp => (
                <div key={hp._id} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer">
                  <p className="font-medium text-gray-800">{hp.title}</p>
                  <p className="text-sm text-gray-500 truncate">{hp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          {project.reward && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">回报</h3>
              <p className="text-primary-600 font-medium">{project.reward}</p>
            </div>
          )}
          {project.deadline && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">截止日期</h3>
              <p className="text-gray-700">{new Date(project.deadline).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* 按钮区域：根据申请状态显示不同按钮 */}
        <div className="flex flex-col gap-2">
          {application?.exists && application.status === 'pending' ? (
            <button
              onClick={handleCancelApplication}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-full text-lg font-semibold transition shadow-md"
            >
              取消申请
            </button>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-full text-lg font-semibold transition shadow-md disabled:opacity-50"
            >
              {applying ? '提交中...' : '申请参与'}
            </button>
          )}
          <p className="text-xs text-gray-400 text-center mt-1">
            {isLoggedIn 
              ? (application?.exists && application.status === 'pending' 
                  ? '点击取消申请，可重新申请其他项目' 
                  : '点击申请，发起人将收到通知')
              : '请先登录后再申请'}
          </p>
        </div>
      </div>
    </div>
  );
}