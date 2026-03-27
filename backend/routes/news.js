const express = require('express');
const router = express.Router();
const { getLatestNews } = require('../controllers/newsController');

router.get('/', getLatestNews);

module.exports = router;