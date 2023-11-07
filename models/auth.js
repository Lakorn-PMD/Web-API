const mongoose = require('mongoose');
var authSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: 'member'
    },
    loginToken: {
        type: String,
    }
});


module.exports = mongoose.model('auth', authSchema);