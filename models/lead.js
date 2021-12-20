//create user model
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Schema = mongoose.Schema;


const leadSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: + new Date()
    },
    updatedAt: {
        type: Date,
        default: + new Date()
    },
    createdBy: {
        type: String,
        required: true
    },
    githubList: {
        type: Array,
        default: []
    },
    identifyingLabel: {
        type: String,
        required: true
    },
    labelList: {
        type: Array,
        default: []
    },
    id: {
        type: String,
        unique: true,
        default: () => uuidv4()
    },
    jobId: {
        type: String,
        default: () => uuidv4()
    }
});



module.exports = mongoose.model('Lead', leadSchema)
