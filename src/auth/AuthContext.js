import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; // Axios භාවිතා කිරීමට

// API Base URL එක .env ගොනුවකින් ගන්න (නැතිනම් මෙහි දමන්න)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Context Provider Component එක
export const AuthProvider = ({ children }) => {
    // Local Storage වෙතින් මූලික Token එක සහ User Role එක ලබාගැනීම
    const [token, setToken] = useState(localStorage.getItem('jwtToken'));
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // 🔑 1. Login Logic
    const login = async (username, password) => {
        setIsLoading(true);
        setError(null);
        try {
            // Mock Credentials මත පදනම්ව Role එක තීරණය කිරීම (External Auth Simulation)
            let role = 'User';
            if (username === 'master') {
                role = 'MasterAdmin';
            } else if (username === 'admin') {
                role = 'InventoryAdmin';
            } else if (username === 'user') {
                role = 'User';
            } else {
                throw new Error('Invalid Credentials (Mock failed)');
            }
            
            // සත්‍ය Backend Call එක
            const response = await axios.post(`${API_BASE_URL}/login`, {
                username,
                password,
            });

            const newToken = response.data.token; 
            
            // සත්‍ය Backend එකෙන් ලැබෙන role එක භාවිතා කළ හැකිය.
            // දැනට Mock Role එක භාවිතා කරමු.
            
            setToken(newToken);
            setUserRole(role); // Token එක සමඟ backend එකෙන් role එකක් ලබා ගැනීම වඩාත් සුදුසුය.

            // Local Storage හි ගබඩා කිරීම
            localStorage.setItem('jwtToken', newToken);
            localStorage.setItem('userRole', role);

            return true;
        } catch (err) {
            console.error('Login Error:', err);
            setError(err.response?.data?.message || 'Login failed. Check credentials.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Logout Logic
    const logout = () => {
        setToken(null);
        setUserRole(null);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRole');
        // අනෙකුත් cleanup මෙහිදී කළ හැකිය (Ex: Cart state clear කිරීම)
    };
    
    // RBAC සඳහා පහසු ක්‍රියාකාරිත්වයක්
    const hasRole = (requiredRoles) => {
        if (!userRole) return false;
        // requiredRoles යනු ['MasterAdmin', 'InventoryAdmin'] වැනි Array එකකි.
        return requiredRoles.includes(userRole);
    };


    // Context Value එක
    const value = {
        token,
        userRole,
        isLoading,
        error,
        login,
        logout,
        hasRole,
        isAuthenticated: !!token, // boolean value
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
