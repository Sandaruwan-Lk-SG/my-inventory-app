import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
// Router භාවිතයෙන් redirect කිරීමට (React Router හෝ Next.js Router)
import { useRouter } from 'next/router'; // Next.js භාවිතා කරන්නේ නම්

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error } = useAuth();
    const router = useRouter(); // Next.js සඳහා

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 🔑 1. /api/login POST Call එක සිදුවන්නේ AuthContext.js ඇතුළතයි
        const success = await login(username, password);

        if (success) {
            // සාර්ථක නම්, Dashboard වෙත redirect කරන්න
            router.push('/'); 
        } 
        // අසාර්ථක නම්, error message එක පෙන්වයි (AuthContext වෙතින් ලැබෙන)
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ccc' }}>
            <h2>🔑 Login</h2>
            <p>Mock Credentials: master/password, admin/password, user/password</p>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                
                <button type="submit" disabled={isLoading} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;
