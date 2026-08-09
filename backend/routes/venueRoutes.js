const express = require('express');
const router = express.Router();
const {
    getVenues,
    checkAvailability,
    bookVenue,
    addToWaitlist,
    getDepartmentVenueBookings,
    cancelBooking,
    manualAssign,
    getMyVenueBookings,
    notifyStudent
} = require('../controllers/venueController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getVenues);
router.post('/availability', protect, checkAvailability);
router.post('/book', protect, bookVenue);
router.post('/waitlist', protect, addToWaitlist);
router.get('/department-bookings', protect, getDepartmentVenueBookings);
router.put('/cancel/:id', protect, cancelBooking);
router.put('/manual-assign/:id', protect, manualAssign);
router.get('/my-bookings', protect, getMyVenueBookings);
router.post('/booking/:id/notify', protect, notifyStudent); // uses user authorization from front, or can add authorize middleware if needed

module.exports = router;
