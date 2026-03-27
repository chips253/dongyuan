const mongoose = require('mongoose');

// 评价子文档
const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  avatar: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  date: { type: Date, default: Date.now },
  hasImage: { type: Boolean, default: false },
});

// 添加 toJSON 转换，将 _id 变成 id
reviewSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // 前端使用的短ID
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['living', 'office', 'life', 'social', 'contribute'],
    required: true,
  },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, required: true }, // '晚', '月', '小时', '次', '志愿'
  originalPrice: Number,
  weeklyPrice: Number,   // 周租价格（可选）
  monthlyPrice: Number,  // 月租价格（可选）
  image: String,
  tags: [String],
  features: [String],

  // 居住特有
  nearby: [String],
  reviews: [reviewSchema],

  // 办公特有
  capacity: String,
  availableHours: String,
  rules: [String],
  additionalServices: [String],
  availableCount: Number,
  totalCount: Number,

  // 生活服务特有
  openingHours: String,
  location: String,
  usageMethod: String,

  // 社交活动特有
  eventTime: String,
  organizer: String,
  currentParticipants: Number,
  maxParticipants: Number,
  registrationDeadline: String,

  // 贡献通道特有
  projectPeriod: String,
  timeCommitment: String,
  projectStatus: String,
  projectOutcome: String,
});

module.exports = mongoose.model('Product', productSchema);