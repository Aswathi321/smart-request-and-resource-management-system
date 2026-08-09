const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    department: { type: String, default: 'Common' }
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);
