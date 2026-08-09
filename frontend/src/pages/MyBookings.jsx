import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, Monitor, MapPin, CheckCircle, Clock, X, AlertCircle } from 'lucide-react';

export default function MyBookings() {
    const [venueBooks, setVenueBooks] = useState([]);
    const [equipBooks, setEquipBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const [vBooks, eBooks] = await Promise.all([
                api.get('/venues/my-bookings'),
                api.get('/equipments/my-bookings')
            ]);
            setVenueBooks(vBooks.data);
            setEquipBooks(eBooks.data);
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancelVenue = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this venue booking?')) return;
        try {
            const { data } = await api.put(`/venues/cancel/${id}`);
            alert(data.message || 'Booking cancelled successfully');
            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const statusBadge = (status) => {
        const map = {
            'Confirmed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'Waitlisted': 'bg-amber-50 text-amber-700 border-amber-200',
            'Cancelled': 'bg-red-50 text-red-600 border-red-200',
            'Booked': 'bg-blue-50 text-blue-700 border-blue-200',
            'Returned': 'bg-surface-50 text-surface-600 border-surface-200'
        };
        return map[status] || map['Booked'];
    };

    const statusIcon = (status) => {
        if (status === 'Confirmed') return <CheckCircle className="w-3 h-3" />;
        if (status === 'Waitlisted') return <Clock className="w-3 h-3" />;
        if (status === 'Cancelled') return <X className="w-3 h-3" />;
        return null;
    };

    const priorityBadge = (priority) => {
        const map = {
            1: { label: 'Placement', color: 'bg-red-50 text-red-700' },
            2: { label: 'Club Event', color: 'bg-purple-50 text-purple-700' },
            3: { label: 'Department', color: 'bg-blue-50 text-blue-700' },
            4: { label: 'Other', color: 'bg-surface-50 text-surface-600' },
        };
        const info = map[priority] || map[4];
        return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${info.color}`}>{info.label}</span>;
    };

    if (loading) return (
        <div className="p-12 text-center text-surface-400 animate-fade-in">
            <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Loading bookings...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Venue Bookings */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-surface-900">Venue Bookings</h2>
                        <p className="text-xs text-surface-400 mt-0.5">{venueBooks.length} bookings</p>
                    </div>
                </div>

                {venueBooks.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-8 text-center">
                        <p className="text-surface-400 text-sm">No venue bookings found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {venueBooks.map(booking => (
                            <div key={booking._id} className="bg-white rounded-2xl shadow-card border border-surface-100 p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-surface-900 text-sm">{booking.venueId?.name || 'Unknown Venue'}</h3>
                                        {priorityBadge(booking.priority)}
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 ${statusBadge(booking.status)}`}>
                                        {statusIcon(booking.status)}
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-sm text-surface-500 flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-surface-300" />
                                        {new Date(booking.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-surface-500 flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-surface-300" />
                                        {booking.timeStart} – {booking.timeEnd}
                                    </p>
                                    <p className="text-sm text-surface-500">Event: {booking.eventType}</p>
                                    {booking.status === 'Waitlisted' && booking.waitlistPosition > 0 && (
                                        <p className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg mt-2 flex items-center gap-1.5">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            Waitlist Position: #{booking.waitlistPosition}
                                        </p>
                                    )}
                                </div>
                                {(booking.status === 'Confirmed' || booking.status === 'Waitlisted') && (
                                    <button
                                        onClick={() => handleCancelVenue(booking._id)}
                                        className="mt-3 w-full py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        {booking.status === 'Confirmed' ? 'Cancel Booking' : 'Leave Waitlist'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Equipment Bookings */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-surface-900">Equipment Bookings</h2>
                        <p className="text-xs text-surface-400 mt-0.5">{equipBooks.length} bookings</p>
                    </div>
                </div>

                {equipBooks.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-8 text-center">
                        <p className="text-surface-400 text-sm">No equipment bookings found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {equipBooks.map(booking => (
                            <div key={booking._id} className="bg-white rounded-2xl shadow-card border border-surface-100 p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-surface-900 text-sm truncate">{booking.eventDescription}</h3>
                                        <p className="text-xs text-surface-400 mt-0.5">📞 {booking.phoneNumber}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex-shrink-0 ml-2 ${statusBadge(booking.status)}`}>
                                        {booking.status === 'Returned' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-surface-500 flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-surface-300" />
                                        {new Date(booking.startDate).toLocaleDateString()} — {new Date(booking.endDate).toLocaleDateString()}
                                    </p>
                                    {/* Items list */}
                                    <div className="bg-surface-50 rounded-lg p-2.5 space-y-1">
                                        {booking.items?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-xs">
                                                <span className="text-surface-700 font-medium">{item.equipmentId?.name || 'Equipment'}</span>
                                                <span className="text-surface-500 font-semibold">×{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Incharge comment */}
                                    {booking.inchargeComment && (
                                        <div className="mt-2 text-xs text-brand-700 bg-brand-50 p-2.5 rounded-xl border border-brand-200">
                                            💬 {booking.inchargeComment}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
