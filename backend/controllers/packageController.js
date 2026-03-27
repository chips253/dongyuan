const Package = require('../models/Package');

// 获取所有套餐
exports.getPackages = async (req, res) => {
  try {
    const packages = await Package.find().sort({ price: 1 });
    res.json(packages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};