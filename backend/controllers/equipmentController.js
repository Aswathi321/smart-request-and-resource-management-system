
const Equipment = require('../models/Equipment');
const EquipmentBooking = require('../models/EquipmentBooking');

// @desc    Get equipment available for student's department (with real-time availability for optional date range)
// @route   GET /api/equipments/available?startDate=...&endDate=...
// @access  Private
exports.getAvailableEquipments = async (req, res) => {
    try {
        const department = req.user.department;
        const { startDate, endDate } = req.query;

        const equipments = await Equipment.find({ department });

        if (!startDate || !endDate) {
            // Return total quantities (no date filter)
            return res.json(equipments.map(eq => ({
                _id: eq._id,
                name: eq.name,
                totalQuantity: eq.quantity,
                availableQuantity: eq.quantity,
                department: eq.department
            })));
        }

        const sDate = new Date(startDate);
        const eDate = new Date(endDate);

        // Find all active bookings overlapping with requested date range for this department
        const overlappingBookings = await EquipmentBooking.find({
            department,
            status: 'Booked',
            $or: [
                { startDate: { $lte: eDate }, endDate: { $gte: sDate } }
            ]
        });

        // Calculate booked quantities per equipment
        const bookedMap = {};
        for (const booking of overlappingBookings) {
            for (const item of booking.items) {
                const eqId = item.equipmentId.toString();
                bookedMap[eqId] = (bookedMap[eqId] || 0) + item.quantity;
            }
        }

        const result = equipments.map(eq => ({
            _id: eq._id,
            name: eq.name,
            totalQuantity: eq.quantity,
            availableQuantity: eq.quantity - (bookedMap[eq._id.toString()] || 0),
            department: eq.department
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Book equipment (multiple items)
// @route   POST /api/equipments/book
// @access  Private
exports.bookEquipment = async (req, res) => {
    try {
        const { eventDescription, phoneNumber, startDate, endDate, items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Please select at least one equipment item' });
        }

        const department = req.user.department;
        const sDate = new Date(startDate);
        const eDate = new Date(endDate);

        // Get all equipment for this department
        const departmentEquipments = await Equipment.find({ department });
        const equipMap = {};
        departmentEquipments.forEach(eq => { equipMap[eq._id.toString()] = eq; });

        // Get overlapping bookings
        const overlappingBookings = await EquipmentBooking.find({
            department,
            status: 'Booked',
            $or: [
                { startDate: { $lte: eDate }, endDate: { $gte: sDate } }
            ]
        });

        const bookedMap = {};
        for (const booking of overlappingBookings) {
            for (const item of booking.items) {
                const eqId = item.equipmentId.toString();
                bookedMap[eqId] = (bookedMap[eqId] || 0) + item.quantity;
            }
        }

        // Validate each item
        for (const item of items) {
            const equipment = equipMap[item.equipmentId];
            if (!equipment) {
                return res.status(404).json({ message: `Equipment not found: ${item.equipmentId}` });
            }
            const available = equipment.quantity - (bookedMap[item.equipmentId] || 0);
            if (item.quantity > available) {
                return res.status(400).json({
                    message: `Not enough ${equipment.name} available. Requested: ${item.quantity}, Available: ${available}`
                });
            }
        }

        const booking = new EquipmentBooking({
            studentId: req.user._id,
            department,
            eventDescription,
            phoneNumber,
            startDate: sDate,
            endDate: eDate,
            items,
            status: 'Booked'
        });

        await booking.save();

        // Populate for response
        const populated = await EquipmentBooking.findById(booking._id)
            .populate('items.equipmentId')
            .populate('studentId', 'name admissionNumber email department');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my equipment bookings
// @route   GET /api/equipments/my-bookings
// @access  Private
exports.getMyEquipmentBookings = async (req, res) => {
    try {
        const bookings = await EquipmentBooking.find({ studentId: req.user._id })
            .populate('items.equipmentId')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get equipment bookings for incharge's department
// @route   GET /api/equipments/department-bookings
// @access  Private (ResourceIncharge)
exports.getDepartmentBookings = async (req, res) => {
    try {
        const bookings = await EquipmentBooking.find({
            department: { $regex: new RegExp(`^${req.user.resourceDepartment}$`, 'i') }
        })
            .populate('items.equipmentId')
            .populate('studentId', 'name admissionNumber email department')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add comment to equipment booking (incharge)
// @route   PUT /api/equipments/booking/:id/comment
// @access  Private (ResourceIncharge)
exports.addComment = async (req, res) => {
    try {
        const { comment } = req.body;
        const booking = await EquipmentBooking.findById(req.params.id);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.inchargeComment = comment;
        await booking.save();

        const populated = await EquipmentBooking.findById(booking._id)
            .populate('items.equipmentId')
            .populate('studentId', 'name admissionNumber email department');

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark equipment as returned (incharge)
// @route   PUT /api/equipments/return/:id
// @access  Private (ResourceIncharge)
exports.returnEquipment = async (req, res) => {
    try {
        const booking = await EquipmentBooking.findById(req.params.id);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.status = 'Returned';
        await booking.save();

        const populated = await EquipmentBooking.findById(booking._id)
            .populate('items.equipmentId')
            .populate('studentId', 'name admissionNumber email department');

        // Send Email Async
        try {
            const { sendEquipmentReturnEmail } = require('../utils/emailService');
            // Check condition based on comment presence
            const conditionText = booking.inchargeComment ? 'Damaged' : 'Good';
            sendEquipmentReturnEmail(populated.studentId, {
                condition: conditionText,
                comment: booking.inchargeComment
            }).catch(err => console.error('Failed to send return email async', err));
        } catch (err) {
            console.error('Email service error:', err);
        }

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send custom notification email from Incharge
// @route   POST /api/equipments/booking/:id/notify
// @access  Private (ResourceIncharge)
exports.notifyStudent = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const booking = await EquipmentBooking.findById(req.params.id)
            .populate('studentId', 'name email');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        try {
            const { sendInchargeNotificationEmail } = require('../utils/emailService');
            // Sending synchronously so frontend knows if it failed
            await sendInchargeNotificationEmail(booking.studentId, subject, message);
        } catch (err) {
            console.error('Email service error:', err);
            return res.status(500).json({ message: 'Failed to send email. Check SMTP configuration.' });
        }

        res.json({ message: 'Email sent successfully to the student.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};