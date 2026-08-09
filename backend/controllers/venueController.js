const Venue = require('../models/Venue');
const VenueBooking = require('../models/VenueBooking');

// Helper: check if two time ranges overlap
function timesOverlap(startA, endA, startB, endB) {
    return startA < endB && startB < endA;
}

// Helper: get priority number from event type
function getPriority(eventType) {
    const map = { 'Placement': 1, 'Club Event': 2, 'Department': 3, 'Other': 4 };
    return map[eventType] || 4;
}

// @desc    Check venue availability (capacity range + time overlap)
// @route   POST /api/venues/availability
// @access  Private
exports.checkAvailability = async (req, res) => {
    try {
        const { date, capacityNeeded, timeStart, timeEnd } = req.body;

        if (!date || !capacityNeeded || !timeStart || !timeEnd) {
            return res.status(400).json({ message: 'Please provide date, capacity, timeStart, and timeEnd' });
        }

        const cap = Number(capacityNeeded);

        // Find venues in the capacity range: [capacityNeeded, capacityNeeded + 20]
        const venuesInRange = await Venue.find({
            capacity: { $gte: cap, $lte: cap + 20 }
        });

        // Find all confirmed bookings on that date
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const confirmedBookings = await VenueBooking.find({
            date: { $gte: targetDate, $lte: endOfDay },
            status: 'Confirmed'
        }).populate('userId', 'name email');

        const available = [];
        const unavailable = [];

        venuesInRange.forEach(venue => {
            // Check if any confirmed booking overlaps with the requested time
            const conflicting = confirmedBookings.find(b =>
                b.venueId.toString() === venue._id.toString() &&
                timesOverlap(timeStart, timeEnd, b.timeStart, b.timeEnd)
            );

            if (conflicting) {
                unavailable.push({
                    ...venue.toObject(),
                    bookedBy: {
                        name: conflicting.userId?.name,
                        eventType: conflicting.eventType,
                        timeStart: conflicting.timeStart,
                        timeEnd: conflicting.timeEnd
                    }
                });
            } else {
                available.push(venue);
            }
        });

        res.json({ available, unavailable });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Book an available venue
// @route   POST /api/venues/book
// @access  Private
exports.bookVenue = async (req, res) => {
    try {
        const { venueId, date, timeStart, timeEnd, eventType, description, capacityNeeded } = req.body;

        // Verify the venue is actually available at this time
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const conflicting = await VenueBooking.findOne({
            venueId,
            date: { $gte: targetDate, $lte: endOfDay },
            status: 'Confirmed',
            $or: [
                { timeStart: { $lt: timeEnd }, timeEnd: { $gt: timeStart } }
            ]
        });

        if (conflicting) {
            return res.status(400).json({ message: 'Venue is already booked for this time slot' });
        }

        const booking = new VenueBooking({
            userId: req.user._id,
            venueId,
            date,
            timeStart,
            timeEnd,
            eventType,
            description,
            capacityNeeded,
            priority: getPriority(eventType),
            status: 'Confirmed'
        });
        await booking.save();

        const populated = await VenueBooking.findById(booking._id)
            .populate('venueId')
            .populate('userId', 'name email');

        // Send Email Notification Async
        try {
            const { sendBookingConfirmationEmail } = require('../utils/emailService');
            sendBookingConfirmationEmail(populated.userId, {
                venueName: populated.venueId.name,
                date: populated.date,
                time: `${populated.timeStart} - ${populated.timeEnd}`
            }).catch(err => console.error('Failed to send venue booking email async', err));
        } catch (err) {
            console.error('Email service error:', err);
        }

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add to waitlist for an unavailable venue
// @route   POST /api/venues/waitlist
// @access  Private
exports.addToWaitlist = async (req, res) => {
    try {
        const { venueId, date, timeStart, timeEnd, eventType, description, capacityNeeded } = req.body;

        // Calculate the waitlist position (next in line)
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingWaitlist = await VenueBooking.countDocuments({
            venueId,
            date: { $gte: targetDate, $lte: endOfDay },
            status: 'Waitlisted'
        });

        const booking = new VenueBooking({
            userId: req.user._id,
            venueId,
            date,
            timeStart,
            timeEnd,
            eventType,
            description,
            capacityNeeded,
            priority: getPriority(eventType),
            status: 'Waitlisted',
            waitlistPosition: existingWaitlist + 1
        });
        await booking.save();

        const populated = await VenueBooking.findById(booking._id)
            .populate('venueId')
            .populate('userId', 'name email');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get venue bookings for resource incharge's department
// @route   GET /api/venues/department-bookings
// @access  Private (ResourceIncharge)
exports.getDepartmentVenueBookings = async (req, res) => {
    try {
        const userDept = req.user.resourceDepartment;
        if (!userDept) {
            return res.status(403).json({ message: 'No department assigned to this resource incharge' });
        }

        // Find all venues belonging to this department (case-insensitive) or where user is explicitly assigned
        const deptVenues = await Venue.find({
            $or: [
                { department: { $regex: new RegExp(`^${userDept}$`, 'i') } },
                { resourceIncharge: req.user._id }
            ]
        });
        const venueIds = deptVenues.map(v => v._id);

        // Get all bookings for these venues (confirmed + waitlisted)
        const bookings = await VenueBooking.find({
            venueId: { $in: venueIds },
            status: { $in: ['Confirmed', 'Waitlisted'] }
        })
            .populate('venueId')
            .populate('userId', 'name email admissionNumber department')
            .sort({ date: 1, priority: 1 });

        // Find any venues that need manual resolution (tie in priority on waitlist)
        const manualResolutionNeeded = [];
        for (const venue of deptVenues) {
            const waitlisted = bookings.filter(b =>
                b.venueId._id.toString() === venue._id.toString() &&
                b.status === 'Waitlisted'
            );

            if (waitlisted.length >= 2) {
                // Group by date+time to find ties
                const groups = {};
                waitlisted.forEach(w => {
                    const key = `${new Date(w.date).toISOString().split('T')[0]}_${w.timeStart}_${w.timeEnd}`;
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(w);
                });

                for (const [key, group] of Object.entries(groups)) {
                    if (group.length >= 2) {
                        const minPriority = Math.min(...group.map(g => g.priority));
                        const topPriority = group.filter(g => g.priority === minPriority);
                        if (topPriority.length >= 2) {
                            manualResolutionNeeded.push({
                                venueId: venue._id,
                                venueName: venue.name,
                                dateTimeKey: key,
                                candidates: topPriority
                            });
                        }
                    }
                }
            }
        }

        res.json({ bookings, manualResolutionNeeded });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel a booking and auto-assign from waitlist
// @route   PUT /api/venues/cancel/:id
// @access  Private
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await VenueBooking.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('venueId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Save original status before cancelling
        const wasConfirmed = booking.status === 'Confirmed';

        booking.status = 'Cancelled';
        await booking.save();

        let autoAssigned = null;
        let manualResolutionNeeded = null;

        // Only auto-assign from waitlist if the cancelled booking was previously Confirmed
        if (wasConfirmed) {
            const targetDate = new Date(booking.date);
            targetDate.setHours(0, 0, 0, 0);
            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);

            // Find waitlisted bookings for the same venue, date, and overlapping time
            const waitlisted = await VenueBooking.find({
                venueId: booking.venueId,
                date: { $gte: targetDate, $lte: endOfDay },
                status: 'Waitlisted'
            }).populate('userId', 'name email').sort({ priority: 1, createdAt: 1 });

            // Filter to those with overlapping time
            const overlapping = waitlisted.filter(w =>
                timesOverlap(w.timeStart, w.timeEnd, booking.timeStart, booking.timeEnd)
            );

            if (overlapping.length > 0) {
                const topPriority = overlapping[0].priority;
                const topCandidates = overlapping.filter(w => w.priority === topPriority);

                if (topCandidates.length === 1) {
                    // Auto-assign: single highest priority candidate
                    topCandidates[0].status = 'Confirmed';
                    topCandidates[0].waitlistPosition = 0;
                    await topCandidates[0].save();

                    autoAssigned = await VenueBooking.findById(topCandidates[0]._id)
                        .populate('venueId')
                        .populate('userId', 'name email');

                    // Send Confirmation Email Async for Auto-Assign
                    try {
                        const { sendBookingConfirmationEmail } = require('../utils/emailService');
                        sendBookingConfirmationEmail(autoAssigned.userId, {
                            venueName: autoAssigned.venueId.name,
                            date: autoAssigned.date,
                            time: `${autoAssigned.timeStart} - ${autoAssigned.timeEnd}`
                        }).catch(err => console.error('Failed to send auto-assign email async', err));
                    } catch (err) {
                        console.error('Email service error:', err);
                    }
                } else {
                    // Tie in priority — needs manual resolution by incharge
                    manualResolutionNeeded = topCandidates;
                }
            }
        }

        // Send Email Notification Async for Cancellation
        try {
            const { sendBookingCancellationEmail } = require('../utils/emailService');
            sendBookingCancellationEmail(booking.userId, {
                venueName: booking.venueId?.name || 'A venue',
                date: booking.date
            }).catch(err => console.error('Failed to send cancellation email async', err));
        } catch (err) {
            console.error('Email service error:', err);
        }

        res.json({
            message: wasConfirmed
                ? (autoAssigned ? 'Booking cancelled. Auto-assigned to next in waitlist.' : 
                   manualResolutionNeeded ? 'Booking cancelled. Manual selection needed — same priority tie.' : 
                   'Booking cancelled. No one in waitlist.')
                : 'Waitlist entry cancelled.',
            booking,
            autoAssigned,
            manualResolutionNeeded
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Manually assign a waitlisted booking (Resource Incharge resolves tie)
// @route   PUT /api/venues/manual-assign/:id
// @access  Private (ResourceIncharge)
exports.manualAssign = async (req, res) => {
    try {
        const booking = await VenueBooking.findById(req.params.id);
        if (!booking || booking.status !== 'Waitlisted') {
            return res.status(404).json({ message: 'Waitlisted booking not found' });
        }

        booking.status = 'Confirmed';
        booking.waitlistPosition = 0;
        await booking.save();

        const populated = await VenueBooking.findById(booking._id)
            .populate('venueId')
            .populate('userId', 'name email');

        // Send Confirmation Email Async for Manual Assign
        try {
            const { sendBookingConfirmationEmail } = require('../utils/emailService');
            sendBookingConfirmationEmail(populated.userId, {
                venueName: populated.venueId.name,
                date: populated.date,
                time: `${populated.timeStart} - ${populated.timeEnd}`
            }).catch(err => console.error('Failed to send manual assign email async', err));
        } catch (err) {
            console.error('Email service error:', err);
        }

        res.json({ message: 'Booking confirmed manually', booking: populated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my venue bookings
// @route   GET /api/venues/my-bookings
// @access  Private
exports.getMyVenueBookings = async (req, res) => {
    try {
        const bookings = await VenueBooking.find({ userId: req.user._id })
            .populate('venueId')
            .sort({ date: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all venues
// @route   GET /api/venues
// @access  Private
exports.getVenues = async (req, res) => {
    try {
        const venues = await Venue.find({});
        res.json(venues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send custom notification email from Incharge
// @route   POST /api/venues/booking/:id/notify
// @access  Private (ResourceIncharge)
exports.notifyStudent = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const booking = await VenueBooking.findById(req.params.id)
            .populate('userId', 'name email');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        try {
            const { sendInchargeNotificationEmail } = require('../utils/emailService');
            // Sending synchronously so frontend knows if it failed
            await sendInchargeNotificationEmail(booking.userId, subject, message);
        } catch (err) {
            console.error('Email service error:', err);
            return res.status(500).json({ message: 'Failed to send email. Check SMTP configuration.' });
        }

        res.json({ message: 'Email sent successfully to the student.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};