import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FileText, Compass, Info } from 'lucide-react';

export default function StaffDashboard() {
    const { user } = useAuth();

    const quickActions = [
        { name: 'Submit Request', icon: FileText, path: '/staff/requests/new', bg: 'bg-brand-50' },
        { name: 'Track Status', icon: Compass, path: '/staff/requests', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Banner */}
            <div className="gradient-header relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
                <div className="relative z-10">
                    <h2 className="text-2xl font-extrabold text-white">Welcome, {user?.name}! 👋</h2>
                    <p className="text-brand-100 mt-1.5">{user?.department} Department • Staff</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-6">
                <h3 className="text-lg font-bold text-surface-900 mb-5">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
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

            {/* Info Card */}
            <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Info className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-surface-900 mb-1">Getting Started</h4>
                        <p className="text-surface-500 text-sm leading-relaxed">
                            You can submit leave requests or view your request status using the navigation menu or the quick action buttons above.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
