import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PackageSearch, CheckCircle, Package, AlertTriangle, MapPin, Clock, Users, Zap, X, ChevronDown, ChevronUp, MessageSquare, Phone, FileText, Send, RotateCcw } from 'lucide-react';

export default function ResourceInchargeDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('venues');
    const [equipBookings, setEquipBookings] = useState([]);
    const [venueData, setVenueData] = useState({ bookings: [], manualResolutionNeeded: [] });
    const [loading, setLoading] = useState(true);
    const [showManualModal, setShowManualModal] = useState(null); // holds the resolution group
    const [expandedBooking, setExpandedBooking] = useState(null);
    const [commentTexts, setCommentTexts] = useState({});
    const [commentLoading, setCommentLoading] = useState({});

    // Email Modal State
    const [emailModal, setEmailModal] = useState({
        isOpen: false,
        bookingId: null,
        type: '', // 'equipment' or 'venue'
        subject: '',
        message: '',
        studentEmail: '',
        studentName: ''
    });
    const [sendingEmail, setSendingEmail] = useState(false);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [eRes, vRes] = await Promise.all([
                api.get('/equipments/department-bookings').catch(() => ({ data: [] })),
                api.get('/venues/department-bookings').catch(() => ({ data: { bookings: [], manualResolutionNeeded: [] } }))
            ]);
            setEquipBookings(eRes.data);
            setVenueData(vRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (id) => {
        if (!window.confirm('Mark all items in this booking as returned?')) return;
        try {
            await api.put(`/equipments/return/${id}`);
            fetchAll();
        } catch (error) {
            alert('Failed to mark returned');
        }
    };

    const handleAddComment = async (bookingId) => {
        const comment = commentTexts[bookingId];
        if (!comment?.trim()) return;
        setCommentLoading(prev => ({ ...prev, [bookingId]: true }));
        try {
            await api.put(`/equipments/booking/${bookingId}/comment`, { comment: comment.trim() });
            setCommentTexts(prev => ({ ...prev, [bookingId]: '' }));
            fetchAll();
        } catch (error) {
            alert('Failed to add comment');
        } finally {
            setCommentLoading(prev => ({ ...prev, [bookingId]: false }));
        }
    };

    const handleCancelVenueBooking = async (bookingId) => {
        if (!window.confirm('Cancel this booking? If waitlisted users exist, the highest priority one will be auto-assigned.')) return;
        try {
            const { data } = await api.put(`/venues/cancel/${bookingId}`);
            
            // Show the descriptive message from backend
            alert(data.message);

            // If manual resolution is needed, refresh data then surface the modal
            await fetchAll();

            if (data.manualResolutionNeeded && data.manualResolutionNeeded.length > 0) {
                // The fetchAll() already updated venueData.manualResolutionNeeded
                // Automatically open the modal for the first manual resolution group
                const freshData = (await api.get('/venues/department-bookings')).data;
                if (freshData.manualResolutionNeeded?.length > 0) {
                    setShowManualModal(freshData.manualResolutionNeeded[0]);
                }
            }
        } catch (error) {
            alert('Failed to cancel booking');
        }
    };

    const handleManualAssign = async (bookingId) => {
        try {
            await api.put(`/venues/manual-assign/${bookingId}`);
            setShowManualModal(null);
            fetchAll();
        } catch (error) {
            alert('Failed to assign booking');
        }
    };

    // ----- Custom Notification Email Handlers -----
    const openEmailModal = (bookingId, type, predefinedSubject, predefinedMessage, student) => {
        setEmailModal({
            isOpen: true,
            bookingId,
            type,
            subject: predefinedSubject,
            message: predefinedMessage,
            studentEmail: student?.email,
            studentName: student?.name
        });
    };

    const handleSendCustomEmail = async () => {
        if (!emailModal.subject.trim() || !emailModal.message.trim()) return;
        setSendingEmail(true);
        try {
            const endpoint = emailModal.type === 'equipment' 
                ? `/equipments/booking/${emailModal.bookingId}/notify`
                : `/venues/booking/${emailModal.bookingId}/notify`;

            await api.post(endpoint, {
                subject: emailModal.subject,
                message: emailModal.message
            });
            alert('Email sent successfully!');
            setEmailModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to send email.');
        } finally {
            setSendingEmail(false);
        }
    };

    const confirmedVenueBookings = venueData.bookings?.filter(b => b.status === 'Confirmed') || [];
    const waitlistedVenueBookings = venueData.bookings?.filter(b => b.status === 'Waitlisted') || [];

    const priorityLabel = (p) => {
        const map = { 1: 'Placement', 2: 'Club Event', 3: 'Department', 4: 'Other' };
        return map[p] || 'Other';
    };

    const priorityColor = (p) => {
        const map = {
            1: 'bg-red-50 text-red-700 border-red-200',
            2: 'bg-purple-50 text-purple-700 border-purple-200',
            3: 'bg-blue-50 text-blue-700 border-blue-200',
            4: 'bg-surface-50 text-surface-600 border-surface-200'
        };
        return map[p] || map[4];
    };

    if (loading) return (
        <div className="p-12 text-center text-surface-400 animate-fade-in">
            <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Loading dashboard...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="gradient-header relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-white">Resource Dashboard</h2>
                        <p className="text-brand-100 mt-0.5">{user.resourceDepartment} Department — Venues & Equipment</p>
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-card border border-surface-100 max-w-md">
                <button
                    onClick={() => setActiveTab('venues')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'venues'
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'text-surface-500 hover:bg-surface-50'
                        }`}
                >
                    <MapPin className="w-4 h-4" /> Venue Bookings
                </button>
                <button
                    onClick={() => setActiveTab('equipment')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'equipment'
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'text-surface-500 hover:bg-surface-50'
                        }`}
                >
                    <Package className="w-4 h-4" /> Equipment
                </button>
            </div>

            {/* ================== VENUE TAB ================== */}
            {activeTab === 'venues' && (
                <div className="space-y-6">
                    {/* Manual Resolution Alerts */}
                    {venueData.manualResolutionNeeded?.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 animate-slide-up">
                            <div className="flex items-center gap-2 mb-3">
                                <Zap className="w-5 h-5 text-amber-600" />
                                <h3 className="font-bold text-amber-800">Manual Selection Required</h3>
                            </div>
                            <p className="text-sm text-amber-700 mb-3">
                                Multiple waitlisted requests have the same priority. Please select which one to confirm.
                            </p>
                            <div className="space-y-2">
                                {venueData.manualResolutionNeeded.map((group, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setShowManualModal(group)}
                                        className="w-full text-left bg-white border border-amber-200 rounded-xl p-4 hover:bg-amber-50/50 transition-colors"
                                    >
                                        <p className="font-semibold text-surface-900 text-sm">{group.venueName}</p>
                                        <p className="text-xs text-surface-500 mt-0.5">
                                            {group.candidates.length} candidates with same priority • {group.dateTimeKey.replace(/_/g, ' ')}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Confirmed Bookings */}
                    <div className="bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-surface-100 bg-emerald-50/30 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-surface-900">Confirmed Bookings</h3>
                                <p className="text-xs text-surface-400 mt-0.5">{confirmedVenueBookings.length} active</p>
                            </div>
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                        {confirmedVenueBookings.length === 0 ? (
                            <div className="p-8 text-center text-surface-400 text-sm">No confirmed venue bookings.</div>
                        ) : (
                            <div className="divide-y divide-surface-100">
                                {confirmedVenueBookings.map(b => (
                                    <div key={b._id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-surface-900 text-sm">{b.venueId?.name}</p>
                                                <p className="text-xs text-surface-400 mt-0.5">
                                                    {b.userId?.name} • {new Date(b.date).toLocaleDateString()} • {b.timeStart}–{b.timeEnd}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${priorityColor(b.priority)}`}>
                                                {b.eventType}
                                            </span>
                                            <button
                                                onClick={() => openEmailModal(b._id, 'venue', 'Venue Cleaning Issue', 'The venue was not cleaned properly after your event. A penalty will be applied. Please contact the department immediately.', b.userId)}
                                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors bg-amber-50/50 border border-amber-200"
                                                title="Report Cleaning Issue"
                                            >
                                                <AlertTriangle className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleCancelVenueBooking(b._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Cancel Booking"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Waitlisted Bookings */}
                    <div className="bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-surface-100 bg-amber-50/30 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-surface-900">Waiting List</h3>
                                <p className="text-xs text-surface-400 mt-0.5">{waitlistedVenueBookings.length} in queue</p>
                            </div>
                            <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                        {waitlistedVenueBookings.length === 0 ? (
                            <div className="p-8 text-center text-surface-400 text-sm">No waitlisted requests.</div>
                        ) : (
                            <div className="divide-y divide-surface-100">
                                {waitlistedVenueBookings.map(b => (
                                    <div key={b._id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-surface-900 text-sm">{b.venueId?.name}</p>
                                                <p className="text-xs text-surface-400 mt-0.5">
                                                    {b.userId?.name} • {new Date(b.date).toLocaleDateString()} • {b.timeStart}–{b.timeEnd}
                                                </p>
                                                <p className="text-xs text-surface-400">
                                                    Position #{b.waitlistPosition} • Priority: {priorityLabel(b.priority)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${priorityColor(b.priority)}`}>
                                            P{b.priority}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ================== EQUIPMENT TAB ================== */}
            {activeTab === 'equipment' && (
                <div className="space-y-4">
                    {equipBookings.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                                <PackageSearch className="w-8 h-8 text-surface-300" />
                            </div>
                            <p className="text-surface-500 font-medium">No equipment bookings for your department.</p>
                        </div>
                    ) : (
                        equipBookings.map((booking) => {
                            const isExpanded = expandedBooking === booking._id;
                            return (
                                <div key={booking._id} className="bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden transition-all">
                                    {/* Collapsed header row */}
                                    <div
                                        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-surface-50/50 transition-colors"
                                        onClick={() => setExpandedBooking(isExpanded ? null : booking._id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                booking.status === 'Returned' ? 'bg-surface-100' : 'bg-purple-50'
                                            }`}>
                                                <Package className={`w-5 h-5 ${booking.status === 'Returned' ? 'text-surface-400' : 'text-purple-600'}`} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-surface-900 text-sm">
                                                    {booking.studentId?.name}
                                                    <span className="text-surface-400 font-normal ml-2 text-xs">{booking.studentId?.admissionNumber}</span>
                                                </p>
                                                <p className="text-xs text-surface-400 mt-0.5">
                                                    {booking.items?.length || 0} item{(booking.items?.length || 0) !== 1 ? 's' : ''} •{' '}
                                                    {new Date(booking.startDate).toLocaleDateString()} — {new Date(booking.endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 border ${
                                                booking.status === 'Returned'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}>
                                                {booking.status === 'Returned' && <CheckCircle className="w-3 h-3" />}
                                                {booking.status}
                                            </span>
                                            {isExpanded
                                                ? <ChevronUp className="w-4 h-4 text-surface-400" />
                                                : <ChevronDown className="w-4 h-4 text-surface-400" />
                                            }
                                        </div>
                                    </div>

                                    {/* Expanded detail */}
                                    {isExpanded && (
                                        <div className="border-t border-surface-100 px-6 py-5 space-y-4 animate-slide-up">
                                            {/* Event info */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-surface-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 text-xs font-semibold text-surface-500 mb-1.5">
                                                        <FileText className="w-3.5 h-3.5" /> Event Description
                                                    </div>
                                                    <p className="text-sm text-surface-800">{booking.eventDescription}</p>
                                                </div>
                                                <div className="bg-surface-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 text-xs font-semibold text-surface-500 mb-1.5">
                                                        <Phone className="w-3.5 h-3.5" /> Contact
                                                    </div>
                                                    <p className="text-sm text-surface-800">{booking.phoneNumber}</p>
                                                    <p className="text-xs text-surface-400 mt-1">{booking.studentId?.email}</p>
                                                </div>
                                            </div>

                                            {/* Equipment items list */}
                                            <div>
                                                <p className="text-xs font-semibold text-surface-500 mb-2 uppercase tracking-wider">Equipment Items</p>
                                                <div className="bg-surface-50 rounded-xl divide-y divide-surface-200">
                                                    {booking.items?.map((item, idx) => (
                                                        <div key={idx} className="px-4 py-3 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                                                    <Package className="w-4 h-4 text-purple-600" />
                                                                </div>
                                                                <span className="font-semibold text-surface-900 text-sm">
                                                                    {item.equipmentId?.name || 'Equipment'}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-bold text-surface-700 bg-white px-3 py-1 rounded-lg border border-surface-200">
                                                                Qty: {item.quantity}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Incharge comment section */}
                                            <div>
                                                <p className="text-xs font-semibold text-surface-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                                    <MessageSquare className="w-3.5 h-3.5" /> Incharge Comment
                                                </p>
                                                {booking.inchargeComment && (
                                                    <div className="bg-brand-50/50 border border-brand-200 rounded-xl p-3 mb-2 text-sm text-brand-800">
                                                        {booking.inchargeComment}
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Add a comment..."
                                                        value={commentTexts[booking._id] || ''}
                                                        onChange={e => setCommentTexts(prev => ({ ...prev, [booking._id]: e.target.value }))}
                                                        className="flex-1 border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                                                        onKeyDown={e => { if (e.key === 'Enter') handleAddComment(booking._id); }}
                                                    />
                                                    <button
                                                        onClick={() => handleAddComment(booking._id)}
                                                        disabled={commentLoading[booking._id] || !commentTexts[booking._id]?.trim()}
                                                        className="px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                                    >
                                                        <Send className="w-3.5 h-3.5" />
                                                        {commentLoading[booking._id] ? 'Sending...' : 'Send'}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            {booking.status === 'Booked' && (
                                                <div className="pt-3 border-t border-surface-100 flex items-center justify-between">
                                                    <button
                                                        onClick={() => handleReturn(booking._id)}
                                                        className="inline-flex items-center gap-2 text-emerald-700 font-semibold bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 transition-colors text-sm"
                                                    >
                                                        <RotateCcw className="w-4 h-4" /> Mark as Returned
                                                    </button>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openEmailModal(booking._id, 'equipment', 'Equipment Damage Report', 'We have noted damage to the equipment you returned. A penalty will be applied to your account. Please contact the department immediately.', booking.studentId)}
                                                            className="inline-flex items-center gap-2 text-red-700 font-semibold bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl border border-red-200 transition-colors text-sm"
                                                            title="Report Damage"
                                                        >
                                                            <AlertTriangle className="w-4 h-4" /> Damage
                                                        </button>
                                                        <button
                                                            onClick={() => openEmailModal(booking._id, 'equipment', 'Late Equipment Return Notice', 'You have not returned the equipment on time. Please return it immediately to avoid further penalties.', booking.studentId)}
                                                            className="inline-flex items-center gap-2 text-amber-700 font-semibold bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-xl border border-amber-200 transition-colors text-sm"
                                                            title="Report Late Return"
                                                        >
                                                            <Clock className="w-4 h-4" /> Late
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Application Email Composition Modal */}
            {emailModal.isOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-surface-100 bg-brand-50 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="font-bold text-surface-900 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-brand-600" />
                                    Compose Notice
                                </h3>
                                <p className="text-xs text-brand-700 mt-1">
                                    To: <strong>{emailModal.studentName}</strong> ({emailModal.studentEmail})
                                </p>
                            </div>
                            <button 
                                onClick={() => setEmailModal(prev => ({ ...prev, isOpen: false }))} 
                                className="p-1.5 hover:bg-white/60 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-brand-600" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-xs font-semibold text-surface-500 mb-1.5 uppercase tracking-wider">Subject</label>
                                <input
                                    type="text"
                                    value={emailModal.subject}
                                    onChange={e => setEmailModal(prev => ({ ...prev, subject: e.target.value }))}
                                    className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                                    placeholder="Enter email subject"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-surface-500 mb-1.5 uppercase tracking-wider">Message</label>
                                <textarea
                                    value={emailModal.message}
                                    onChange={e => setEmailModal(prev => ({ ...prev, message: e.target.value }))}
                                    className="w-full border border-surface-200 rounded-xl px-4 py-3 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all h-40 resize-y"
                                    placeholder="Write your email content..."
                                />
                            </div>
                            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <div>This will be sent directly to the student's email inbox using the RITConnect professional template. It cannot be undone.</div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-surface-100 bg-surface-50 flex justify-end gap-3 shrink-0">
                            <button
                                onClick={() => setEmailModal(prev => ({ ...prev, isOpen: false }))}
                                className="px-4 py-2 text-surface-600 font-semibold hover:bg-surface-200 rounded-xl transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendCustomEmail}
                                disabled={sendingEmail || !emailModal.subject.trim() || !emailModal.message.trim()}
                                className="px-5 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                            >
                                {sendingEmail ? 'Sending...' : <><Send className="w-4 h-4" /> Send Email</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
