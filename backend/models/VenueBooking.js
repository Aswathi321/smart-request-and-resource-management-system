const mongoose = require('mongoose');

const venueBookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    eventType: {
        type: String,
        enum: ['Placement', 'Club Event', 'Department', 'Other'],
        required: true
    },
    description: { type: String },
    capacityNeeded: { type: Number },
    date: { type: Date, required: true },
    timeStart: { type: String, required: true }, // e.g., "09:00"
    timeEnd: { type: String, required: true },   // e.g., "12:00"
    priority: { type: Number, default: 4 },  // 1=Placement, 2=Club Event, 3=Department, 4=Other
    status: {
        type: String,
        enum: ['Confirmed', 'Waitlisted', 'Cancelled'],
        default: 'Confirmed'
    },
    waitlistPosition: { type: Number, default: 0 } // Position in the waitlist queue for a given venue+date+time
}, { timestamps: true });

module.exports = mongoose.model('VenueBooking', venueBookingSchema);
