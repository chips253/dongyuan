const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Reward = require('./models/Reward');

dotenv.config();

const rewardsData = [
  {
    name: '咖啡券',
    description: '可在社群咖啡角兑换任意饮品一杯',
    points: 100,
    stock: 50,
    status: 'active',
    type: 'coupon',
    codePrefix: 'COFFEE',
  },
  {
    name: '单人间一晚',
    description: '基地单人间住宿一晚（需提前预约）',
    points: 2000,
    stock: 10,
    status: 'active',
    type: 'service',
  },
  {
    name: '会议室1小时',
    description: '免费使用会议室1小时',
    points: 300,
    stock: -1, // 无限
    status: 'active',
    type: 'service',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Reward.deleteMany();
    await Reward.insertMany(rewardsData);
    console.log('Rewards seeded');
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
  }
};

seedDB();