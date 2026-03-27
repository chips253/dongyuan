const express = require('express');
const router = express.Router();
const {
  getBuddyCategories,
  getBuddyCategoryById,
  createBuddyCategory,
  updateBuddyCategory,
  deleteBuddyCategory,
  updateQrCode,
} = require('../controllers/buddyController');

router.get('/', getBuddyCategories);
router.get('/:id', getBuddyCategoryById);
router.post('/', createBuddyCategory);
router.put('/:id', updateBuddyCategory);
router.delete('/:id', deleteBuddyCategory);
router.patch('/:id/qrcode', updateQrCode); // 专门更新二维码的接口

module.exports = router;