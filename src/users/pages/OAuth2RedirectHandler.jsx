import { Navigate } from 'react-router';
import { useGetMeQuery } from '../api/authApi';
import FullPageLoader from '../components/FullPageLoader';

/**
 * Where the backend lands the browser after Google. The JWT cookie is
 * already set; we just ask the backend who we are. No token in the URL.
 */
export default function OAuth2RedirectHandler() {
  const { isLoading, isError } = useGetMeQuery();

  if (isLoading) return <FullPageLoader />;
  if (isError) return <Navigate to="/login?error=login_failed" replace />;
  // Temporary landing until each role has its own menu (issue #36 scope).
  return <Navigate to="/" replace />;
}
