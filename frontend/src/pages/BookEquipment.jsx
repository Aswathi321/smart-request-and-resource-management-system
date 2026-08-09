import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Package, Check, ArrowRight, ArrowLeft, Phone, FileText, Calendar, Minus, Plus } from 'lucide-react';

export default function BookEquipment() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        eventDescription: '',
        phoneNumber: '',
        startDate: '',
        endDate: ''
    });
    const [equipments, setEquipments] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchingEquip, setFetchingEquip] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    // Fetch available equipment when moving to step 2
    const fetchAvailable = async () => {
        if (!formData.startDate || !formData.endDate) return;
        setFetchingEquip(true);
        try {
            const { data } = await api.get(`/equipments/available?startDate=${formData.startDate}&endDate=${formData.endDate}`);
            setEquipments(data);
            // Initialize quantities to 0 for all
            const initQty = {};
            data.forEach(eq => { initQty[eq._id] = 0; });
            setQuantities(initQty);
        } catch (err) {
            console.error('Failed to fetch equipment', err);
            setError('Failed to load equipment for your department.');
        } finally {
            setFetchingEquip(false);
        }
    };

    const goToStep2 = () => {
        setError('');
        if (!formData.eventDescription.trim()) {
            setError('Please enter an event description.');
            return;
        }
        if (!formData.phoneNumber.trim()) {
            setError('Please enter a phone number.');
            return;
        }
        if (!formData.startDate || !formData.endDate) {
            setError('Please select both start and end dates.');
            return;
        }
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            setError('Start date cannot be after end date.');
            return;
        }
        setStep(2);
        fetchAvailable();
    };

    const updateQuantity = (eqId, delta) => {
        const eq = equipments.find(e => e._id === eqId);
        if (!eq) return;
        setQuantities(prev => {
            const current = prev[eqId] || 0;
            const newVal = Math.max(0, Math.min(eq.availableQuantity, current + delta));
            return { ...prev, [eqId]: newVal };
        });
    };

    const setQuantityDirect = (eqId, val) => {
        const eq = equipments.find(e => e._id === eqId);
        if (!eq) return;
        const num = parseInt(val) || 0;
        setQuantities(prev => ({
            ...prev,
            [eqId]: Math.max(0, Math.min(eq.availableQuantity, num))
        }));
    };

    const handleSubmit = async () => {
        setError('');
        // Build items array from quantities > 0
        const items = Object.entries(quantities)
            .filter(([, qty]) => qty > 0)
            .map(([equipmentId, quantity]) => ({ equipmentId, quantity }));

        if (items.length === 0) {
            setError('Please select at least one equipment with quantity > 0.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/equipments/book', {
                eventDescription: formData.eventDescription,
                phoneNumber: formData.phoneNumber,
                startDate: formData.startDate,
                endDate: formData.endDate,
                items
            });
            setSuccessMsg('Equipment booked successfully!');
            setTimeout(() => navigate('/student/bookings'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to book equipment.');
        } finally {
            setLoading(false);
        }
    };

    const selectedCount = Object.values(quantities).filter(q => q > 0).length;

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden">
                {/* Header */}
                <div className="px-8 py-5 border-b border-surface-100 bg-gradient-to-r from-brand-50 to-surface-50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                        <Package className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-surface-900">Book Equipment</h2>
                        <p className="text-xs text-surface-400 mt-0.5">
                            {step === 1 ? 'Step 1: Enter event details' : 'Step 2: Select equipment & quantities'}
                        </p>
                    </div>
                    {/* Step indicators */}
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-400'}`}>1</div>
                        <div className="w-6 h-0.5 bg-surface-200 rounded" />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-400'}`}>2</div>
                    </div>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 animate-slide-up">
                            {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700 flex items-center gap-2 animate-slide-up">
                            <Check className="w-4 h-4" /> {successMsg}
                        </div>
                    )}

                    {/* ====== STEP 1: Event Details ====== */}
                    {step === 1 && (
                        <div className="space-y-5 animate-fade-in">
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-surface-400" /> Event Description
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.eventDescription}
                                    onChange={e => setFormData({ ...formData, eventDescription: e.target.value })}
                                    className="input-field resize-none"
                                    placeholder="Describe the event or purpose for the equipment..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-surface-400" /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phoneNumber}
                                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="input-field"
                                    placeholder="Enter your contact number"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-surface-400" /> Start Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-surface-400" /> End Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button onClick={goToStep2} className="btn-primary">
                                    Next — Select Equipment <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ====== STEP 2: Select Equipment ====== */}
                    {step === 2 && (
                        <div className="animate-fade-in">
                            {/* Summary bar */}
                            <div className="mb-5 bg-surface-50 rounded-xl p-4 border border-surface-100 text-sm text-surface-600">
                                <span className="font-semibold text-surface-800">{formData.eventDescription.slice(0, 60)}{formData.eventDescription.length > 60 ? '...' : ''}</span>
                                <span className="mx-2">•</span>
                                {new Date(formData.startDate).toLocaleDateString()} — {new Date(formData.endDate).toLocaleDateString()}
                                <span className="mx-2">•</span>
                                📞 {formData.phoneNumber}
                            </div>

                            {fetchingEquip ? (
                                <div className="py-12 text-center text-surface-400">
                                    <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
                                    <p className="text-sm">Loading available equipment...</p>
                                </div>
                            ) : equipments.length === 0 ? (
                                <div className="py-12 text-center text-surface-400">
                                    <Package className="w-10 h-10 mx-auto mb-3 text-surface-300" />
                                    <p className="text-sm font-medium">No equipment found for your department.</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-surface-500 mb-4">
                                        Select the equipment you need and specify quantities. Showing equipment available for your department.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {equipments.map(eq => {
                                            const qty = quantities[eq._id] || 0;
                                            const isSelected = qty > 0;
                                            return (
                                                <div
                                                    key={eq._id}
                                                    className={`rounded-xl border-2 p-4 transition-all ${isSelected
                                                        ? 'border-brand-400 bg-brand-50/30 shadow-sm'
                                                        : 'border-surface-200 bg-white hover:border-surface-300'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div>
                                                            <p className="font-bold text-surface-900 text-sm">{eq.name}</p>
                                                            <p className="text-xs text-surface-400 mt-0.5">
                                                                Available: <span className={`font-semibold ${eq.availableQuantity > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{eq.availableQuantity}</span>
                                                                <span className="text-surface-300"> / {eq.totalQuantity}</span>
                                                            </p>
                                                        </div>
                                                        {isSelected && (
                                                            <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center">
                                                                <Check className="w-3.5 h-3.5 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {eq.availableQuantity > 0 ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(eq._id, -1)}
                                                                className="w-8 h-8 rounded-lg border border-surface-200 flex items-center justify-center hover:bg-surface-50 transition-colors disabled:opacity-30"
                                                                disabled={qty <= 0}
                                                            >
                                                                <Minus className="w-3.5 h-3.5" />
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={eq.availableQuantity}
                                                                value={qty}
                                                                onChange={e => setQuantityDirect(eq._id, e.target.value)}
                                                                className="w-16 text-center border border-surface-200 rounded-lg py-1.5 text-sm font-semibold focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(eq._id, 1)}
                                                                className="w-8 h-8 rounded-lg border border-surface-200 flex items-center justify-center hover:bg-surface-50 transition-colors disabled:opacity-30"
                                                                disabled={qty >= eq.availableQuantity}
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-red-500 font-medium">Not available for selected dates</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Bottom actions */}
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-100">
                                        <button
                                            onClick={() => { setStep(1); setError(''); }}
                                            className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 font-semibold transition-colors"
                                        >
                                            <ArrowLeft className="w-4 h-4" /> Back
                                        </button>
                                        <div className="flex items-center gap-3">
                                            {selectedCount > 0 && (
                                                <span className="text-xs text-surface-500 bg-surface-50 px-3 py-1.5 rounded-lg border border-surface-100">
                                                    {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
                                                </span>
                                            )}
                                            <button
                                                onClick={handleSubmit}
                                                disabled={loading || selectedCount === 0}
                                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Package className="w-4 h-4" />
                                                {loading ? 'Booking...' : 'Confirm Booking'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
