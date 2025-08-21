import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';

const PrivateRoute = ({ children, requiredRole = null, allowedRoles = null }) => {

  const { user, isAuth } = useAuth();
  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  // if (!isAuth) {
  //   return <Navigate to="/login" replace />;
  // }

  // // If specific roles are allowed, check if user has one of those roles
  // if (allowedRoles && user && !allowedRoles.includes(user.role)) {
  //   // Redirect based on user role
  //   if (user.role === "superadmin") {
  //     return <Navigate to="/admin" replace />;
  //   } else if (user.role === 'admin') {
  //     return <Navigate to="/inventory" replace />;
  //   } else {
  //     return <Navigate to="/agent" replace />;
  //   }
  // }

  // // If a specific role is required, check if user has that role
  // if (requiredRole && user && user.role !== requiredRole) {
  //   // Redirect based on user role
  //   if (user.role === 'superadmin') {
  //     return <Navigate to="/admin" replace />;
  //   } else if (user.role === 'admin') {
  //     return <Navigate to="/inventory" replace />;
  //   } else {
  //     return <Navigate to="/agent" replace />;
  //   }
  // }

  return children;
};

export default PrivateRoute; 