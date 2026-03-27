const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createBooking, getUserBookings, cancelBooking } = require('../controllers/bookingController');

router.use(auth);
router.post('/', createBooking);
router.get('/', getUserBookings);
router.put('/:id/cancel', cancelBooking);

module.exports = router;