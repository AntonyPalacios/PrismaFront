import { Navigate } from 'react-router';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useGetMeQuery } from '../users/api/authApi';
import { homeFor } from './homeFor';

/**
 * "/" (agreements of 2026-11-17): there is no home page of its own; ADMIN
 * and TUTOR land on "Alumnos" ("Mis alumnos" for a tutor) and COORDINADOR
 * on "Exámenes".
 */
export default function HomePage() {
  const { data: me } = useGetMeQuery();
  if (!me) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={32} aria-label="Cargando" />
      </Box>
    );
  }
  return <Navigate to={homeFor(me.roles)} replace />;
}
