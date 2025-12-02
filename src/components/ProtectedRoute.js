import React from 'react';
import { useAuth } from '../auth/AuthContext';
// React Router භාවිතා කරන්නේ නම්:
import { Navigate } from 'react-router-dom'; 
// Next.js භාවිතා කරන්නේ නම්: 
// import { useRouter } from 'next/router';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
    const { isAuthenticated, userRole, isLoading, logout } = useAuth();
    // const router = useRouter(); // Next.js සඳහා

    if (isLoading) {
        return <div>Loading authentication state...</div>;
    }
    
    // 1. Authentication පරීක්ෂාව
    if (!isAuthenticated) {
        // React Router: Login පිටුවට යොමු කරන්න
        return <Navigate to="/login" replace />;
        // Next.js: router.push('/login'); return null;
    }

    // 2. Role-Based Access Control (RBAC) පරීක්ෂාව
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
        return (
            <div style={{ padding: '50px', textAlign: 'center', backgroundColor: '#fee', border: '1px solid #f00', margin: '20px' }}>
                <h1>🛑 Access Denied</h1>
                <p>ඔබගේ {userRole} Role එකට මෙම පිටුවට ප්‍රවේශ විය නොහැක.</p>
                <p>අවශ්‍ය Roles: **{requiredRoles.join(', ')}**</p>
                <button onClick={logout} style={{ padding: '10px', marginTop: '20px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>Logout</button>
            </div>
        );
    }

    // සියල්ල හරි නම්, දරුවා (children) පෙන්වන්න
    return children;
};

export default ProtectedRoute;
