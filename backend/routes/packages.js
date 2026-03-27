const express = require('express');
const router = express.Router();
const { getPackages } = require('../controllers/packageController');

router.get('/', getPackages);

module.exports = router;