const User = require('../models/User');
const Request = require('../models/Request');
const Venue = require('../models/Venue');
const VenueBooking = require('../models/VenueBooking');
const Equipment = require('../models/Equipment');
const EquipmentBooking = require('../models/EquipmentBooking');

// ==================== DASHBOARD STATS ====================

// @desc    Get system-wide stats
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
    try {
        const [
            totalUsers,
            blockedUsers,
            totalRequests,
            pendingRequests,
            totalVenueBookings,
            activeVenueBookings,
            totalEquipmentBookings,
            activeEquipmentBookings
        ] = await Promise.all([
            User.countDocuments({}),
            User.countDocuments({ isBlocked: true }),
            Request.countDocuments({}),
            Request.countDocuments({ status: { $nin: ['Approved', 'Rejected'] } }),
            VenueBooking.countDocuments({}),
            VenueBooking.countDocuments({ status: 'Confirmed' }),
            EquipmentBooking.countDocuments({}),
            EquipmentBooking.countDocuments({ status: 'Booked' })
        ]);

        // User breakdown by role
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        res.json({
            users: { total: totalUsers, blocked: blockedUsers, byRole: usersByRole },
            requests: { total: totalRequests, pending: pendingRequests },
            venueBookings: { total: totalVenueBookings, active: activeVenueBookings },
            equipmentBookings: { total: totalEquipmentBookings, active: activeEquipmentBookings }
        });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// ==================== USER MANAGEMENT ====================

// @desc    Get all users
// @route   GET /api/admin/users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Block/Unblock user
// @route   PUT /api/admin/users/:id/block
exports.toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'Admin') return res.status(400).json({ message: 'Cannot block another admin' });

        user.isBlocked = !user.isBlocked;
        await user.save();

        // Send Email async if blocked
        if (user.isBlocked) {
            try {
                const { sendAccountBlockedEmail } = require('../utils/emailService');
                sendAccountBlockedEmail(user).catch(err => console.error('Failed to send block email async', err));
            } catch (err) {
                console.error('Email service error:', err);
            }
        }

        res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, user: { _id: user._id, isBlocked: user.isBlocked } });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Change user role
// @route   PUT /api/admin/users/:id/role
exports.changeUserRole = async (req, res) => {
    try {
        const { role, advisorDepartment, advisorYear, resourceDepartment } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.role = role;
        if (role === 'Advisor') {
            user.advisorDepartment = advisorDepartment || user.department;
            user.advisorYear = advisorYear || 1;
        }
        if (role === 'ResourceIncharge') {
            user.resourceDepartment = resourceDepartment || user.department;
        }
        await user.save();

        const updated = await User.findById(user._id).select('-password');
        res.json({ message: `Role changed to ${role}`, user: updated });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'Admin') return res.status(400).json({ message: 'Cannot delete an admin account' });

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// ==================== REQUESTS MANAGEMENT ====================

// @desc    Get all requests system-wide
// @route   GET /api/admin/requests
exports.getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find({})
            .populate('requesterId', 'name email admissionNumber department role')
            .populate('approvalHistory.processedBy', 'name role')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// ==================== VENUE MANAGEMENT ====================

// @desc    Get all venues
// @route   GET /api/admin/venues
exports.getVenues = async (req, res) => {
    try {
        const venues = await Venue.find({}).populate('resourceIncharge', 'name email').sort({ department: 1 });
        res.json(venues);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Add a venue
// @route   POST /api/admin/venues
exports.addVenue = async (req, res) => {
    try {
        const venue = await Venue.create(req.body);
        res.status(201).json(venue);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Delete a venue
// @route   DELETE /api/admin/venues/:id
exports.deleteVenue = async (req, res) => {
    try {
        await Venue.findByIdAndDelete(req.params.id);
        res.json({ message: 'Venue deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get all venue bookings
// @route   GET /api/admin/venue-bookings
exports.getAllVenueBookings = async (req, res) => {
    try {
        const bookings = await VenueBooking.find({})
            .populate('userId', 'name email admissionNumber department')
            .populate('venueId', 'name department capacity')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// ==================== EQUIPMENT MANAGEMENT ====================

// @desc    Get all equipment
// @route   GET /api/admin/equipment
exports.getEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.find({}).sort({ department: 1, name: 1 });
        res.json(equipment);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Add equipment
// @route   POST /api/admin/equipment
exports.addEquipment = async (req, res) => {
    try {
        const equip = await Equipment.create(req.body);
        res.status(201).json(equip);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Update equipment quantity
// @route   PUT /api/admin/equipment/:id
exports.updateEquipment = async (req, res) => {
    try {
        const { name, quantity, department } = req.body;
        const equip = await Equipment.findByIdAndUpdate(req.params.id, { name, quantity, department }, { new: true });
        if (!equip) return res.status(404).json({ message: 'Equipment not found' });
        res.json(equip);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Delete equipment
// @route   DELETE /api/admin/equipment/:id
exports.deleteEquipment = async (req, res) => {
    try {
        await Equipment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Equipment deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get all equipment bookings
// @route   GET /api/admin/equipment-bookings
exports.getAllEquipmentBookings = async (req, res) => {
    try {
        const bookings = await EquipmentBooking.find({})
            .populate('studentId', 'name email admissionNumber department')
            .populate('items.equipmentId')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Cancel any venue booking (admin override)
// @route   PUT /api/admin/venue-bookings/:id/cancel
exports.cancelVenueBooking = async (req, res) => {
    try {
        const booking = await VenueBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        booking.status = 'Cancelled';
        await booking.save();
        res.json({ message: 'Venue booking cancelled by admin' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Cancel any equipment booking (admin override)
// @route   PUT /api/admin/equipment-bookings/:id/cancel
exports.cancelEquipmentBooking = async (req, res) => {
    try {
        const booking = await EquipmentBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        booking.status = 'Cancelled';
        await booking.save();
        res.json({ message: 'Equipment booking cancelled by admin' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
