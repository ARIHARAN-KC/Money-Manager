import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const auth = useContext(AuthContext);
  
  if (!auth) {
    return <Navigate to="/login" replace />;
  }
  
  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6aba54]"></div>
      </div>
    );
  }
  
  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};