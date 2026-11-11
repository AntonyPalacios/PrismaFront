import { NavLink, useNavigate } from 'react-router';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/Logout';
import { colors } from '../app/theme';
import { ROLE_LABELS, displayName, initials, useGetMeQuery, useIsAdmin, useLogoutMutation } from '../users/api/authApi';
import { NAV_ITEMS } from './navItems';
import PrismaLogo from './PrismaLogo';

const itemSx = {
  height: 44,
  borderRadius: 999,
  px: 1.75,
  gap: 1.75,
  '& .MuiListItemIcon-root': { minWidth: 0, color: 'inherit' },
  '& .MuiListItemText-primary': { fontSize: 14, fontWeight: 500 },
  '&.active': { bgcolor: colors.selected, color: colors.primary },
};

export default function NavContent({ onNavigate }) {
  const { data: me } = useGetMeQuery();
  const isAdmin = useIsAdmin();
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      // replace: the back button must not return to a private page
      navigate('/login', { replace: true });
    }
  };

  const roles = (me?.roles ?? []).map((r) => ROLE_LABELS[r] ?? r).join(' · ');

  return (
    <Box component="nav" aria-label="Menú principal" sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: '20px 12px' }}>
      <Box sx={{ px: 1.25, pb: 2 }}>
        <PrismaLogo size={44} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, mb: 1, borderRadius: 3.5, bgcolor: 'background.default' }}>
        <Avatar
          src={me?.photoUrl ?? undefined}
          alt=""
          slotProps={{ img: { referrerPolicy: 'no-referrer' } }}
          sx={{ width: 36, height: 36, bgcolor: colors.secondary, fontSize: 13, fontWeight: 500 }}
        >
          {initials(me)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ fontSize: 14, fontWeight: 500 }}>
            {displayName(me)}
          </Typography>
          <Typography noWrap sx={{ fontSize: 12, color: 'text.secondary' }}>
            {roles}
          </Typography>
        </Box>
      </Box>

      <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        {NAV_ITEMS.filter((item) => isAdmin || !item.adminOnly).map((item) => (
          <ListItemButton key={item.to} component={NavLink} to={item.to} end={item.to === '/'} onClick={onNavigate} sx={itemSx}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: 'auto', pt: 1, borderTop: 1, borderColor: 'divider' }}>
        <ListItemButton onClick={handleLogout} disabled={loggingOut} sx={{ ...itemSx, color: colors.danger }}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Salir" />
        </ListItemButton>
      </Box>
    </Box>
  );
}
