// seed-cases.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Case = require('./models/Case');

dotenv.config();

const casesData = [
  {
    id: 'case-1',
    title: '仙坑村茶叶包装设计',
    description: '为本地茶厂设计系列包装，提升产品附加值，助农增收。',
    images: ['/images/case1-tea-1.jpg', '/images/case1-tea-2.jpg', '/images/case1-tea-3.jpg'],
    category: 'agriculture',
    tags: ['设计', '助农'],
    outcome: '设计作品已投产，茶叶销量提升30%',
    participants: 5,
    year: '2025',
    detail: '该项目由5位数字游民设计师发起，深入仙坑村调研茶叶文化，结合现代设计语言创作出三款系列包装。包装采用当地土纸和环保油墨，突出“生态茶”概念。产品上市后受到年轻消费者欢迎，线上渠道销量增长30%。项目成果被河源日报报道，并成为东源乡村振兴示范案例。',
    contributors: ['李明（UI设计）', '张薇（插画）', '王强（文案）', '陈晨（摄影）', '赵雷（项目管理）'],
  },
  {
    id: 'case-2',
    title: '古村落文化数字档案',
    description: '用影像和文字记录仙坑村、下屯村的建筑与人文故事。',
    images: ['/images/case-village-1.jpg', '/images/case-village-2.jpg'],
    category: 'culture',
    tags: ['摄影', '记录'],
    outcome: '完成20+个古建筑3D扫描，建立线上档案库',
    participants: 8,
    year: '2025',
    detail: '团队由摄影师、无人机飞手、文案和程序员组成，历时3个月完成对仙坑村、下屯村核心古建筑的3D扫描和全景拍摄。建立了线上档案库（预览版已上线），供文旅局和学术研究使用。项目还制作了10条短视频在抖音播放，累计播放量超50万。',
    contributors: ['摄影小林', '飞手阿杰', '文案小夜', '开发老周', '志愿者4名'],
  },
  // 可以继续添加其他案例...
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected, seeding cases...');

    await Case.deleteMany();
    await Case.insertMany(casesData);

    console.log('Seeding complete');
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
  }
};

seedDB();