import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isAuth, user, authState } = useAuth();
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        // Check if we have a token and validate it
        const token = localStorage.getItem('token');
        if (token && !user) {
            // Token exists but user not loaded, wait for auth validation
            const timer = setTimeout(() => setLoading(false), 2000);
            return () => clearTimeout(timer);
        } else {
            setLoading(false);
        }
    }, [user, isAuth]);

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <Spin size="large" />
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuth || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access if required
    if (requiredRole && user.role !== requiredRole) {
        // Redirect based on user role
        if (user.role === 'superadmin') {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // User is authenticated and has proper role
    return children;
};

export default ProtectedRoute;
