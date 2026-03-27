const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Badge = require('./models/Badge');

dotenv.config();

const badges = [
  { name: '早鸟', description: '清晨6点前签到', condition: '连续7天早晨签到', order: 1 },
  { name: '热心助农', description: '参与2次助农项目', condition: '完成2个助农任务', order: 2 },
  { name: '徒步达人', description: '参加3次徒步活动', condition: '报名并参加3次徒步', order: 3 },
  { name: '贡献之星', description: '累计获得1000积分', condition: '积分达到1000', order: 4 },
  { name: '话题领袖', description: '发布10篇话题', condition: '发布10篇被采纳的话题', order: 5 },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Badge.deleteMany();
    await Badge.insertMany(badges);
    console.log('称号数据初始化完成');
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
  }
};

seedDB();