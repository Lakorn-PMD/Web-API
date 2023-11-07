const mongoose = require('mongoose');
const { Schema } = mongoose;

const seatSchema = new Schema({
    alphabetID: String,
    zone: String
});

const ticketSchema = new Schema({
    owner: {
        type: String,
        required: true
    },
    seat: [seatSchema]
});

module.exports = mongoose.model('ticket', ticketSchema);
