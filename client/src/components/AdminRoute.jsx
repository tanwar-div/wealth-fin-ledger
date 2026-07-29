import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export default function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
