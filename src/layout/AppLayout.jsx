import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import NavContent from './NavContent';
import { NAV_ITEMS } from './navItems';

const DESKTOP_WIDTH = 264;
const MOBILE_WIDTH = 312;

/**
 * Shell of every private page (Claude Design: StudentsDesktop / NavDrawerMobile).
 * Desktop (md+): permanent white drawer on the left.
 * Mobile: blue top bar with a hamburger that opens a temporary drawer.
 */
export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const title = NAV_ITEMS.find((item) => item.to === pathname)?.label ?? 'Prisma';

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" elevation={0} sx={{ display: { md: 'none' } }}>
        <Toolbar sx={{ minHeight: 56, px: 1, gap: 1 }}>
          <IconButton color="inherit" aria-label="Abrir menú" onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography component="span" sx={{ fontSize: 18, fontWeight: 500 }}>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { md: 'none' } }}
        slotProps={{
          paper: { sx: { width: MOBILE_WIDTH, borderRadius: '0 20px 20px 0' } },
        }}
      >
        <NavContent onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' }, width: DESKTOP_WIDTH, flexShrink: 0 }}
        slotProps={{ paper: { sx: { width: DESKTOP_WIDTH, borderRight: 1, borderColor: 'divider' } } }}
      >
        <NavContent />
      </Drawer>

      <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: '32px 40px' }, mt: { xs: 7, md: 0 } }}>
        <Outlet />
      </Box>
    </Box>
  );
}
