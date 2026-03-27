const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Booking = require('./models/Booking');
const UserProject = require('./models/UserProject');
const UserActivity = require('./models/UserActivity');
const PointTransaction = require('./models/PointTransaction');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected, seeding users...');

    // 清空相关集合
    await User.deleteMany();
    await Booking.deleteMany();
    await UserProject.deleteMany();
    await UserActivity.deleteMany();
    await PointTransaction.deleteMany();

    // 创建测试用户
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: '李明',
      email: 'liming@example.com',
      password: hashedPassword,
      points: 2450,
      level: '白银会员',
      joinDate: new Date('2025-12-01'),
      badges: ['早鸟', '热心助农', '徒步达人'],
    });

    // 创建预订记录
    await Booking.create([
      { userId: user._id, productId: 'living-1', productName: '单人间', type: 'living', date: new Date('2026-03-21'), nights: 3, price: 360, status: 'confirmed' },
      { userId: user._id, productId: 'office-1', productName: '固定工位', type: 'office', date: new Date('2026-03-15'), months: 1, price: 800, status: 'confirmed' },
    ]);

    // 创建项目记录
    await UserProject.create([
      { userId: user._id, projectId: 'pj1', title: '仙坑村茶叶包装设计', role: '设计师', status: 'ongoing', progress: 60 },
      { userId: user._id, projectId: 'pj2', title: '古村落摄影', role: '参与者', status: 'completed', progress: 100 },
    ]);

    // 创建活动记录
    await UserActivity.create([
      { userId: user._id, activityId: 'act1', title: '万绿湖徒步', date: new Date('2026-03-21'), status: 'registered' },
    ]);

    // 创建积分流水
    await PointTransaction.create([
      { userId: user._id, amount: 100, type: 'earn', source: 'activity', description: '参加徒步活动' },
      { userId: user._id, amount: 200, type: 'earn', source: 'project', description: '完成设计项目' },
    ]);

    console.log('Seeding complete');
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
  }
};

seedUsers();