const Topic = require('../models/Topic');

// 获取话题列表
exports.getTopics = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const topics = await Topic.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Topic.countDocuments(filter);
    res.json({
      topics,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取单个话题
exports.getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: '话题不存在' });
    // 确保 comments 是数组
    if (!topic.comments) topic.comments = [];
    res.json(topic);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 发布新话题（需登录）
exports.createTopic = async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ error: '缺少必填字段' });
    }
    const newTopic = new Topic({
      title,
      content,
      author: req.user.name,
      authorId: req.user.id,
      tags: tags || [],
      category,
    });
    await newTopic.save();
    res.status(201).json(newTopic);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 点赞话题
exports.likeTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: '话题不存在' });
    topic.likes += 1;
    await topic.save();
    res.json({ likes: topic.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 添加评论
exports.addComment = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: '话题不存在' });
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: '评论内容不能为空' });

    // 确保 comments 是数组
    if (!topic.comments) topic.comments = [];

    topic.comments.push({
      user: req.user.name,
      userId: req.user.id,
      content,
    });
    topic.commentsCount = (topic.commentsCount || 0) + 1;
    await topic.save();
    res.status(201).json({ comment: topic.comments[topic.comments.length - 1] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};