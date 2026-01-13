const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    responses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Response'
    }],
    selectedQuest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quest'
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Request', requestSchema);