// seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Event = require('./models/Event');
const Project = require('./models/Project');
const News = require('./models/News');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected, seeding...');

    // 清空现有数据
    await User.deleteMany();
    await Event.deleteMany();
    await Project.deleteMany();
    await News.deleteMany();

    // 创建用户
    const users = await User.create([
      { name: '张三', skills: ['UI设计', '摄影'], isActive: true },
      { name: '李四', skills: ['Python开发', '数据分析'], isActive: true },
      { name: '王五', skills: ['文案策划'], isActive: false },
      { name: '赵六', skills: ['短视频拍摄', '剪辑'], isActive: true },
    ]);

    // 创建活动
    await Event.create([
      { title: '万绿湖徒步', date: new Date(2026, 2, 15), type: 'hiking' },
      { title: '助农工作坊：茶叶包装设计', date: new Date(2026, 2, 20), type: 'workshop' },
      { title: '星空夜谈会', date: new Date(2026, 2, 25), type: 'talk' },
    ]);

    // 创建助农项目
    await Project.create([
      { title: '仙坑村茶叶品牌升级', status: 'ongoing', createdBy: users[0]._id },
      { title: '智慧农场小程序开发', status: 'ongoing', createdBy: users[1]._id },
      { title: '古村落手绘地图', status: 'completed', createdBy: users[2]._id },
    ]);

    // 创建新闻
    await News.create([
      { title: '游民故事：从深圳来的UI设计师如何帮茶厂焕新', type: 'story', date: new Date(2026, 2, 1) },
      { title: '三月活动日历发布：徒步、工作坊、星空夜谈', type: 'event', date: new Date(2026, 1, 28) },
      { title: '东源再获“中国最美县域”称号', type: 'news', date: new Date(2026, 1, 25) },
    ]);

    console.log('Seeding complete');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });