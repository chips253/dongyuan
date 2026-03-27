const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');
const Product = require('../models/Product');
const Activity = require('../models/Activity');

// 创建预订（含库存扣减及社交人数增加）
exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { productId, productName, type, date, nights, months, price } = req.body;

    // 如果是办公产品，扣减库存
    if (type === 'office' && productId) {
      const product = await Product.findOne({ id: productId }).session(session);
      if (!product) throw new Error('产品不存在');
      if (product.availableCount !== undefined && product.availableCount <= 0) {
        throw new Error('库存不足');
      }
      if (product.availableCount !== undefined) {
        product.availableCount -= 1;
        await product.save({ session });
      }
    }

    const booking = new Booking({
      userId: req.user.id,
      productId,
      productName,
      type,
      date,
      nights,
      months,
      price,
    });
    await booking.save({ session });

    // 增加积分（消费金额每10元得1积分）
    const pointsEarn = Math.floor(price / 10);
    if (pointsEarn > 0) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { points: pointsEarn } }, { session });
      await PointTransaction.create([{
        userId: req.user.id,
        amount: pointsEarn,
        type: 'earn',
        source: 'booking',
        description: `预订 ${productName}`,
      }], { session });
    }

    await session.commitTransaction();
    res.status(201).json(booking);
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(500).json({ error: err.message || '服务器错误' });
  } finally {
    session.endSession();
  }
};

// 获取用户预订列表
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 取消预订（含库存恢复及社交人数减少）
exports.cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(id).session(session);
    if (!booking) throw new Error('预订不存在');
    if (booking.userId.toString() !== userId) throw new Error('无权限取消');
    if (booking.status === 'cancelled') throw new Error('预订已取消');
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      throw new Error('当前状态无法取消');
    }

    booking.status = 'cancelled';
    await booking.save({ session });

    // 如果是办公产品，恢复库存
    if (booking.type === 'office' && booking.productId) {
      const product = await Product.findOne({ id: booking.productId }).session(session);
      if (product && product.availableCount !== undefined) {
        product.availableCount += 1;
        await product.save({ session });
      }
    }

    await session.commitTransaction();
    res.json({ message: '取消成功' });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
};