import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, Calendar, Compass, LogOut, Package, BookOpen, Menu, X } from 'lucide-react';

export default function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = {
        Student: [
            { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
            { name: 'Submit Request', path: '/student/requests/new', icon: FileText },
            { name: 'Track Status', path: '/student/requests', icon: Compass },
            { name: 'Book Venue', path: '/student/venues', icon: Calendar },
            { name: 'Book Equipment', path: '/student/equipment', icon: Package },
            { name: 'My Bookings', path: '/student/bookings', icon: BookOpen },
        ],
        Staff: [
            { name: 'Dashboard', path: '/staff', icon: LayoutDashboard },
            { name: 'Submit Request', path: '/staff/requests/new', icon: FileText },
            { name: 'Track Status', path: '/staff/requests', icon: Compass },
        ],
        Advisor: [
            { name: 'Dashboard', path: '/advisor', icon: LayoutDashboard },
            { name: 'Pending Requests', path: '/advisor/requests', icon: FileText },
        ],
        HOD: [
            { name: 'Dashboard', path: '/hod', icon: LayoutDashboard },
            { name: 'Forwarded Requests', path: '/hod/requests', icon: FileText },
        ],
        Principal: [
            { name: 'Dashboard', path: '/principal', icon: LayoutDashboard },
            { name: 'Final Approvals', path: '/principal/requests', icon: FileText },
        ],
        ResourceIncharge: [
            { name: 'Dashboard', path: '/resource-incharge', icon: LayoutDashboard },
            { name: 'Active Bookings', path: '/resource-incharge/bookings', icon: Calendar },
        ],
        Admin: [
            { name: 'Users Management', path: '/admin/users', icon: LayoutDashboard },
            { name: 'System Data', path: '/admin/data', icon: FileText },
        ]
    };

    const currentMenu = user ? menuItems[user.role] : [];

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    const SidebarContent = () => (
        <>
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-lg font-bold text-white tracking-tight">RITConnect</h1>
                </div>
            </div>

            {/* User Info */}
            <div className="px-5 py-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {getInitials(user?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{user?.name}</p>
                        <p className="text-xs text-brand-200 font-medium mt-0.5">{user?.role}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {currentMenu?.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                ? 'bg-white/15 text-white shadow-sm backdrop-blur-sm'
                                : 'text-brand-200 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <Icon className={`mr-3 h-[18px] w-[18px] transition-colors ${isActive ? 'text-white' : 'text-brand-300 group-hover:text-white'}`} />
                            {item.name}
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-brand-200 rounded-xl hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                >
                    <LogOut className="mr-3 h-[18px] w-[18px]" />
                    Sign Out
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-surface-100 flex">
            {/* Desktop Sidebar */}
            <div className="w-64 bg-gradient-to-b from-brand-950 via-brand-900 to-brand-800 flex-col hidden sm:flex shadow-xl fixed inset-y-0 left-0 z-30">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 sm:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-72 bg-gradient-to-b from-brand-950 via-brand-900 to-brand-800 flex flex-col shadow-2xl animate-slide-in-left">
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden sm:ml-64">
                {/* Top bar */}
                <div className="h-16 bg-white/80 backdrop-blur-md border-b border-surface-200/50 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="sm:hidden p-2 text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="hidden sm:block">
                        <p className="text-sm text-surface-500">
                            Welcome back, <span className="font-semibold text-surface-800">{user?.name}</span>
                        </p>
                    </div>
                    <div className="sm:hidden">
                        <h1 className="text-lg font-bold text-gradient">RITConnect</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-xs font-semibold">
                            {user?.role}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-xs sm:hidden">
                            {getInitials(user?.name)}
                        </div>
                    </div>
                </div>

                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <div className="w-full mx-auto max-w-6xl animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
