import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Shield } from 'lucide-react';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/admin/users');
                setUsers(data);
            } catch (err) {
                console.error('Failed to fetch users', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const getRoleBadge = (role) => {
        const map = {
            Student: 'bg-blue-50 text-blue-700 border-blue-200',
            Staff: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            Advisor: 'bg-amber-50 text-amber-700 border-amber-200',
            HOD: 'bg-purple-50 text-purple-700 border-purple-200',
            Principal: 'bg-rose-50 text-rose-700 border-rose-200',
            ResourceIncharge: 'bg-teal-50 text-teal-700 border-teal-200',
            Admin: 'bg-brand-50 text-brand-700 border-brand-200',
        };
        return map[role] || 'bg-surface-50 text-surface-700 border-surface-200';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="gradient-header relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-white">Admin Control Panel</h2>
                        <p className="text-brand-100 mt-0.5">Manage users and system settings</p>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-surface-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-surface-400" />
                        <h3 className="font-bold text-surface-900 text-lg">Registered Users</h3>
                    </div>
                    <span className="px-3 py-1 bg-surface-100 text-surface-600 rounded-lg text-sm font-semibold">
                        {users.length} total
                    </span>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-surface-400">
                        <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm">Loading users...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-surface-50/80">
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Dept / Year</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {users.map(u => (
                                    <tr key={u._id} className="hover:bg-surface-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xs">
                                                    {u.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-surface-900 text-sm">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-surface-500 text-sm">{u.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 text-xs rounded-lg font-semibold border ${getRoleBadge(u.role)}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-surface-500 text-sm">{u.department || '-'} / {u.year || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
