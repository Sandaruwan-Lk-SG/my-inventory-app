import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { useRouter } from 'next/router'; // හෝ React Router හි Navigate

// MasterAdmin හෝ InventoryAdmin වැනි Array එකක් ලෙස requiredRoles ලබා දෙන්න
const ProtectedRoute = ({ children, requiredRoles }) => {
    const { isAuthenticated, userRole, isLoading, logout } = useAuth();
    const router = useRouter();

    if (isLoading) {
        // Auth state load වන තුරු Loading පෙන්වන්න
        return <div>Loading Authentication...</div>;
    }
    
    // 1. Authentication පරීක්ෂාව
    if (!isAuthenticated) {
        // Login පිටුවට යොමු කරන්න
        router.push('/Login');
        return null;
    }

    // 2. Role-Based Access Control (RBAC) පරීක්ෂාව
    if (requiredRoles && requiredRoles.length > 0) {
        if (!requiredRoles.includes(userRole)) {
            // අවසර නැති බවට පණිවිඩයක් පෙන්වන්න
            return (
                <div style={{ padding: '50px', textAlign: 'center' }}>
                    <h1>🛑 Access Denied</h1>
                    <p>Your role ({userRole}) does not have permission to view this page.</p>
                    <button onClick={logout}>Logout</button>
                </div>
            );
        }
    }

    // සියලු පරීක්ෂා සමත් නම්, දරුවා (children) පෙන්වන්න
    return children;
};

export default ProtectedRoute;

// භාවිත උදාහරණය:
// <ProtectedRoute requiredRoles={['MasterAdmin', 'InventoryAdmin']}>
//    <StockTransactionPage />
// </ProtectedRoute>
