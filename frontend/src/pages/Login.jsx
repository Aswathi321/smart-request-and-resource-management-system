import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, BookOpen, ArrowRight } from 'lucide-react';

export default function Login() {
    const [identifier, setIdentifier] = useState(''); // email or admissionNumber
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            // Determine if identifier is email or admission number
            const isEmail = identifier.includes('@');
            const payload = isEmail ? { email: identifier, password } : { admissionNumber: identifier, password };

            const user = await login(payload);

            // Redirect based on role
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
            setError(err.response?.data?.message || 'Failed to login');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Gradient Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-950 via-brand-800 to-indigo-600 relative overflow-hidden">
                {/* Decorative circles */}
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
                        College Request &<br />Resource Management
                    </h2>
                    <p className="text-brand-200 text-lg leading-relaxed max-w-md">
                        Streamline your academic requests, venue bookings, and equipment management — all in one place.
                    </p>
                    <div className="mt-12 flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">✓</span>
                            </div>
                            <span className="text-brand-200 text-sm">Fast Approvals</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">✓</span>
                            </div>
                            <span className="text-brand-200 text-sm">Easy Booking</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">✓</span>
                            </div>
                            <span className="text-brand-200 text-sm">Track Requests</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center bg-surface-50 px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Mobile brand */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-gradient">RITConnect</h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-extrabold text-surface-900">Welcome back</h2>
                        <p className="mt-2 text-surface-500 text-sm">Sign in to your account to continue</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-slide-up">
                                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-red-600 text-xs font-bold">!</span>
                                </div>
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">Admission Number or Email</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                placeholder="Enter your admission number or email"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                className="input-field"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn-primary mt-2">
                            <LogIn className="w-4 h-4" />
                            Sign In
                            <ArrowRight className="w-4 h-4 ml-auto" />
                        </button>

                        <div className="flex items-center justify-center text-sm pt-2">
                            <span className="text-surface-500">Don't have an account?</span>
                            <Link to="/register" className="ml-2 font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                                Register here
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
