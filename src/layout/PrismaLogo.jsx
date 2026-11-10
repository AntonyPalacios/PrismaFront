import Box from '@mui/material/Box';
import logo from '../assets/logo-prisma.jpg';

/**
 * The real Prisma logo (the prototype used a provisional SVG). The image
 * already contains the name, so no extra "PRISMA" text is added. `framed`
 * puts it on a white tile for dark backgrounds (the login brand panel).
 */
export default function PrismaLogo({ size = 40, framed = false }) {
  const img = (
    <Box component="img" src={logo} alt="Prisma" sx={{ width: size, height: size, display: 'block' }} />
  );
  if (!framed) return img;
  return (
    <Box sx={{ alignSelf: 'flex-start', bgcolor: '#FFFFFF', borderRadius: 3, p: 1, lineHeight: 0 }}>{img}</Box>
  );
}
