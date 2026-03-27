const Reward = require('../models/Reward');
const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');
const Exchange = require('../models/Exchange');

// 获取可兑换商品列表
exports.getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find({ status: 'active' }).sort({ points: 1 });
    res.json(rewards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取单个商品详情
exports.getRewardById = async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) return res.status(404).json({ error: '商品不存在' });
    res.json(reward);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 兑换商品
exports.exchangeReward = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { rewardId } = req.body;
    const userId = req.user.id; // 假设 auth 中间件已设置 req.user

    // 查找商品
    const reward = await Reward.findById(rewardId).session(session);
    if (!reward) throw new Error('商品不存在');
    if (reward.status !== 'active') throw new Error('商品已下架');
    if (reward.stock === 0) throw new Error('库存不足');
    if (reward.stock > 0 && reward.stock <= 0) throw new Error('库存不足'); // 再次检查

    // 查找用户
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('用户不存在');
    if (user.points < reward.points) throw new Error('积分不足');

    // 扣减积分
    user.points -= reward.points;
    await user.save({ session });

    // 扣减库存（如果stock > 0，即有限库存）
    if (reward.stock > 0) {
      reward.stock -= 1;
      await reward.save({ session });
    }

    // 记录积分流水
    const transaction = new PointTransaction({
      userId,
      amount: -reward.points,
      type: 'redeem',
      source: `兑换商品: ${reward.name}`,
      description: `兑换 ${reward.name}`,
    });
    await transaction.save({ session });

    // 生成兑换码（简单示例，实际可调用外部生成服务）
    let code = null;
    if (reward.type === 'coupon') {
      code = `${reward.codePrefix || 'C'}-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }

    // 创建兑换记录
    const exchange = new Exchange({
      userId,
      rewardId: reward._id,
      rewardName: reward.name,
      points: reward.points,
      code,
    });
    await exchange.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: '兑换成功',
      code,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
};

// 获取用户的兑换记录
exports.getUserExchanges = async (req, res) => {
  try {
    const exchanges = await Exchange.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('rewardId', 'name image');
    res.json(exchanges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};