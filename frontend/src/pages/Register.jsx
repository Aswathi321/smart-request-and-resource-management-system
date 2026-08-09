import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, BookOpen, ArrowRight } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '', email: '', admissionNumber: '', department: 'CSE', year: '1', role: 'Student', password: ''
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            const payload = { ...formData, year: Number(formData.year) };
            const user = await register(payload);

            const roleMap = {
                'Student': '/student',
                'Staff': '/staff',
                'Advisor': '/advisor',
                'HOD': '/hod',
                'Principal': '/principal',
                'ResourceIncharge': '/resource-incharge',
                'Admin': '/admin'
            };
            navigate(roleMap[user.role] || '/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Gradient Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-950 via-brand-800 to-indigo-600 relative overflow-hidden">
                <div className="absolute top-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-400/10 rounded-full blur-2xl" />
                <div className="absolute top-1/3 right-20 w-48 h-48 bg-indigo-400/10 rounded-full blur-xl" />
                
                <div className="relative z-10 flex flex-col justify-center px-16">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">RITConnect</h1>
                    </div>
                    <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
                        Join the Campus<br />Management Portal
                    </h2>
                    <p className="text-brand-200 text-lg leading-relaxed max-w-md">
                        Create your account to submit requests, book venues, and manage resources seamlessly.
                    </p>
                </div>
            </div>

            {/* Right Panel - Register Form */}
            <div className="flex-1 flex items-center justify-center bg-surface-50 px-6 py-12">
                <div className="w-full max-w-lg">
                    {/* Mobile brand */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-gradient">RITConnect</h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-extrabold text-surface-900">Create your account</h2>
                        <p className="mt-2 text-surface-500 text-sm">Fill in your details to get started</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-slide-up">
                                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-red-600 text-xs font-bold">!</span>
                                </div>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">Full Name</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="input-field" placeholder="Enter your full name" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">Email Address</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="input-field" placeholder="you@example.com" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">Admission No / Emp ID</label>
                                <input type="text" name="admissionNumber" required value={formData.admissionNumber} onChange={handleChange} className="input-field" placeholder="e.g., TVE21CS001" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">Role</label>
                                <select name="role" value={formData.role} onChange={handleChange} className="select-field">
                                    <option value="Student">Student</option>
                                    <option value="Staff">Staff</option>
                                    <option value="Advisor">Advisor</option>
                                    <option value="HOD">HOD</option>
                                    <option value="Principal">Principal</option>
                                    <option value="ResourceIncharge">Resource Incharge</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">Department</label>
                                <select name="department" value={formData.department} onChange={handleChange} className="select-field">
                                    <option value="CSE">CSE</option>
                                    <option value="ECE">ECE</option>
                                    <option value="MECH">MECH</option>
                                    <option value="EEE">EEE</option>
                                    <option value="Civil">Civil</option>
                                    <option value="B.Arch">B.Arch</option>
                                    <option value="Common">Common</option>
                                </select>
                            </div>

                            {(formData.role === 'Student' || formData.role === 'Advisor') && (
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-2">Year</label>
                                    <select name="year" value={formData.year} onChange={handleChange} className="select-field">
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">Password</label>
                            <input type="password" name="password" required value={formData.password} onChange={handleChange} className="input-field" placeholder="Create a strong password" />
                        </div>

                        <button type="submit" className="btn-primary mt-2">
                            <UserPlus className="w-4 h-4" />
                            Create Account
                            <ArrowRight className="w-4 h-4 ml-auto" />
                        </button>

                        <div className="flex items-center justify-center text-sm pt-2">
                            <span className="text-surface-500">Already have an account?</span>
                            <Link to="/login" className="ml-2 font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
