import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their respective dashboard
        const roleMap = {
            'Student': '/student',
            'Staff': '/staff',
            'Advisor': '/advisor',
            'HOD': '/hod',
            'Principal': '/principal',
            'ResourceIncharge': '/resource-incharge',
            'Admin': '/admin'
        };
        return <Navigate to={roleMap[user.role] || '/'} replace />;
    }

    return children;
}
