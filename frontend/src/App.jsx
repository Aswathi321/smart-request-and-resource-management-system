import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard placeholders (to be expanded)
const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard'));
const StaffDashboard = React.lazy(() => import('./pages/StaffDashboard'));
const SubmitRequest = React.lazy(() => import('./pages/SubmitRequest'));
const TrackStatus = React.lazy(() => import('./pages/TrackStatus'));
const BookVenue = React.lazy(() => import('./pages/BookVenue'));
const BookEquipment = React.lazy(() => import('./pages/BookEquipment'));
const MyBookings = React.lazy(() => import('./pages/MyBookings'));
const ApprovalDashboard = React.lazy(() => import('./pages/ApprovalDashboard'));
const ResourceInchargeDashboard = React.lazy(() => import('./pages/ResourceInchargeDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

// Simple Suspense loader
const Loader = () => <div className="p-8 text-center text-gray-500">Loading...</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes inside Layout */}
          <Route element={<AppLayout />}>
            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <React.Suspense fallback={<Loader />}><StudentDashboard /></React.Suspense>
              </ProtectedRoute>
            } />
            <Route path="/student/requests/new" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <React.Suspense fallback={<Loader />}><SubmitRequest /></React.Suspense>
              </ProtectedRoute>
            } />
            <Route path="/student/requests" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <React.Suspense fallback={<Loader />}><TrackStatus /></React.Suspense>
              </ProtectedRoute>
            } />
            <Route path="/student/venues" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <React.Suspense fallback={<Loader />}><BookVenue /></React.Suspense>
              </ProtectedRoute>
            } />
            <Route path="/student/equipment" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <React.Suspense fallback={<Loader />}><BookEquipment /></React.Suspense>
              </ProtectedRoute>
            } />
            <Route path="/student/bookings" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <React.Suspense fallback={<Loader />}><MyBookings /></React.Suspense>
              </ProtectedRoute>
            } />

            {/* Staff Routes */}
            <Route path="/staff" element={
              <ProtectedRoute allowedRoles={['Staff']}>
                <React.Suspense fallback={<Loader />}><StaffDashboard /></React.Suspense>
              </ProtectedRoute>
            } />
            <Route path="/staff/requests/new" element={
              <ProtectedRoute allowedRoles={['Staff']}>
                <React.Suspense fallback={<Loader />}><SubmitRequest /></React.Suspense>
              </ProtectedRoute>
            } />
            <Route path="/staff/requests" element={
              <ProtectedRoute allowedRoles={['Staff']}>
                <React.Suspense fallback={<Loader />}><TrackStatus /></React.Suspense>
              </ProtectedRoute>
            } />

            {/* Approval Roles */}
            <Route path="/advisor/requests" element={<ProtectedRoute allowedRoles={['Advisor']}><React.Suspense fallback={<Loader />}><ApprovalDashboard roleTitle="Advisor" /></React.Suspense></ProtectedRoute>} />
            <Route path="/advisor" element={<Navigate to="/advisor/requests" replace />} />

            <Route path="/hod/requests" element={<ProtectedRoute allowedRoles={['HOD']}><React.Suspense fallback={<Loader />}><ApprovalDashboard roleTitle="HOD" /></React.Suspense></ProtectedRoute>} />
            <Route path="/hod" element={<Navigate to="/hod/requests" replace />} />

            <Route path="/principal/requests" element={<ProtectedRoute allowedRoles={['Principal']}><React.Suspense fallback={<Loader />}><ApprovalDashboard roleTitle="Principal" /></React.Suspense></ProtectedRoute>} />
            <Route path="/principal" element={<Navigate to="/principal/requests" replace />} />

            <Route path="/resource-incharge/bookings" element={<ProtectedRoute allowedRoles={['ResourceIncharge']}><React.Suspense fallback={<Loader />}><ResourceInchargeDashboard /></React.Suspense></ProtectedRoute>} />
            <Route path="/resource-incharge" element={<Navigate to="/resource-incharge/bookings" replace />} />

            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['Admin']}><React.Suspense fallback={<Loader />}><AdminDashboard /></React.Suspense></ProtectedRoute>} />
            <Route path="/admin" element={<Navigate to="/admin/users" replace />} />

          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
