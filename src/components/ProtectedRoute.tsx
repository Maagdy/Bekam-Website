import { useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin }: ProtectedRouteProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <p className="text-gray-600">Please login to access this page</p>
          <button onClick={() => setShowAuth(true)} className="btn-primary">
            Login
          </button>
        </div>
        <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      </>
    );
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
