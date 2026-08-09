const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, admissionNumber, department, year, role, password, advisorDepartment, advisorYear, resourceDepartment } = req.body;

        // Check if user exists
        let userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Additional check for admissionNumber if provided
        if (admissionNumber) {
            userExists = await User.findOne({ admissionNumber });
            if (userExists) {
                return res.status(400).json({ message: 'User already exists with this admission number' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            admissionNumber,
            department,
            year,
            role,
            password: hashedPassword,
            advisorDepartment,
            advisorYear,
            resourceDepartment
        });

        if (user) {
            // Send Welcome Email asynchronously (don't block the response if it fails)
            try {
                const { sendWelcomeEmail } = require('../utils/emailService');
                sendWelcomeEmail(user).catch(err => console.error('Failed to send welcome email async', err));
            } catch (err) {
                console.error('Email service error:', err);
            }

            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                admissionNumber: user.admissionNumber,
                department: user.department,
                year: user.year,
                advisorDepartment: user.advisorDepartment,
                advisorYear: user.advisorYear,
                resourceDepartment: user.resourceDepartment,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { admissionNumber, email, password } = req.body;

        // Users (like Staff/Advisors) might log in with Email instead of Admission Number.
        // So we check which one is provided.
        let user;
        if (admissionNumber) {
            user = await User.findOne({ admissionNumber });
        } else if (email) {
            user = await User.findOne({ email });
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account has been blocked by the administrator. Please contact admin.' });
        }

        if (await bcrypt.compare(password, user.password)) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                admissionNumber: user.admissionNumber,
                department: user.department,
                year: user.year,
                advisorDepartment: user.advisorDepartment,
                advisorYear: user.advisorYear,
                resourceDepartment: user.resourceDepartment,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
