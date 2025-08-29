import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PublicRoute = ({ children }) => {
    const { isAuth, user } = useAuth();

    // If user is already authenticated, redirect to appropriate dashboard
    if (isAuth && user) {
        if (user.role === 'superadmin') {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }

    // User is not authenticated, show public content (login/register)
    return children;
};

export default PublicRoute;
