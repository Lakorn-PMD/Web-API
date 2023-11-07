const mongoose = require('mongoose');
const { Schema } = mongoose;

const cellSchema = new Schema({
    row: Number,
    col: Number,
    alphabetID: String,
    isSold: Boolean,
});

const seatDetailsSchema = new Schema({
    zone: String,
    cells: [cellSchema],
});

const seatSchema = new Schema({
    name: String,
    seatDetails: [seatDetailsSchema],
});

module.exports = mongoose.model('seat', seatSchema);
