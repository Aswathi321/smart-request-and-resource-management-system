const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    admissionNumber: { type: String, unique: true, sparse: true }, // For students, also can be used as employee id for staff
    department: { type: String },
    year: { type: Number },
    role: {
        type: String,
        enum: ['Student', 'Staff', 'Advisor', 'HOD', 'Principal', 'ResourceIncharge', 'Admin'],
        required: true
    },
    password: { type: String, required: true },

    // Specific to Advisors
    advisorDepartment: { type: String },
    advisorYear: { type: Number },

    // Specific to Resource Incharge
    resourceDepartment: { type: String },

    // Admin control
    isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
