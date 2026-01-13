const Request = require('../models/Request');
const User = require('../models/User');
const Quest = require('../models/Quest');

const createRequest = async (req, res) => {
    try {
        const { selectedQuest, text, date } = req.body;
        const userId = req.user;

        // Check if user is operator
        let user;
        try {
            user = await User.findById(userId);
        } catch (err) {
            console.error('Error finding user:', err);
            return res.status(401).json({ message: 'Invalid user' });
        }
        if (!user || user.role !== 'operator') {
            return res.status(403).json({ message: 'Access denied. Only operators can create requests.' });
        }

        // Validate quest exists and is active
        let quest;
        try {
            quest = await Quest.findById(selectedQuest);
        } catch (err) {
            console.error('Error finding quest:', err);
            return res.status(400).json({ message: 'Invalid quest selected' });
        }
        if (!quest || !quest.isActive) {
            return res.status(400).json({ message: 'Invalid quest selected' });
        }

        // Create request
        const request = new Request({
            from: userId,
            text,
            date: date ? new Date(date) : new Date(),
            selectedQuest
        });

        await request.save();

        res.status(201).json({ request });
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getRequests = async (req, res) => {
    try {
        const userId = req.user;
        console.log('getRequests called by userId:', userId);

        // Check if user is quest or admin
        let user;
        try {
            user = await User.findById(userId);
        } catch (err) {
            console.error('Error finding user:', err);
            return res.status(401).json({ message: 'Invalid user' });
        }
        console.log('User found:', user);
        if (!user || (user.role !== 'quest' && user.role !== 'admin')) {
            console.log('Access denied for role:', user?.role);
            return res.status(403).json({ message: 'Access denied. Only quest and admin can view requests.' });
        }

        console.log('Fetching requests...');
        let requests;
        try {
            requests = await Request.find({})
                .populate('from', 'name email')
                .populate('selectedQuest', 'title description')
                .sort({ createdAt: -1 });
        } catch (err) {
            console.error('Error fetching requests:', err);
            return res.status(500).json({ message: 'Error fetching requests' });
        }
        console.log('Requests fetched:', requests.length);

        res.json({ requests });
    } catch (error) {
        console.error('Error in getRequests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user;

        // Check if user is quest or admin
        let user;
        try {
            user = await User.findById(userId);
        } catch (err) {
            console.error('Error finding user:', err);
            return res.status(401).json({ message: 'Invalid user' });
        }
        if (!user || (user.role !== 'quest' && user.role !== 'admin')) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        let request;
        try {
            request = await Request.findById(id);
        } catch (err) {
            console.error('Error finding request:', err);
            return res.status(404).json({ message: 'Request not found' });
        }
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        request.status = status;
        await request.save();

        res.json({ request });
    } catch (error) {
        console.error('Error in updateRequestStatus:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createRequest, getRequests, updateRequestStatus };