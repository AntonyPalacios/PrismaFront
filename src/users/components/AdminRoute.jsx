import { Navigate, Outlet } from 'react-router';
import { useGetMeQuery } from '../api/authApi';
import FullPageLoader from './FullPageLoader';

/**
 * Admin-only pages. Normally "Me" is already loaded by PrivateRoute, but
 * the guard waits for it instead of assuming so; other roles go back home
 * (the backend answers 403 anyway).
 */
export default function AdminRoute() {
  const { data: me, isLoading } = useGetMeQuery();

  if (isLoading) return <FullPageLoader />;
  return me?.roles?.includes('ADMIN') ? <Outlet /> : <Navigate to="/" replace />;
}
