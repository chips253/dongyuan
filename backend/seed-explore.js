const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const ExploreProject = require('./models/ExploreProject');

dotenv.config();

const seedExplore = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected, seeding explore data...');

    // 获取一个用户ID（例如第一个用户）
    const user = await User.findOne();
    if (!user) {
      console.error('没有找到用户，请先运行用户种子脚本');
      process.exit(1);
    }
    const userId = user._id;

    // 清空现有项目
    await ExploreProject.deleteMany();

    // 示例项目数据（每个项目都添加 userId）
    const projects = [
      {
        title: '仙坑村茶叶包装设计',
        description: '为本地茶厂设计系列包装，需有UI/平面设计经验。项目周期两周，可远程协作。',
        requiredSkills: ['UI设计', '文案策划'],
        postedBy: '仙坑村茶厂',
        reward: '署名',
        deadline: new Date('2026-04-15'),
        hot: true,
        userId: userId, // 添加 userId
      },
      {
        title: '古村落文化短视频拍摄',
        description: '拍摄并剪辑3-5分钟宣传视频，展示东源古村落的历史与风貌。需自带设备。',
        requiredSkills: ['短视频剪辑', '摄影'],
        postedBy: '东源文旅局',
        reward: '作品展示',
        deadline: new Date('2026-04-20'),
        hot: true,
        userId: userId,
      },
      // ... 其他项目
    ];

    await ExploreProject.insertMany(projects);
    console.log('Seeding complete');
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ 种子脚本执行出错:', err);
    mongoose.disconnect();
  }
};

seedExplore();