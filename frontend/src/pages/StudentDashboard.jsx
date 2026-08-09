import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FileText, Compass, Calendar, BookOpen, TrendingUp, MapPin, Monitor } from 'lucide-react';

export default function StudentDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ requests: 0, venueBookings: 0, equipmentBookings: 0 });

    useEffect(() => {
        // Fetch some basic stats
        const fetchStats = async () => {
            try {
                const [reqs, vBooks, eBooks] = await Promise.all([
                    api.get('/requests/my'),
                    api.get('/venues/my-bookings'),
                    api.get('/equipments/my-bookings')
                ]);
                setStats({
                    requests: reqs.data.length,
                    venueBookings: vBooks.data.length,
                    equipmentBookings: eBooks.data.length
                });
            } catch (error) {
                console.error('Error fetching dashboard stats', error);
            }
        };
        fetchStats();
    }, []);

    const quickActions = [
        { name: 'Submit Request', icon: FileText, path: '/student/requests/new', color: 'from-brand-500 to-brand-600', bg: 'bg-brand-50' },
        { name: 'Track Status', icon: Compass, path: '/student/requests', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
        { name: 'Book Venue', icon: MapPin, path: '/student/venues', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
        { name: 'My Bookings', icon: BookOpen, path: '/student/bookings', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Banner */}
            <div className="gradient-header relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-extrabold text-white">Welcome back, {user?.name}! 👋</h2>
                        <p className="text-brand-100 mt-1.5">{user?.department} Department • Year {user?.year}</p>
                    </div>
                    <div className="mt-4 md:mt-0 px-4 py-2 bg-white/15 backdrop-blur-sm text-white rounded-xl text-sm font-semibold">
                        {user?.admissionNumber}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="stat-card group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <FileText className="w-5 h-5 text-brand-600" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-surface-300" />
                    </div>
                    <p className="text-sm font-medium text-surface-500 mb-1">Total Requests</p>
                    <p className="text-3xl font-extrabold text-surface-900">{stats.requests}</p>
                </div>

                <div className="stat-card group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <MapPin className="w-5 h-5 text-emerald-600" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-surface-300" />
                    </div>
                    <p className="text-sm font-medium text-surface-500 mb-1">Venue Bookings</p>
                    <p className="text-3xl font-extrabold text-surface-900">{stats.venueBookings}</p>
                </div>

                <div className="stat-card group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Monitor className="w-5 h-5 text-purple-600" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-surface-300" />
                    </div>
                    <p className="text-sm font-medium text-surface-500 mb-1">Equipment Bookings</p>
                    <p className="text-3xl font-extrabold text-surface-900">{stats.equipmentBookings}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-6">
                <h3 className="text-lg font-bold text-surface-900 mb-5">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={action.name}
                                to={action.path}
                                className="group p-5 border border-surface-100 rounded-2xl hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center"
                            >
                                <div className={`w-12 h-12 rounded-xl ${action.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="w-5 h-5 text-surface-700" />
                                </div>
                                <span className="text-sm font-semibold text-surface-700">{action.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
