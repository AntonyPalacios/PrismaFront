import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useGetMeQuery } from '../users/api/authApi';

/**
 * Temporary post-login landing (category B, issue #36): once modules exist,
 * each role lands on the first item of its own menu instead.
 */
export default function HomePage() {
  const { data: me } = useGetMeQuery();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography component="h1" sx={{ fontSize: 28, fontWeight: 500 }}>
        Bienvenido, {me?.firstName}
      </Typography>
      <Typography color="text.secondary">
        Aquí irán apareciendo los módulos de Prisma a medida que se construyan.
      </Typography>
    </Box>
  );
}
