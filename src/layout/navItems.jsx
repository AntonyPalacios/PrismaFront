import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

// Grows with each module slice. Sections like "Seguimiento" and
// "Administración" from the prototype come back when they have more items.
// adminOnly items are hidden for other roles (the routes are guarded too);
// items with `roles` only show to users with one of them.
export const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: <HomeOutlinedIcon /> },
  // a tutor (not admin) only gets their own students
  { to: '/students', label: 'Alumnos', tutorLabel: 'Mis alumnos', icon: <PeopleAltOutlinedIcon /> },
  { to: '/exams', label: 'Exámenes', icon: <AssignmentOutlinedIcon /> },
  // the roles that import: students (ADMIN, TUTOR) or exam results (also COORDINADOR)
  { to: '/imports', label: 'Importaciones', icon: <FileUploadOutlinedIcon />, roles: ['ADMIN', 'TUTOR', 'COORDINADOR'] },
  // the group's figures per exam: a tutor's own students, or any group for an admin
  { to: '/group-comparison', label: 'Charla de notas', icon: <InsightsOutlinedIcon />, roles: ['ADMIN', 'TUTOR'] },
  // each student's goal of correct answers per area for a mock exam
  { to: '/goals', label: 'Metas', icon: <FlagOutlinedIcon />, roles: ['ADMIN', 'TUTOR'] },
  { to: '/cycles', label: 'Ciclos', icon: <CalendarMonthOutlinedIcon />, adminOnly: true },
  { to: '/catalog', label: 'Catálogo', icon: <MenuBookOutlinedIcon /> },
  { to: '/users', label: 'Usuarios', icon: <ManageAccountsOutlinedIcon />, adminOnly: true },
];

/** What an item is called for the logged-in user. */
export function itemLabel(item, onlyTutor) {
  return (onlyTutor && item.tutorLabel) || item.label;
}

/** The nav item a path belongs to: exact match, or its section (/users/7 → Usuarios). */
export function navItemFor(pathname) {
  return NAV_ITEMS.find((item) => item.to === pathname) ?? NAV_ITEMS.find((item) => item.to !== '/' && pathname.startsWith(`${item.to}/`));
}
