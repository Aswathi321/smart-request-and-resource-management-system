const Request = require('../models/Request');
const User = require('../models/User');

// @desc    Create new request
// @route   POST /api/requests
// @access  Private (Student, Staff)
exports.createRequest = async (req, res) => {
    try {
        const { requestType, title, description, date, supportingDetailsUrl } = req.body;

        const request = new Request({
            requesterId: req.user._id,
            requestType,
            title,
            description,
            date,
            supportingDetailsUrl,
            status: req.user.role === 'Staff' ? 'Pending with HOD' : 'Pending with Advisor',
            approvalHistory: []
        });

        const createdRequest = await request.save();
        res.status(201).json(createdRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's requests
// @route   GET /api/requests/my
// @access  Private
exports.getMyRequests = async (req, res) => {
    try {
        const requests = await Request.find({ requesterId: req.user._id }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending requests for evaluator
// @route   GET /api/requests/pending
// @access  Private (Advisor, HOD, Principal)
exports.getPendingRequests = async (req, res) => {
    try {
        let requests = [];

        // Advisor sees requests from their assigned department & year
        if (req.user.role === 'Advisor') {
            let query = {
                department: req.user.advisorDepartment || req.user.department,
                role: 'Student'
            };
            
            const targetYear = req.user.advisorYear || req.user.year;
            if (targetYear) {
                query.year = targetYear;
            }

            const studentsInScope = await User.find(query).select('_id');

            const studentIds = studentsInScope.map(s => s._id);

            requests = await Request.find({
                status: 'Pending with Advisor',
                requesterId: { $in: studentIds }
            }).populate('requesterId', 'name admissionNumber department year').sort({ createdAt: -1 });
        }

        // HOD sees requests pending with HOD in their department OR forwarded from Advisor
        else if (req.user.role === 'HOD') {
            const usersInScope = await User.find({
                department: req.user.department
            }).select('_id');
            const userIds = usersInScope.map(u => u._id);

            requests = await Request.find({
                status: { $in: ['Forwarded to HOD', 'Pending with HOD'] },
                requesterId: { $in: userIds }
            }).populate('requesterId', 'name admissionNumber department year role').sort({ createdAt: -1 });
        }

        // Principal sees all requests forwarded to him
        else if (req.user.role === 'Principal') {
            requests = await Request.find({
                status: { $in: ['Pending with Principal', 'Forwarded to Principal'] }
            }).populate('requesterId', 'name admissionNumber department year role').sort({ createdAt: -1 });
        }

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

    // @desc    Process a request (Approve/Reject/Forward)
    // @route   PUT /api/requests/:id/process
    // @access  Private (Advisor, HOD, Principal)
    exports.processRequest = async (req, res) => {
        try {
            const { action, remarks, digitalSignature } = req.body;
            const request = await Request.findById(req.params.id).populate('requesterId', 'name email');
    
            if (!request) {
                return res.status(404).json({ message: 'Request not found' });
            }
    
            let nextStatus = request.status;
            const role = req.user.role;
    
            if (action === 'Reject') {
                nextStatus = 'Rejected';
            } else if (action === 'Approve') {
                if (role === 'Principal' || role === 'HOD') {
                    nextStatus = 'Approved';
                } else if (role === 'Advisor') {
                    return res.status(403).json({ message: 'Advisors can only forward or reject requests, not approve.' });
                }
            } else if (action === 'Forward') {
                if (role === 'Advisor') nextStatus = 'Forwarded to HOD';
                if (role === 'HOD') nextStatus = 'Pending with Principal';
            }
    
            // Add to history
            request.approvalHistory.push({
                processedBy: req.user._id,
                role: req.user.role,
                action,
                remarks,
                digitalSignature
            });
    
            request.status = nextStatus;
    
            const updatedRequest = await request.save();

            // Send Email Notification Async
            try {
                const { sendStatusUpdateEmail } = require('../utils/emailService');
                if (request.requesterId && request.requesterId.email) {
                    sendStatusUpdateEmail(request.requesterId, updatedRequest, action, remarks)
                        .catch(err => console.error('Failed to send status email async', err));
                }
            } catch (err) {
                console.error('Email service error:', err);
            }

            res.json(updatedRequest);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

// @desc    Get request by ID
// @route   GET /api/requests/:id
// @access  Private
exports.getRequestById = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id)
            .populate('requesterId', 'name email admissionNumber department year role')
            .populate('approvalHistory.processedBy', 'name role');

        if (request) {
            res.json(request);
        } else {
            res.status(404).json({ message: 'Request not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
