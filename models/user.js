//create user model
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    uid: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4()
    },
    otp: {
        type: String,
        //generate 5 digit otp
        default: () => Math.floor(100000 + Math.random() * 900000)
    },
    verified: {
        type: Boolean,
        default: false
    },
    quota: {
        type: Number,
        default: 0
    },
    apiKey: {
        type: String,
    }
});



module.exports = mongoose.model('User', userSchema)
