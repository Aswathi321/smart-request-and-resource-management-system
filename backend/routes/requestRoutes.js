const express = require('express');
const router = express.Router();
const {
    createRequest,
    getMyRequests,
    getPendingRequests,
    processRequest,
    getRequestById
} = require('../controllers/requestController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, authorize('Student', 'Staff'), createRequest);

router.route('/my')
    .get(protect, getMyRequests);

router.route('/pending')
    .get(protect, authorize('Advisor', 'HOD', 'Principal'), getPendingRequests);

router.route('/:id/process')
    .put(protect, authorize('Advisor', 'HOD', 'Principal'), processRequest);

router.route('/:id')
    .get(protect, getRequestById);

module.exports = router;
