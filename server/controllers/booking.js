const Booking = require('../models/Booking');

const getUserBookings = async (req, res) => {
    try {
        const userId = req.user;
        const bookings = await Booking.find({ client: userId })
            .populate('quest', 'title description photos minPlayers maxPlayers metroBranch')
            .populate('operator', 'name')
            .sort({ createdAt: -1 });

        res.json({ bookings });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getUserBookings };