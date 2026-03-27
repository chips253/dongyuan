const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Package = require('./models/Package');

dotenv.config();

// 模拟产品数据（与前端 page.tsx 中的 mockProducts 一致）
const productsData = [
  // ==================== 居住 ====================
  {
    id: 'living-1',
    name: '青年旅社床位',
    category: 'living',
    description: '上下铺实木床，含床帘、储物柜，公共卫浴与洗衣区，社交氛围浓厚',
    price: 20,
    unit: '晚/床位',
    weeklyPrice: 120,   // 周租 120元 (约17.1元/天)
    monthlyPrice: 350,  // 月租 350元
    tags: ['上下铺', '床帘', '储物柜', '公共卫浴', '洗衣房'],
    features: ['实木床', '床头灯', '充电接口', '24h热水', '免费Wi-Fi'],
    nearby: ['食堂 – 步行3分钟', '健身房 – 步行2分钟', '便利店 – 步行2分钟'],
  },
  {
    id: 'living-2',
    name: '经济单人间',
    category: 'living',
    description: '独立卫浴，安静私密，适合长期定居',
    price: 0,
    unit: '月',
    monthlyPrice: 800,  // 暂定 800元/月
    tags: ['独立卫浴', '书桌', '衣柜'],
    features: ['1.2m床', '空调', '24h热水'],
    nearby: ['食堂 – 步行3分钟', '健身房 – 步行2分钟', '便利店 – 步行2分钟'],
  },
  // 双人间（保留原双人间作为双人床位，但文档中未提及，可保留）
  {
    id: 'living-3',
    name: '双人间床位',
    category: 'living',
    description: '可单租床位或整租，性价比高',
    price: 0,
    unit: '晚/床位',
    weeklyPrice: 240,
    monthlyPrice: 600,
    tags: ['共用卫浴', '可整租'],
    features: ['两张1m床', '储物柜'],
    nearby: ['食堂 – 步行3分钟', '健身房 – 步行2分钟', '便利店 – 步行2分钟'],
  },

  // ==================== 办公 ====================
  // 灵活工位
  {
    id: 'office-1',
    name: '灵活工位',
    category: 'office',
    description: '高密度实用布局，先到先得，适合短期流动办公',
    price: 29,
    unit: '天',
    weeklyPrice: 150,   // 周租 150元 (约21.4元/天)
    monthlyPrice: 350,  // 月租 350元
    tags: ['高速Wi-Fi', '电源', '流动工位'],
    features: ['耐用桌椅', '多口电源接口', '公共休闲区'],
    capacity: '先到先得',
    availableHours: '24小时开放',
    rules: ['离开时请带走个人物品'],
    additionalServices: ['打印服务 ¥0.4/张'],
    availableCount: 20,
    totalCount: 30,
  },
  // 固定工位
  {
    id: 'office-2',
    name: '固定工位',
    category: 'office',
    description: '带隔断与独立储物空间，私密性强，适合中期旅居',
    price: 49,
    unit: '天',
    weeklyPrice: 240,
    monthlyPrice: 800,
    tags: ['人体工学椅', '高速Wi-Fi', '电源', '独立储物'],
    features: ['独立储物柜', '可锁抽屉', '隔断'],
    capacity: '1人',
    availableHours: '24小时开放',
    rules: ['需提前预订', '按月续租需提前3天通知'],
    additionalServices: ['打印服务 ¥0.4/张', '咖啡茶水免费'],
    availableCount: 15,
    totalCount: 20,
  },
  // ==================== 生活服务 ====================
  // 基地食堂
  {
    id: 'life-1',
    name: '基地食堂',
    category: 'life',
    description: '一日三餐，客家特色家常菜，亲民定价',
    price: 0,
    unit: '餐',
    tags: ['自助', '客家菜'],
    openingHours: '早餐 7:00-9:00 | 午餐 11:30-13:30 | 晚餐 17:30-19:30',
    location: '基地 7号楼',
    usageMethod: '刷卡/扫码支付',
  },
  // 健身房（免费）
  {
    id: 'life-2',
    name: '健身房',
    category: 'life',
    description: '跑步机、哑铃、杠铃、龙门架，对会员免费开放',
    price: 0,
    unit: '免费',
    tags: ['健身房', '力量训练', '有氧'],
    openingHours: '周一至周日 8:00-22:00',
    location: '基地 2号楼 一层',
    usageMethod: '凭入住卡免费使用',
  },
  // ==================== 社交活动 ====================
  {
    id: 'social-1',
    name: '周末徒步',
    category: 'social',
    description: '探索东源古村落，感受自然风光',
    price: 0,
    unit: '免费',
    tags: ['户外', '交友'],
    features: ['专业领队', '保险'],
    eventTime: '每周六 9:00-16:00',
    location: '万绿湖景区入口集合',
    organizer: '社群运营部',
    currentParticipants: 0,
    maxParticipants: 20,
    registrationDeadline: '每周五 18:00',
  },
  {
    id: 'social-2',
    name: '技能交换咖啡局',
    category: 'social',
    description: '每周日下午，分享技能，咖啡AA',
    price: 0,
    unit: '免费',
    tags: ['学习', '交流'],
    eventTime: '每周日 15:00-17:00',
    location: '公共休闲区',
    organizer: '社群运营部',
    currentParticipants: 0,
    maxParticipants: 15,
  },
  {
    id: 'social-3',
    name: '客家美食DIY',
    category: 'social',
    description: '酿豆腐、艾粄制作，体验客家饮食文化',
    price: 30,
    unit: '次',
    tags: ['美食', 'DIY', '客家文化'],
    eventTime: '每月第二、四周六 14:00-17:00',
    location: '基地食堂',
    organizer: '客家美食工作室',
    currentParticipants: 0,
    maxParticipants: 12,
  },
  {
    id: 'social-4',
    name: '共享电影夜',
    category: 'social',
    description: '每周四晚，经典电影放映',
    price: 0,
    unit: '免费',
    tags: ['电影', '休闲'],
    eventTime: '每周四 19:30-21:30',
    location: '共享培训室',
    organizer: '社群运营部',
  },

  // ==================== 贡献通道 ====================
  {
    id: 'contribute-1',
    name: '本地企业数字化服务',
    category: 'contribute',
    description: '为本地企业提供短视频拍摄、直播带货、网店运营等服务',
    price: 0,
    unit: '志愿',
    tags: ['技能贡献', '变现'],
    features: ['基地对接', '积分奖励'],
    organizer: '东源E栖谷',
    projectStatus: '长期招募',
    projectPeriod: '持续',
    timeCommitment: '灵活',
    projectOutcome: '获得积分，可抵扣租金',
  },
  {
    id: 'contribute-2',
    name: '本地文旅内容创作',
    category: 'contribute',
    description: '创作东源文旅图文/视频，推广客家文化',
    price: 0,
    unit: '志愿',
    tags: ['内容创作', '文旅'],
    features: ['积分奖励', '官方推广'],
    organizer: '东源县文旅局',
    projectStatus: '长期招募',
    projectPeriod: '持续',
    timeCommitment: '灵活',
    projectOutcome: '积分可兑换本地特产、服务',
  },
  {
    id: 'contribute-3',
    name: '公益技能分享',
    category: 'contribute',
    description: '开展办公软件、剪辑技巧等公益分享',
    price: 0,
    unit: '志愿',
    tags: ['公益', '技能'],
    features: ['积分奖励'],
    organizer: '东源E栖谷',
    projectStatus: '长期招募',
    projectPeriod: '持续',
    timeCommitment: '1小时起',
    projectOutcome: '积分可兑换服务',
  },
  {
    id: 'contribute-4',
    name: '社区共建建议',
    category: 'contribute',
    description: '参与议事会，为基地发展提建议',
    price: 0,
    unit: '志愿',
    tags: ['社区共建', '建议'],
    organizer: '东源E栖谷',
    projectStatus: '长期招募',
    projectPeriod: '每月一次',
    timeCommitment: '1-2小时',
    projectOutcome: '被采纳建议获积分奖励',
  },
];

// 套餐数据
const packagesData = [
  {
    id: 'pkg-1',
    name: '轻享入门套餐',
    description: '灵活工位 + 青旅床位',
    items: ['灵活工位（月租）', '青年旅社床位（月租）'],
    price: 580,
    originalPrice: 700,
    tag: 'hot',
  },
  {
    id: 'pkg-2',
    name: '私密舒适套餐',
    description: '固定工位 + 青旅床位',
    items: ['固定工位（月租）', '青年旅社床位（月租）'],
    price: 780,
    originalPrice: 1150,
    tag: 'recommend',
  },
  {
    id: 'pkg-3',
    name: '独居尊享套餐',
    description: '固定工位 + 经济单人间',
    items: ['固定工位（月租）', '经济单人间（月租）'],
    price: 0,   // 暂定价 800+800-100
    originalPrice: 1600,
  },
  {
    id: 'pkg-4',
    name: '双人同行套餐',
    description: '2×固定工位 + 双人间整租',
    items: ['固定工位 x2（月租）', '双人间整租（月租）'],
    price: 0,   // 暂定价 800*2+600-200
    originalPrice: 2200,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected, seeding...');

    // 清空现有数据
    await Product.deleteMany();
    await Package.deleteMany();

    // 插入新产品
    await Product.insertMany(productsData);
    await Package.insertMany(packagesData);

    console.log('Seeding complete');
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
  }
};

seedDB();