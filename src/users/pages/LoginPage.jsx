import { useState } from 'react';
import { useSearchParams } from 'react-router';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { colors } from '../../app/theme';
import { consumeSessionExpired } from '../../app/session';
import PrismaLogo from '../../layout/PrismaLogo';
import GoogleIcon from '../components/GoogleIcon';

// Full-page navigation to the backend (no Google SDK in the browser): the
// backend runs the whole OAuth flow and comes back to /oauth2/redirect.
export const GOOGLE_LOGIN_URL =
  `${import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'}/oauth2/authorization/google`;

const ERROR_MESSAGES = {
  not_registered: 'No tienes una cuenta activa en Prisma. Pide a un administrador que registre tu correo.',
  login_failed: 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.',
};

export const EXPIRED_MESSAGE = 'Tu sesión expiró, vuelve a iniciar sesión.';

export default function LoginPage() {
  const [params] = useSearchParams();
  const [expired] = useState(consumeSessionExpired);
  const error = params.get('error');
  const message = error ? ERROR_MESSAGES[error] ?? ERROR_MESSAGES.login_failed : expired ? EXPIRED_MESSAGE : null;

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: { xs: colors.primary, md: 'background.default' },
      }}
    >
      {/* Brand panel — on mobile it fills the top, the card sits at the bottom */}
      <Box
        component="section"
        sx={{
          flex: { xs: '1 1 auto', md: '1 1 480px' },
          bgcolor: colors.primary,
          color: '#FFFFFF',
          p: { xs: '40px 28px', md: 8 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: { xs: 'flex-end', md: 'space-between' },
          gap: { xs: 2, md: 6 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            right: -160,
            bottom: -160,
            width: 520,
            height: 520,
            borderRadius: '50%',
            border: '80px solid rgba(255,255,255,0.05)',
          }}
        />
        <PrismaLogo size={72} framed />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 520 }}>
          <Typography component="h2" sx={{ fontSize: { xs: 24, md: 40 }, lineHeight: 1.2, fontWeight: 500 }}>
            Cada simulacro, cada alumno, en un solo lugar.
          </Typography>
          <Typography
            sx={{ display: { xs: 'none', md: 'block' }, fontSize: 17, lineHeight: 1.55, color: '#C9D6EA' }}
          >
            Carga resultados desde Excel, sigue la evolución por curso y área, y lleva la bitácora de tutoría sin
            hojas sueltas.
          </Typography>
        </Box>
      </Box>

      {/* Sign-in card */}
      <Box
        component="section"
        sx={{
          flex: { xs: '0 0 auto', md: '1 1 480px' },
          bgcolor: { md: 'background.default' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 0, md: '48px 24px' },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: { md: 420 },
            bgcolor: 'background.paper',
            borderRadius: { xs: '24px 24px 0 0', md: '20px' },
            position: 'relative',
            p: { xs: '32px 24px 40px', md: 5 },
            boxShadow: { md: '0 1px 3px rgba(0,30,70,0.08), 0 12px 32px rgba(0,30,70,0.08)' },
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography component="h1" sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 500 }}>
              Iniciar sesión
            </Typography>
            <Typography sx={{ fontSize: 15, lineHeight: 1.45, color: 'text.secondary' }}>
              Usa la cuenta de Google que la academia registró para ti.
            </Typography>
          </Box>

          <Button
            href={GOOGLE_LOGIN_URL}
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            sx={{ height: 52, fontSize: 15 }}
          >
            Continuar con Google
          </Button>

          {message && (
            <Alert severity={error ? 'error' : 'warning'} sx={{ borderRadius: 3 }}>
              {message}
            </Alert>
          )}

          <Typography sx={{ fontSize: 13, lineHeight: 1.4, color: 'text.secondary' }}>
            ¿No puedes entrar? Pide a un administrador que registre tu correo.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
