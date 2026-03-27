const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  getUserBookings,
  getUserProjects,
  getUserActivities,
  getUserCases,
  getPointTransactions,
  getUserStats,
  changePassword,
  getUserPostedProjects,        // 获取用户发布的项目
  getUserPostedActivities,      // 新增：获取用户发布的活动
} = require('../controllers/userController');

router.use(auth);

router.get('/', getProfile);
router.put('/', updateProfile);
router.get('/stats', getUserStats);
router.get('/bookings', getUserBookings);
router.get('/projects', getUserProjects);
router.get('/activities', getUserActivities);
router.get('/cases', getUserCases);
router.get('/points', getPointTransactions);
router.put('/password', changePassword);
router.get('/projects/posted', getUserPostedProjects);        // 获取用户发布的项目
router.get('/activities/posted', getUserPostedActivities);    // 新增：获取用户发布的活动

module.exports = router;