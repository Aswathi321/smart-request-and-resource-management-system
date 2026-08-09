const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestType: {
        type: String,
        enum: ['Leave Request', 'Event Permission Request', 'Resource Usage Request', 'eGrants', 'Bonafide Certificate', 'Other'],
        required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    supportingDetailsUrl: { type: String }, // Optional file upload (e.g., S3 URL or local path)

    status: {
        type: String,
        enum: ['Pending with Advisor', 'Forwarded to HOD', 'Pending with HOD', 'Pending with Principal', 'Approved', 'Rejected'],
        default: 'Pending with Advisor'
    },

    approvalHistory: [{
        processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String },
        action: { type: String, enum: ['Approve', 'Reject', 'Forward'] },
        date: { type: Date, default: Date.now },
        remarks: { type: String },
        digitalSignature: { type: String } // E.g., a base64 string or an ID referencing a signature
    }]
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
