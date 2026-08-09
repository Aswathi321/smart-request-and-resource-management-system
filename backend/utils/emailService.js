const nodemailer = require('nodemailer');

// Configure the transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper to send emails
const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: `"RITConnect" <${process.env.EMAIL_USER || 'noreply@ritconnect.edu'}>`,
            to: options.to,
            subject: options.subject,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        
        // If testing with Ethereal, provide the preview URL in console
        if (process.env.EMAIL_HOST?.includes('ethereal')) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// --- Specific Email Templates ---

exports.sendWelcomeEmail = async (user) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #4f46e5;">Welcome to RITConnect!</h2>
            <p>Hi ${user.name},</p>
            <p>Your account has been successfully created. We are excited to have you on board!</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Role:</strong> ${user.role}</p>
                ${user.admissionNumber ? `<p style="margin: 5px 0 0 0;"><strong>Admission/ID Number:</strong> ${user.admissionNumber}</p>` : ''}
                <p style="margin: 5px 0 0 0;"><strong>Email:</strong> ${user.email}</p>
            </div>
            <p>You can now log in to the system and start managing your requests and resources.</p>
            <p>Best regards,<br>The RITConnect Team</p>
        </div>
    `;
    return sendEmail({ to: user.email, subject: 'Welcome to RITConnect!', html });
};

exports.sendStatusUpdateEmail = async (user, request, action, remarks) => {
    const isFullyApproved = request.status === 'Approved';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #4f46e5;">Request Status Update</h2>
            <p>Hi ${user.name},</p>
            <p>There has been an update on your request: <strong>${request.title}</strong> (${request.requestType})</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Action:</strong> <span style="color: ${action === 'Approve' ? 'green' : action === 'Reject' ? 'red' : 'blue'}">${action}</span></p>
                <p style="margin: 5px 0 0 0;"><strong>New Status:</strong> ${request.status}</p>
                ${remarks ? `<p style="margin: 5px 0 0 0;"><strong>Remarks:</strong> ${remarks}</p>` : ''}
            </div>
            ${isFullyApproved ? '<p style="color: #10b981; font-weight: bold; font-size: 16px;">✓ Your request is fully approved. You can now download the official document from your dashboard.</p>' : ''}
            <p>Log in to your dashboard to view full details.</p>
            <p>Best regards,<br>The RITConnect Team</p>
        </div>
    `;
    return sendEmail({ to: user.email, subject: `Update on your Request: ${request.title}`, html });
};

exports.sendBookingConfirmationEmail = async (user, bookingDetails) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #10b981;">Booking Confirmed</h2>
            <p>Hi ${user.name},</p>
            <p>Your booking has been successfully confirmed!</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                ${bookingDetails.venueName ? `<p style="margin: 0;"><strong>Venue:</strong> ${bookingDetails.venueName}</p>` : ''}
                ${bookingDetails.date ? `<p style="margin: 5px 0 0 0;"><strong>Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString()}</p>` : ''}
                ${bookingDetails.time ? `<p style="margin: 5px 0 0 0;"><strong>Time:</strong> ${bookingDetails.time}</p>` : ''}
                ${bookingDetails.items ? `<p style="margin: 5px 0 0 0;"><strong>Items:</strong> ${bookingDetails.items}</p>` : ''}
            </div>
            <p>Please make sure to follow the usage guidelines.</p>
            <p>Best regards,<br>The RITConnect Team</p>
        </div>
    `;
    return sendEmail({ to: user.email, subject: 'Booking Confirmation', html });
};

exports.sendBookingCancellationEmail = async (user, bookingDetails) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #ef4444;">Booking Cancelled</h2>
            <p>Hi ${user.name},</p>
            <p>Your booking has been cancelled.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                ${bookingDetails.venueName ? `<p style="margin: 0;"><strong>Venue:</strong> ${bookingDetails.venueName}</p>` : ''}
                ${bookingDetails.date ? `<p style="margin: 5px 0 0 0;"><strong>Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString()}</p>` : ''}
                ${bookingDetails.items ? `<p style="margin: 5px 0 0 0;"><strong>Items:</strong> ${bookingDetails.items}</p>` : ''}
            </div>
            <p>If you have any questions, please contact the resource incharge.</p>
            <p>Best regards,<br>The RITConnect Team</p>
        </div>
    `;
    return sendEmail({ to: user.email, subject: 'Booking Cancelled', html });
};

exports.sendEquipmentReturnEmail = async (user, returnDetails) => {
    const isDamaged = returnDetails.condition === 'Damaged';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: ${isDamaged ? '#ef4444' : '#10b981'};">Equipment Returned ${isDamaged ? 'with Damage' : 'Successfully'}</h2>
            <p>Hi ${user.name},</p>
            <p>The equipment you booked has been marked as returned by the incharge.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Condition:</strong> <span style="color: ${isDamaged ? 'red' : 'green'}">${returnDetails.condition}</span></p>
                ${returnDetails.comment ? `<p style="margin: 5px 0 0 0;"><strong>Incharge Comment:</strong> ${returnDetails.comment}</p>` : ''}
            </div>
            ${isDamaged ? '<p style="color: #ef4444;">Please note that damaged equipment may incur penalties. Contact your department for more info.</p>' : ''}
            <p>Best regards,<br>The RITConnect Team</p>
        </div>
    `;
    return sendEmail({ to: user.email, subject: 'Equipment Return Receipt', html });
};

exports.sendAccountBlockedEmail = async (user) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #ef4444;">Account Suspended</h2>
            <p>Hi ${user.name},</p>
            <p>Your account on RITConnect has been <strong>suspended</strong> by the system administrator.</p>
            <p>You will no longer be able to log in or access your dashboard.</p>
            <p>If you believe this is a mistake, please contact the administration directly.</p>
            <p>Best regards,<br>The RITConnect Team</p>
        </div>
    `;
    return sendEmail({ to: user.email, subject: 'Action Required: Account Suspended', html });
};

// Generic manual notification email from Incharges
exports.sendInchargeNotificationEmail = async (user, subject, htmlMessage) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #4f46e5;">Notice from Resource Incharge</h2>
            <p>Hi ${user.name},</p>
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; white-space: pre-wrap; font-size: 14px;">
                ${htmlMessage}
            </div>
            <p>If you have any questions regarding this notice, please contact your department's resource incharge.</p>
            <p>Best regards,<br>RITConnect Administration</p>
        </div>
    `;
    return sendEmail({ to: user.email, subject: subject, html });
};
