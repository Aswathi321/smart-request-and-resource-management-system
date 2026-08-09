const express = require('express');
const router = express.Router();
const {
    getAvailableEquipments,
    bookEquipment,
    getMyEquipmentBookings,
    getDepartmentBookings,
    addComment,
    returnEquipment,
    notifyStudent
} = require('../controllers/equipmentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/available', protect, getAvailableEquipments);
router.post('/book', protect, bookEquipment);
router.get('/my-bookings', protect, getMyEquipmentBookings);
router.get('/department-bookings', protect, authorize('ResourceIncharge'), getDepartmentBookings);
router.put('/booking/:id/comment', protect, authorize('ResourceIncharge'), addComment);
router.put('/return/:id', protect, authorize('ResourceIncharge'), returnEquipment);
router.post('/booking/:id/notify', protect, authorize('ResourceIncharge'), notifyStudent);

module.exports = router;
