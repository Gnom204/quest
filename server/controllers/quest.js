const Quest = require('../models/Quest');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const createQuest = async (req, res) => {
    try {
        const { title, description, minPlayers, maxPlayers } = req.body;
        const userId = req.user;

        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can create quests.' });
        }

        // Validate player counts
        if (parseInt(minPlayers) > parseInt(maxPlayers)) {
            return res.status(400).json({ message: 'Minimum players cannot be greater than maximum players' });
        }

        // Handle uploaded files - return full URLs
        const photos = req.files ? req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`) : [];

        // Create quest
        const quest = new Quest({
            title,
            description,
            minPlayers: parseInt(minPlayers),
            maxPlayers: parseInt(maxPlayers),
            owner: userId,
            photos
        });

        await quest.save();

        res.status(201).json({ quest });
    } catch (error) {
        console.error('Create quest error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllQuests = async (req, res) => {
    try {
        const quests = await Quest.find({ isActive: true }).populate('owner', 'name email');
        res.json({ quests });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteQuest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user;

        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can delete quests.' });
        }

        // Find and delete the quest
        const quest = await Quest.findByIdAndDelete(id);
        if (!quest) {
            return res.status(404).json({ message: 'Quest not found' });
        }

        res.json({ message: 'Quest deleted successfully' });
    } catch (error) {
        console.error('Delete quest error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createQuest, getAllQuests, deleteQuest, upload };