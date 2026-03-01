import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { connectSocket, disconnectSocket } from '../../sockets/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            connectSocket(token);
            // Refresh profile from server to get avatar_url etc.
            api.get('/auth/profile')
                .then(res => {
                    const fresh = res.data.data.profile;
                    setUser(prev => ({ ...prev, ...fresh }));
                    localStorage.setItem('user', JSON.stringify({ ...JSON.parse(savedUser), ...fresh }));
                })
                .catch(() => { });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user: userData } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            connectSocket(token);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        disconnectSocket();
        window.location.href = '/login';
    };

    const signUp = async (name, email, password, phone, role) => {
        try {
            await api.post('/auth/register', { name, email, password, phone, role });
            return await login(email, password);
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    // Update user data in state + localStorage (used by Profile page)
    const updateUser = useCallback((patch) => {
        setUser(prev => {
            const updated = { ...prev, ...patch };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, signUp, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
