const mongoose = require("mongoose");

const launchesSchema = new mongoose.Schema({
    flightNumber: {
        type: Number,
        required: true
    },
    launchDate: {
        type: Date,
        required: true
    },
    mission: {
        type: String,
        required: true,
    },
    rocket: {
        type: String,
        required: true
    },
    target: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    customers: [String],
    upcoming: {
        type: mongoose.Schema.Types.Boolean,
        required: true
    },
    success: {
        type: mongoose.Schema.Types.Boolean,
        required: true,
        default: true
    }
});

module.exports = mongoose.model('Launch', launchesSchema);