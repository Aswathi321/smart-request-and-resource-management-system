const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: { type: String, required: true }, // e.g., 'Common', 'CSE', 'ECE', etc.
    capacity: { type: Number, required: true },
    resourceIncharge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // The department incharge for this venue
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
