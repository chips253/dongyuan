const News = require('../models/News');

exports.getLatestNews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const news = await News.find().sort({ date: -1 }).limit(limit);
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};