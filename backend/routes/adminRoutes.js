const express = require('express');
const router = express.Router();
const {
    getStats,
    getUsers, toggleBlockUser, changeUserRole, deleteUser,
    getAllRequests,
    getVenues, addVenue, deleteVenue, getAllVenueBookings, cancelVenueBooking,
    getEquipment, addEquipment, updateEquipment, deleteEquipment, getAllEquipmentBookings, cancelEquipmentBooking
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(authorize('Admin'));

// Dashboard
router.get('/stats', getStats);

// Users
router.get('/users', getUsers);
router.put('/users/:id/block', toggleBlockUser);
router.put('/users/:id/role', changeUserRole);
router.delete('/users/:id', deleteUser);

// Requests
router.get('/requests', getAllRequests);

// Venues
router.get('/venues', getVenues);
router.post('/venues', addVenue);
router.delete('/venues/:id', deleteVenue);
router.get('/venue-bookings', getAllVenueBookings);
router.put('/venue-bookings/:id/cancel', cancelVenueBooking);

// Equipment
router.get('/equipment', getEquipment);
router.post('/equipment', addEquipment);
router.put('/equipment/:id', updateEquipment);
router.delete('/equipment/:id', deleteEquipment);
router.get('/equipment-bookings', getAllEquipmentBookings);
router.put('/equipment-bookings/:id/cancel', cancelEquipmentBooking);

module.exports = router;
