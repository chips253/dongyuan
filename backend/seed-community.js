const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Activity = require('./models/Activity');
const Topic = require('./models/Topic');
const BuddyCategory = require('./models/BuddyCategory');
const WechatHighlight = require('./models/WechatHighlight');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected, seeding community data...');

    // 清空现有数据
    await Activity.deleteMany();
    await Topic.deleteMany();
    await BuddyCategory.deleteMany();
    await WechatHighlight.deleteMany();

    // 活动数据
    const activities = [
      {
        id: 'act-1',
        title: '万绿湖徒步·春日赏景',
        date: '2026-03-21',
        time: '09:00-16:00',
        location: '万绿湖景区入口',
        participants: 18,
        maxParticipants: 30,
        type: 'hiking',
        description: '全程约10公里，难度适中，沿途可欣赏万绿湖美景。',
        process: ['09:00 集合', '09:30 出发', '12:00 午餐', '16:00 结束'],
        notes: ['穿徒步鞋', '自带午餐和水'],
        organizer: { name: '户外俱乐部', bio: '专业户外团队' },
      },
      {
        id: 'act-2',
        title: 'UI设计技能工作坊',
        date: '2026-03-22',
        time: '14:00-17:00',
        location: '2号楼 共享办公区',
        participants: 12,
        maxParticipants: 20,
        type: 'workshop',
        description: '由资深UI设计师分享实战经验，包含Figma技巧、设计系统搭建等内容。',
        process: ['14:00 破冰', '14:30 演示', '16:00 实战'],
        notes: ['自带电脑', '安装Figma'],
        organizer: { name: '设计社群', bio: '东源设计爱好者' },
      },
    ];
    await Activity.insertMany(activities);
    console.log(`✅ 成功插入 ${activities.length} 条活动数据`);

    // 话题数据
    const topics = [
      {
        id: 'topic-1',
        title: '万绿湖周边必吃美食清单',
        content: '在万绿湖住了两周，整理了几家地道农家乐...',
        author: '吃货小李',
        createdAt: new Date('2026-03-14'),
        likes: 24,
        comments: [],
        commentsCount: 8,
        tags: ['美食', '攻略'],
        category: 'guide',
      },
      {
        id: 'topic-2',
        title: '远程工作如何保持高效？',
        content: '在数字游民社区待了一个月，总结了几条效率提升方法...',
        author: '自由职业者李华',
        createdAt: new Date('2026-03-13'),
        likes: 36,
        comments: [],
        commentsCount: 15,
        tags: ['效率', '经验'],
        category: 'guide',
      },
    ];
    await Topic.insertMany(topics);
    console.log(`✅ 成功插入 ${topics.length} 条话题数据`);

    // 搭子类别数据（新增群组）
    const buddies = [
      {
        id: 'buddy-1',
        name: '东源数字游民公社总群',
        description: '东源数字游民官方总群，资讯、活动、互助',
        icon: 'FaUsers',
        qrCode: '/images/qr-main.jpg',
        groupLink: 'https://weixin.qq.com/g/main',
        order: 1,
      },
      {
        id: 'buddy-2',
        name: '远程办公 & 技能合作群',
        description: '远程工作交流、技能合作、项目对接',
        icon: 'FaLaptop',
        qrCode: '/images/qr-work.jpg',
        groupLink: 'https://weixin.qq.com/g/work',
        order: 2,
      },
      {
        id: 'buddy-3',
        name: '客家体验 & 生态探索群',
        description: '客家文化、自然探索、乡村漫游',
        icon: 'FaTree',
        qrCode: '/images/qr-culture.jpg',
        groupLink: 'https://weixin.qq.com/g/culture',
        order: 3,
      },
      {
        id: 'buddy-4',
        name: '带货 & 仓储 & 物流群',
        description: '电商直播、农产品带货、仓储物流交流',
        icon: 'FaBox',
        qrCode: '/images/qr-ecommerce.jpg',
        groupLink: 'https://weixin.qq.com/g/ecommerce',
        order: 4,
      },
      {
        id: 'buddy-5',
        name: '健身 & 美食 & 探店群',
        description: '运动健身、美食探店、城市生活',
        icon: 'FaUtensils',
        qrCode: '/images/qr-life.jpg',
        groupLink: 'https://weixin.qq.com/g/life',
        order: 5,
      },
      {
        id: 'buddy-6',
        name: '游民 × 乡村振兴合作群',
        description: '数字游民助力乡村振兴，共创项目',
        icon: 'FaHandsHelping',
        qrCode: '/images/qr-rural.jpg',
        groupLink: 'https://weixin.qq.com/g/rural',
        order: 6,
      },
    ];
    await BuddyCategory.insertMany(buddies);
    console.log(`✅ 成功插入 ${buddies.length} 条搭子类别数据`);

    // 微信群精选数据
    const wechat = [
      {
        id: 'wh-1',
        title: '徒步群热议：周末去哪条线？',
        excerpt: '群友们推荐了新丰江环线和缺牙山...',
        messages: [
          { sender: '阿强', content: '这周末有人想去徒步吗？', time: '14:30', isSelf: false },
          { sender: '小美', content: '我推荐新丰江环线，风景超美', time: '14:32', isSelf: false },
          { sender: '老张', content: '缺牙山也不错，登顶视野开阔', time: '14:33', isSelf: false },
        ],
      },
    ];
    await WechatHighlight.insertMany(wechat);
    console.log(`✅ 成功插入 ${wechat.length} 条微信群精选数据`);

    console.log('Seeding complete');
    mongoose.disconnect();
  } catch (err) {
    console.error('种子脚本执行出错:', err);
    mongoose.disconnect();
  }
};

seed();