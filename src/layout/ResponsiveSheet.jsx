import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

/**
 * Container for every form in the app: bottom sheet on mobile (as the
 * prototype's "Nueva carrera" in CareersMobile), centered dialog on desktop.
 */
export default function ResponsiveSheet({ onClose, children, maxWidth = 'sm' }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  if (isDesktop) {
    return (
      <Dialog open onClose={onClose} fullWidth maxWidth={maxWidth} slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
        {children}
      </Dialog>
    );
  }
  return (
    <Drawer
      anchor="bottom"
      open
      onClose={onClose}
      slotProps={{ paper: { sx: { borderRadius: '24px 24px 0 0', maxHeight: '92dvh' } } }}
    >
      <Box aria-hidden="true" sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: '#C5CCD8', mx: 'auto', mt: 1.25 }} />
      {children}
    </Drawer>
  );
}
