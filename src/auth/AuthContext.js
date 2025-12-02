import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Initial state: Local Storage වෙතින් ආරක්ෂිතව ලබාගැනීම
    const [token, setToken] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // මුලින්ම true ලෙස තබමු
    const [error, setError] = useState(null);

    useEffect(() => {
        // App Load වන විට Local Storage හි තොරතුරු පූරණය කිරීම
        const storedToken = localStorage.getItem('jwtToken');
        const storedRole = localStorage.getItem('userRole');
        
        if (storedToken && storedRole) {
            setToken(storedToken);
            setUserRole(storedRole);
        }
        setIsLoading(false); 
    }, []);

    // 🔑 Login Logic: /api/login POST
    const login = async (username, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/login', {
                username,
                password,
            });

            const newToken = response.data.token;
            // ⚠️ Backend එකෙන් role එකක් ලැබෙන්නේ නම් එය භාවිතා කරන්න.
            // නැතිනම්, මෙහිදී Mock logic එක භාවිතා කරන්න (පරීක්ෂා කිරීම සඳහා):
            let role = response.data.role || 'User'; 
            if (username === 'master') { role = 'MasterAdmin'; } 
            else if (username === 'admin') { role = 'InventoryAdmin'; } 
            else if (username === 'user') { role = 'User'; } 

            setToken(newToken);
            setUserRole(role); 

            localStorage.setItem('jwtToken', newToken);
            localStorage.setItem('userRole', role);
            
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check server connection or credentials.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // 🚪 Logout Logic
    const logout = () => {
        setToken(null);
        setUserRole(null);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRole');
    };
    
    // 🛡️ Role Check (RBAC)
    const hasRole = (requiredRoles) => {
        if (!userRole) return false;
        return requiredRoles.includes(userRole);
    };

    const value = {
        token,
        userRole,
        isLoading,
        error,
        login,
        logout,
        hasRole,
        isAuthenticated: !!token, 
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
