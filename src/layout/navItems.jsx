import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

// Grows with each module slice. Sections like "Seguimiento" and
// "Administración" from the prototype come back when they have more items.
// adminOnly items are hidden for other roles (the routes are guarded too).
export const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: <HomeOutlinedIcon /> },
  { to: '/cycles', label: 'Ciclos', icon: <CalendarMonthOutlinedIcon />, adminOnly: true },
  { to: '/catalog', label: 'Catálogo', icon: <MenuBookOutlinedIcon /> },
  { to: '/users', label: 'Usuarios', icon: <ManageAccountsOutlinedIcon />, adminOnly: true },
];

/** The nav item a path belongs to: exact match, or its section (/users/7 → Usuarios). */
export function navItemFor(pathname) {
  return NAV_ITEMS.find((item) => item.to === pathname) ?? NAV_ITEMS.find((item) => item.to !== '/' && pathname.startsWith(`${item.to}/`));
}
