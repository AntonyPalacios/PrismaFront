import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export default function FullPageLoader({ label = 'Cargando sesión…' }) {
  return (
    <Box
      role="status"
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress size={32} />
      <Typography color="text.secondary">{label}</Typography>
    </Box>
  );
}
