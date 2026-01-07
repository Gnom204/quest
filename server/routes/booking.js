const express = require('express');
const { getUserBookings } = require('../controllers/booking');
const auth = require('../middleware/auth');

const router = express.Router();

// All booking routes require authentication
router.use(auth);

router.get('/my-bookings', getUserBookings);

module.exports = router;