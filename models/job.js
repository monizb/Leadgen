//create job model
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Schema = mongoose.Schema;


const jobSchema = new Schema({
    jobId: {
        type: String,
        required: true,
    },
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
    updatedAt: {
        type: Date,
        default: + new Date()
    },
    status: {
        type: String,
        default: 'pending'
    },
    completed: {
        type: Boolean,
        default: false
    }
});



module.exports = mongoose.model('Job', jobSchema)
