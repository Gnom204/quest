const express = require('express');
const { getAllUsers, searchUsers } = require('../controllers/user');
const auth = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication and admin role
router.use(auth);
router.use(async (req, res, next) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/', getAllUsers);
router.get('/search', searchUsers);

module.exports = router;