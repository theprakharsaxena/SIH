import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/** Requires user to be logged in. Redirects to /login otherwise. */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

/** Requires user to have is_admin=true. Redirects to /admin/login otherwise. */
export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenSpinner />;
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  if (!user.is_admin) return <Navigate to="/dashboard" replace />;
  return children;
}

function FullScreenSpinner() {
  return (
    <div style={{
      display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a3a6b 0%, #0f2347 100%)',
    }}>
      <div style={{
        width: '48px', height: '48px',
        border: '4px solid rgba(255,255,255,0.2)',
        borderTopColor: '#e8720a',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
