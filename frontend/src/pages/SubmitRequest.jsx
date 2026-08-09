import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Download, FileText, Send } from 'lucide-react';

const requestTypes = [
    'Leave Request',
    'Event Permission Request',
    'Resource Usage Request',
    'eGrants',
    'Bonafide Certificate',
    'Other'
];

export default function SubmitRequest() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Form state
    const [formData, setFormData] = useState({
        requestType: requestTypes[0],
        date: new Date().toISOString().split('T')[0],
        eventName: '',
        eventLocation: '',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [letterContent, setLetterContent] = useState('');
    
    // eGrants specific document checklist
    const [eGrantsDocs, setEGrantsDocs] = useState({
        income: false,
        caste: false,
        hostel: false,
        application: false
    });

    const alleGrantsChecked = Object.values(eGrantsDocs).every(Boolean);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Auto-generated letter template mapping
    const generateLetter = () => {
        const { date, eventName, eventLocation, startDate, endDate, reason, requestType } = formData;
        const studentName = user?.name || '[Student Name]';
        const admissionNo = user?.admissionNumber || '[Admission Number]';
        const dept = user?.department || '[Department]';

        const header = `Date: ${date || '[Date]'}\n\nTo,\nThe Principal,\nRajiv Gandhi Institute of Technology,\nKottayam.\n\n`;
        const footer = `\n\nYours faithfully,\n${studentName}\n${admissionNo}\n${dept}`;

        switch (requestType) {
            case 'Leave Request':
                return `${header}Subject: Request for Duty Leave\n\nRespected Sir/Madam,\n\nI am writing to formally request duty leave${startDate && endDate ? ` from ${startDate} to ${endDate}` : startDate ? ` on ${startDate}` : ''}. The purpose of this leave is to attend/participate in ${eventName || '[Event/Purpose]'}${eventLocation ? ` at ${eventLocation}` : ''}.\n\n${reason || 'I kindly request you to grant me leave for the aforementioned period.'}${footer}`;

            case 'eGrants':
                return `${header}Subject: Submission of eGrants Application and Required Documents\n\nRespected Sir/Madam,\n\nI am submitting my eGrants application for processing. I have attached the following required documents for your verification:\n1. Income Certificate\n2. Caste Certificate\n3. Hostel Inmate Certificate (if applicable)\n4. E-Grants Application Form Print\n\n${reason ? `Additional details: ${reason}\n\n` : ''}I humbly request you to verify my application and forward it to the concerned authority.${footer}`;

            case 'Bonafide Certificate':
                return `${header}Subject: Request for issuance of Bonafide Certificate\n\nRespected Sir/Madam,\n\nI am writing to request a Bonafide Certificate. I need this certificate for the purpose of ${reason || '[State the purpose, e.g., bank loan, scholarship, etc.]'}.\n\nI kindly request you to issue the certificate at the earliest.${footer}`;

            case 'Event Permission Request':
                return `${header}Subject: Request for Permission to Conduct/Attend Event\n\nRespected Sir/Madam,\n\nI am writing to seek your permission regarding an upcoming event, "${eventName || '[Event Name]'}".\nLocation: ${eventLocation || '[Location]'}\nDates: ${startDate} to ${endDate}\n\n${reason || 'We believe this event will be beneficial and request your approval to proceed.'}${footer}`;

            case 'Resource Usage Request':
                return `${header}Subject: Request for Campus Resource Usage\n\nRespected Sir/Madam,\n\nI am writing to request the use of campus resources/facilities for "${eventName || '[Purpose]'}".\nRequested Dates: ${startDate} to ${endDate}\n\nReason/Details:\n${reason || '[Provide details of the resource needed]'}\n\nI assure you that the resources will be used responsibly.${footer}`;

            case 'Other':
            default:
                return `${header}Subject: General Request\n\nRespected Sir/Madam,\n\nI am writing to you regarding the following matter:\n\n${reason || '[Please describe your request here]'}\n\nI kindly request your attention to this matter.${footer}`;
        }
    };

    // Update letter whenever form changes
    useEffect(() => {
        setLetterContent(generateLetter());
    }, [formData, user]);

    const handleLetterChange = (e) => {
        setLetterContent(e.target.value);
    };

    const handlePrintLetter = () => {
        const logoUrl = window.location.origin + '/rit-logo.png';
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Request Letter - RIT Kottayam</title>
                    <style>
                        @page { size: A4; margin: 20mm 15mm; }
                        body { font-family: 'Times New Roman', serif; margin: 0; padding: 0; color: #1a1a1a; }
                        .letterhead { display: flex; align-items: center; gap: 18px; padding-bottom: 12px; border-bottom: 2px solid #333; margin-bottom: 6px; }
                        .letterhead img { width: 70px; height: 70px; object-fit: contain; }
                        .letterhead-text { flex: 1; }
                        .letterhead-text h1 { font-size: 18px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
                        .letterhead-text h2 { font-size: 11px; font-weight: normal; margin: 2px 0 0; color: #444; }
                        .letterhead-address { text-align: right; font-size: 11px; color: #444; line-height: 1.4; }
                        .footer-bar { border-top: 1.5px solid #333; padding-top: 8px; margin-top: 40px; font-size: 9px; color: #555; text-align: center; }
                        .letter-body { white-space: pre-wrap; line-height: 1.8; font-size: 14px; padding: 15px 0; }
                    </style>
                </head>
                <body>
                    <div class="letterhead">
                        <img src="${logoUrl}" alt="RIT Logo" />
                        <div class="letterhead-text">
                            <h1>Rajiv Gandhi Institute of Technology</h1>
                            <h2>(Department of Technical Education, Government of Kerala)</h2>
                        </div>
                        <div class="letterhead-address">
                            Govt. Engineering College,<br/>
                            Velloor PO, Pampady<br/>
                            Kottayam-686501
                        </div>
                    </div>
                    <div class="letter-body">${letterContent}</div>
                    <div class="footer-bar">
                        Ph: 0481-2507763/2506153 &nbsp;|&nbsp; Fax: 0481-2506153 &nbsp;|&nbsp; e-mail: info@rit.ac.in, principal@rit.ac.in &nbsp;|&nbsp; Web: www.rit.ac.in
                    </div>
                    <script>
                        // Wait for logo to load before printing
                        const img = document.querySelector('.letterhead img');
                        if (img.complete) { window.print(); window.onafterprint = () => window.close(); }
                        else { img.onload = () => { window.print(); window.onafterprint = () => window.close(); }; }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                requestType: formData.requestType,
                title: formData.eventName || formData.requestType,
                description: letterContent,
                date: formData.date,
                supportingDetailsUrl: formData.supportingDetailsUrl
            };

            await api.post('/requests', payload);
            alert('Request submitted successfully!');
            navigate(-1);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 pb-12 animate-fade-in">
            {/* Left Column: Form Details */}
            <div className="flex-1 bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden">
                <div className="px-8 py-5 border-b border-surface-100 bg-gradient-to-r from-brand-50 to-surface-50">
                    <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-brand-600" /> Fill Details
                    </h2>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-slide-up">
                            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-red-600 text-xs font-bold">!</span>
                            </div>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <form className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">Date</label>
                                <input type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">Request Type</label>
                                <select name="requestType" value={formData.requestType} onChange={handleChange} className="select-field">
                                    {requestTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">Student Name</label>
                                <input type="text" disabled value={user?.name || ''} className="input-field !bg-surface-100 !text-surface-500 !cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">Admission Number</label>
                                <input type="text" disabled value={user?.admissionNumber || ''} className="input-field !bg-surface-100 !text-surface-500 !cursor-not-allowed" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">Department</label>
                            <input type="text" disabled value={user?.department || ''} className="input-field !bg-surface-100 !text-surface-500 !cursor-not-allowed" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">Event Name</label>
                                <input type="text" name="eventName" value={formData.eventName} onChange={handleChange} placeholder="Event name" className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">Event Location</label>
                                <input type="text" name="eventLocation" value={formData.eventLocation} onChange={handleChange} placeholder="City/Venue" className="input-field" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">Start Date</label>
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">End Date</label>
                                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="input-field" />
                            </div>
                        </div>

                        {/* eGrants Checklist */}
                        {formData.requestType === 'eGrants' && (
                            <div className="bg-brand-50/50 border border-brand-100 rounded-2xl p-5 space-y-3">
                                <p className="text-sm font-bold text-brand-900 mb-2">Required Documents Checklist</p>
                                
                                {[
                                    { key: 'income', label: 'Income Certificate' },
                                    { key: 'caste', label: 'Caste Certificate' },
                                    { key: 'hostel', label: 'Hostel Inmate Certificate' },
                                    { key: 'application', label: 'E-Grants Application Form Print' },
                                ].map(doc => (
                                    <label key={doc.key} className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={eGrantsDocs[doc.key]} 
                                            onChange={(e) => setEGrantsDocs({...eGrantsDocs, [doc.key]: e.target.checked})} 
                                            className="w-4 h-4 text-brand-600 rounded border-surface-300 focus:ring-brand-500" 
                                        />
                                        <span className="text-sm text-surface-700 group-hover:text-surface-900 transition-colors">{doc.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* Supporting URL */}
                        {(formData.requestType !== 'eGrants' || alleGrantsChecked) && (
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">
                                    {formData.requestType === 'eGrants' ? 'Google Drive Link (all documents)' : 'Supporting Documents URL'}
                                </label>
                                <input
                                    type="url"
                                    required={formData.requestType === 'eGrants'}
                                    name="supportingDetailsUrl"
                                    value={formData.supportingDetailsUrl || ''}
                                    onChange={handleChange}
                                    placeholder="https://drive.google.com/..."
                                    className="input-field"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">Reason/Description</label>
                            <textarea
                                name="reason"
                                rows="4"
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="Describe the event and purpose"
                                className="input-field resize-none"
                            ></textarea>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Editable Letter Preview */}
            <div className="flex-1 bg-white rounded-2xl shadow-card border border-surface-100 flex flex-col h-[800px] overflow-hidden">
                <div className="px-8 py-5 border-b border-surface-100 bg-gradient-to-r from-surface-50 to-brand-50/30 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-surface-400" /> Request Letter
                    </h2>
                    <button 
                        type="button" 
                        onClick={handlePrintLetter}
                        className="flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-800 transition-colors bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl"
                    >
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                </div>

                <div className="flex-1 overflow-hidden bg-surface-50/50">
                    <textarea
                        value={letterContent}
                        onChange={handleLetterChange}
                        className="w-full h-full p-8 text-[15px] leading-relaxed text-surface-700 bg-transparent resize-none outline-none font-serif"
                        spellCheck="false"
                    ></textarea>
                </div>

                <div className="p-5 border-t border-surface-100">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary"
                    >
                        <Send className="w-4 h-4" />
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </div>
        </div>
    );
}
