const User = require('../models/User');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'name email role isBlocked createdAt');
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const searchUsers = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: 'Email query parameter is required' });
        }

        const users = await User.find(
            { email: { $regex: email, $options: 'i' } },
            'name email role isBlocked createdAt'
        );
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllUsers, searchUsers };