const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Schema = mongoose.Schema;

const leaderboardSchema = new Schema({
    leadId: {
        type: String,
        required: true,
    },
    ownerId: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: + new Date()
    },
    jobId: {
        type: String,
        required: true,
    },
    leaderboard: {
        type: Object,
        default: {}
    },
});


module.exports = mongoose.model('Leaderboard', leaderboardSchema);