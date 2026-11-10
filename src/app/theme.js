import { createTheme } from '@mui/material/styles';

// Palette derived from the Prisma logo (same values as v1's colors.js, see
// CLAUDE.md §4.3). Surfaces and text greys come from the Claude Design
// prototype.
export const colors = {
  primary: '#002F6C',
  secondary: '#0059B3',
  success: '#8DC63F',
  warning: '#F7941D',
  error: '#ED1C24',
  danger: '#A3121A', // "Salir" and destructive text, readable on white
  background: '#F4F6FA',
  surface: '#FFFFFF',
  border: '#E3E7EE',
  text: '#1A1C1E',
  textMuted: '#5A6170',
  selected: '#E1EBF7',
};

export const theme = createTheme({
  palette: {
    primary: { main: colors.primary },
    secondary: { main: colors.secondary },
    success: { main: colors.success },
    warning: { main: colors.warning },
    error: { main: colors.error },
    background: { default: colors.background, paper: colors.surface },
    text: { primary: colors.text, secondary: colors.textMuted },
    divider: colors.border,
  },
  typography: {
    fontFamily: 'Roboto, system-ui, sans-serif',
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: { root: { borderRadius: 999 } },
    },
  },
});
