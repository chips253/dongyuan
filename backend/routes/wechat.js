const express = require('express');
const router = express.Router();
const {
  getWechatHighlights,
  getWechatHighlightById,
  createWechatHighlight,
  updateWechatHighlight,
  deleteWechatHighlight,
} = require('../controllers/wechatController');

router.get('/', getWechatHighlights);
router.get('/:id', getWechatHighlightById);
router.post('/', createWechatHighlight);
router.put('/:id', updateWechatHighlight);
router.delete('/:id', deleteWechatHighlight);

module.exports = router;