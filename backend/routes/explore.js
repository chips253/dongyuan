const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const ExploreProject = require('../models/ExploreProject');
const ProjectApplication = require('../models/ProjectApplication');
const UserProject = require('../models/UserProject');
const {
  getProjects,
  getProjectById,
  createProject
} = require('../controllers/exploreController');

// 获取项目列表（无需认证）
router.get('/', getProjects);

// 获取单个项目详情（无需认证）
router.get('/:id', getProjectById);

// 发布新项目（需要认证）
router.post('/', auth, createProject);

// 申请参与项目（需要认证，事务处理）
router.post('/:id/apply', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const project = await ExploreProject.findById(req.params.id).session(session);
    if (!project) {
      throw new Error('项目不存在');
    }

    // 检查项目状态
    if (project.status === 'completed') {
      throw new Error('项目已完成，无法申请');
    }

    // 检查是否已申请过（排除已取消的申请）
    const existing = await ProjectApplication.findOne({
      projectId: project._id,
      applicantId: req.user.id,
      status: { $in: ['pending', 'accepted', 'rejected'] }
    }).session(session);
    if (existing) {
      throw new Error('您已申请过该项目，请勿重复申请');
    }

    // 保存申请记录
    const application = new ProjectApplication({
      projectId: project._id,
      applicantId: req.user.id,
      message: req.body.message || '',
      status: 'pending'
    });
    await application.save({ session });

    // 创建用户参与项目记录（UserProject）
    const userProject = new UserProject({
      userId: req.user.id,
      projectId: project._id,
      title: project.title,
      role: '参与者',
      status: 'ongoing',
      progress: 0,
      joinedAt: new Date(),
    });
    await userProject.save({ session });

    await session.commitTransaction();
    res.json({ message: '申请已提交，发起人将尽快与您联系' });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

// 发布者查看某项目的所有申请（需验证是项目发布者，并过滤已取消的申请）
router.get('/:id/applications', auth, async (req, res) => {
  try {
    const project = await ExploreProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }
    // 验证当前用户是否为项目发布者
    if (project.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: '无权限查看' });
    }
    const applications = await ProjectApplication.find({
      projectId: project._id,
      status: { $ne: 'cancelled' }
    })
      .populate('applicantId', 'name email avatar phone')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 项目发布者更新项目状态（完成项目）
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const project = await ExploreProject.findById(req.params.id);
    if (!project) return res.status(404).json({ error: '项目不存在' });
    if (project.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: '无权限' });
    }
    const { status } = req.body;
    if (!['ongoing', 'completed'].includes(status)) {
      return res.status(400).json({ error: '无效状态' });
    }
    project.status = status;
    await project.save();

    // 如果项目标记为已完成，同步更新所有关联的 UserProject 状态为 completed
    if (status === 'completed') {
      await UserProject.updateMany(
        { projectId: project._id },
        { status: 'completed' }
      );
    }

    res.json({ message: '项目状态更新成功', status: project.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 申请者取消自己的申请
router.delete('/applications/:appId', auth, async (req, res) => {
  try {
    const application = await ProjectApplication.findById(req.params.appId);
    if (!application) return res.status(404).json({ error: '申请不存在' });
    if (application.applicantId.toString() !== req.user.id) {
      return res.status(403).json({ error: '无权限' });
    }
    if (application.status !== 'pending') {
      return res.status(400).json({ error: '只能取消待处理的申请' });
    }
    application.status = 'cancelled';
    await application.save();

    // 删除对应的 UserProject 记录
    await UserProject.findOneAndDelete({
      projectId: application.projectId,
      userId: req.user.id
    });

    res.json({ message: '申请已取消' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取当前用户对某个项目的申请状态（返回 _id 供取消申请使用）
router.get('/:id/application', auth, async (req, res) => {
  try {
    const application = await ProjectApplication.findOne({
      projectId: req.params.id,
      applicantId: req.user.id
    }).select('_id status message createdAt'); // 确保选择 _id
    if (!application) {
      return res.json({ exists: false });
    }
    res.json({
      exists: true,
      _id: application._id,               // 添加 _id
      status: application.status,
      message: application.message,
      createdAt: application.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;