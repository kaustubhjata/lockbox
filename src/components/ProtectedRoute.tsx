
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { checkAuth, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    // Optionally return a loading spinner or skeleton here
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!checkAuth()) {
    // Redirect to login if not authenticated
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
