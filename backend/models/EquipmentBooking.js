const mongoose = require('mongoose');

const equipmentBookingSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: String, required: true },
    eventDescription: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    items: [{
        equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
    status: {
        type: String,
        enum: ['Booked', 'Returned', 'Cancelled'],
        default: 'Booked'
    },
    inchargeComment: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('EquipmentBooking', equipmentBookingSchema);
