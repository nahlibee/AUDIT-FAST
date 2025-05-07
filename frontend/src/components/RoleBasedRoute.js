import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Role-based route protection component
 * This component restricts access to routes based on user roles
 * 
 * @param {Object} props - Component props
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string} [props.redirectPath='/'] - Path to redirect if not authorized
 * @returns {React.ReactNode} - Protected route content or redirect
 */
const RoleBasedRoute = ({ 
  allowedRoles, 
  children, 
  redirectPath = '/' 
}) => {
  const { hasRole, isLoggedIn } = useAuth();

  // First check if user is logged in
  if (!isLoggedIn) {
    // Save current path for redirect after login
    localStorage.setItem('intendedPath', window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  // Then check if user has any of the allowed roles
  const hasPermission = allowedRoles.some(role => hasRole(role));
  
  if (!hasPermission) {
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated and authorized, render the children
  return children;
};

export default RoleBasedRoute; 