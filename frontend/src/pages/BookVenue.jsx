import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MapPin, Check, Clock, Search, ChevronRight, ChevronLeft, Users, Calendar, FileText, Zap } from 'lucide-react';

const EVENT_TYPES = [
    { value: 'Placement', label: 'Placement', icon: '🎯', desc: 'Campus placement drives & interviews', priority: 'Priority 1' },
    { value: 'Club Event', label: 'Club Event', icon: '🎪', desc: 'Club activities, fests & cultural events', priority: 'Priority 2' },
    { value: 'Department', label: 'Department', icon: '🏛️', desc: 'Departmental seminars & workshops', priority: 'Priority 3' },
    { value: 'Other', label: 'Other', icon: '📋', desc: 'Meetings, guest lectures & other events', priority: 'Priority 4' },
];

export default function BookVenue() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        eventType: '',
        capacityNeeded: '',
        date: '',
        timeStart: '',
        timeEnd: '',
        description: ''
    });
    const [availability, setAvailability] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const handleCheck = async () => {
        setLoading(true);
        try {
            setError(''); setSuccessMsg('');
            const { data } = await api.post('/venues/availability', {
                date: formData.date,
                capacityNeeded: Number(formData.capacityNeeded),
                timeStart: formData.timeStart,
                timeEnd: formData.timeEnd
            });
            setAvailability(data);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to check availability');
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (venueId) => {
        try {
            setError('');
            await api.post('/venues/book', { ...formData, venueId });
            setSuccessMsg('Venue booked successfully!');
            setAvailability(null);
            setTimeout(() => navigate('/student/bookings'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to book venue');
        }
    };

    const handleWaitlist = async (venueId) => {
        try {
            setError('');
            await api.post('/venues/waitlist', { ...formData, venueId });
            setSuccessMsg('Added to waitlist successfully! You will be notified when the venue becomes available.');
            setTimeout(() => navigate('/student/bookings'), 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join waitlist');
        }
    };

    const canProceedStep1 = formData.eventType && formData.capacityNeeded;
    const canProceedStep2 = formData.date && formData.timeStart && formData.timeEnd;

    const selectedEventInfo = EVENT_TYPES.find(e => e.value === formData.eventType);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="gradient-header relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-white">Book a Venue</h2>
                        <p className="text-brand-100 mt-0.5">Find and reserve the perfect space for your event</p>
                    </div>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 px-4">
                {[
                    { num: 1, label: 'Event Details' },
                    { num: 2, label: 'Date & Time' },
                    { num: 3, label: 'Results' },
                ].map((s, i) => (
                    <React.Fragment key={s.num}>
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= s.num
                                ? 'bg-brand-600 text-white shadow-md'
                                : 'bg-surface-100 text-surface-400'
                                }`}>
                                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                            </div>
                            <span className={`text-sm font-medium hidden sm:inline ${step >= s.num ? 'text-brand-700' : 'text-surface-400'}`}>
                                {s.label}
                            </span>
                        </div>
                        {i < 2 && (
                            <div className={`w-12 h-0.5 rounded-full transition-all duration-300 ${step > s.num ? 'bg-brand-500' : 'bg-surface-200'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 animate-slide-up">
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700 flex items-center gap-2 animate-slide-up">
                    <Check className="w-4 h-4" /> {successMsg}
                </div>
            )}

            {/* Step 1: Event Type & Capacity */}
            {step === 1 && (
                <div className="bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden animate-slide-up">
                    <div className="px-8 py-5 border-b border-surface-100 bg-surface-50/50">
                        <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-brand-500" /> Event Details
                        </h3>
                        <p className="text-xs text-surface-400 mt-1">Select event type and required capacity</p>
                    </div>
                    <div className="p-8 space-y-6">
                        {/* Event Type Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-3">Event Type</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {EVENT_TYPES.map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, eventType: type.value })}
                                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${formData.eventType === type.value
                                            ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                                            : 'border-surface-150 hover:border-surface-300 bg-white'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">{type.icon}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-bold text-surface-900 text-sm">{type.label}</p>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.eventType === type.value
                                                        ? 'bg-brand-100 text-brand-700'
                                                        : 'bg-surface-100 text-surface-500'
                                                        }`}>{type.priority}</span>
                                                </div>
                                                <p className="text-xs text-surface-400 mt-0.5">{type.desc}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Capacity */}
                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">Required Capacity</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.capacityNeeded}
                                onChange={e => setFormData({ ...formData, capacityNeeded: e.target.value })}
                                className="input-field"
                                placeholder="e.g., 100 (will search 100–120 range)"
                            />
                            {formData.capacityNeeded > 0 && (
                                <p className="text-xs text-surface-400 mt-1.5 flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-amber-500" />
                                    Searching venues with capacity {formData.capacityNeeded}–{Number(formData.capacityNeeded) + 20}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            disabled={!canProceedStep1}
                            className="btn-primary"
                        >
                            Continue <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Date, Time, Description */}
            {step === 2 && (
                <div className="bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden animate-slide-up">
                    <div className="px-8 py-5 border-b border-surface-100 bg-surface-50/50">
                        <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-brand-500" /> Schedule & Description
                        </h3>
                        <p className="text-xs text-surface-400 mt-1">
                            {selectedEventInfo?.icon} {selectedEventInfo?.label} • Capacity: {formData.capacityNeeded}
                        </p>
                    </div>
                    <div className="p-8 space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">Event Date</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">Start Time</label>
                                <input
                                    type="time"
                                    required
                                    value={formData.timeStart}
                                    onChange={e => setFormData({ ...formData, timeStart: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">End Time</label>
                                <input
                                    type="time"
                                    required
                                    value={formData.timeEnd}
                                    onChange={e => setFormData({ ...formData, timeEnd: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">
                                <FileText className="w-4 h-4 inline mr-1 text-surface-400" /> Description
                            </label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="input-field resize-none"
                                placeholder="Brief description of your event..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 flex justify-center items-center gap-2 py-3 px-6 bg-surface-100 text-surface-700 font-semibold rounded-xl hover:bg-surface-200 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                            <button
                                type="button"
                                onClick={handleCheck}
                                disabled={!canProceedStep2 || loading}
                                className="flex-[2] btn-primary"
                            >
                                <Search className="w-4 h-4" />
                                {loading ? 'Checking...' : 'Check Availability'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Availability Results */}
            {step === 3 && availability && (
                <div className="space-y-6 animate-slide-up">
                    {/* Summary Bar */}
                    <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-5 flex flex-wrap items-center gap-4 text-sm">
                        <span className="font-semibold text-surface-900">{selectedEventInfo?.icon} {selectedEventInfo?.label}</span>
                        <span className="text-surface-300">|</span>
                        <span className="text-surface-600">Capacity: {formData.capacityNeeded}–{Number(formData.capacityNeeded) + 20}</span>
                        <span className="text-surface-300">|</span>
                        <span className="text-surface-600">{formData.date}</span>
                        <span className="text-surface-300">|</span>
                        <span className="text-surface-600">{formData.timeStart} – {formData.timeEnd}</span>
                        <button
                            onClick={() => { setStep(1); setAvailability(null); }}
                            className="ml-auto text-brand-600 font-semibold text-xs hover:underline"
                        >
                            New Search
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Available Venues */}
                        <div className="bg-white rounded-2xl shadow-card border border-emerald-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50/50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-emerald-700">Available Venues</h3>
                                    <p className="text-xs text-emerald-500 mt-0.5">{availability.available.length} venue(s) found</p>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-emerald-600" />
                                </div>
                            </div>
                            <div className="p-5">
                                {availability.available.length === 0 ? (
                                    <p className="text-surface-400 text-sm text-center py-6">No venues available for this criteria.</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {availability.available.map(v => (
                                            <li key={v._id} className="border border-surface-100 rounded-xl p-4 flex justify-between items-center hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-200">
                                                <div>
                                                    <p className="font-bold text-surface-900 text-sm">{v.name}</p>
                                                    <p className="text-xs text-surface-400 mt-0.5">
                                                        {v.department} Dept • Capacity: {v.capacity}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleBook(v._id)}
                                                    className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200 whitespace-nowrap"
                                                >
                                                    Book Now
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Unavailable Venues (Waitlist) */}
                        <div className="bg-white rounded-2xl shadow-card border border-amber-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-amber-100 bg-amber-50/50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-amber-700">Already Booked</h3>
                                    <p className="text-xs text-amber-500 mt-0.5">{availability.unavailable.length} venue(s) occupied — join waitlist</p>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                </div>
                            </div>
                            <div className="p-5">
                                {availability.unavailable.length === 0 ? (
                                    <p className="text-surface-400 text-sm text-center py-6">All matching venues are available!</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {availability.unavailable.map(v => (
                                            <li key={v._id} className="border border-surface-100 rounded-xl p-4 hover:border-amber-200 transition-all duration-200">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-surface-700 text-sm">{v.name}</p>
                                                        <p className="text-xs text-surface-400 mt-0.5">
                                                            {v.department} Dept • Capacity: {v.capacity}
                                                        </p>
                                                        {v.bookedBy && (
                                                            <p className="text-xs text-amber-600 mt-1.5 bg-amber-50 px-2 py-1 rounded-lg inline-block">
                                                                Booked for {v.bookedBy.eventType} ({v.bookedBy.timeStart}–{v.bookedBy.timeEnd})
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleWaitlist(v._id)}
                                                        className="px-3 py-2 bg-amber-50 text-amber-700 text-xs font-semibold rounded-xl hover:bg-amber-100 transition-colors border border-amber-200 whitespace-nowrap flex items-center gap-1.5"
                                                    >
                                                        <Clock className="w-3.5 h-3.5" /> Waitlist
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
