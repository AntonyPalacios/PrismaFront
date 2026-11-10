import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

// Grows with each module slice. Sections like "Seguimiento" and
// "Administración" from the prototype come back when they have more items.
export const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: <HomeOutlinedIcon /> },
  { to: '/catalog', label: 'Catálogo', icon: <MenuBookOutlinedIcon /> },
];
