import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If user's role is not in the allowed roles, redirect to their appropriate dashboard
    switch (user?.role) {
      case 'school-dean':
        return <Navigate to="/school-dean/dashboard" replace />;
      case 'department-head':
        return <Navigate to="/department/dashboard" replace />;
      case 'instructor':
        return <Navigate to="/instructor/dashboard" replace />;
      case 'vice-scientific-director':
        return <Navigate to="/vice-director/dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
