import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useEffect } from 'react';

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading) return <div>Loading...</div>;

    return user ? children : null;
};
