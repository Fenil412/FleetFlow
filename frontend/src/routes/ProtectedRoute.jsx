import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useEffect } from 'react';

export const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/login');
            } else if (allowedRoles && !allowedRoles.includes(user.role_name || user.role)) {
                navigate('/');
            }
        }
    }, [user, loading, navigate, allowedRoles]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    );

    if (!user) return null;
    if (allowedRoles && !allowedRoles.includes(user.role_name || user.role)) return null;

    return children;
};
