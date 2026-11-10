import { Navigate, Outlet } from 'react-router';
import { useGetMeQuery } from '../api/authApi';
import FullPageLoader from './FullPageLoader';

/**
 * Guards every private route by asking the backend (via the httpOnly
 * cookie) instead of trusting anything in memory, so a page reload keeps
 * a valid session and an invalid one goes back to /login.
 */
export default function PrivateRoute() {
  const { isLoading, isError } = useGetMeQuery();

  if (isLoading) return <FullPageLoader />;
  if (isError) return <Navigate to="/login" replace />;
  return <Outlet />;
}
