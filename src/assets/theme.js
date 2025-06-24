import { createTheme } from '@mui/material/styles';
import colors from './colors';

export default createTheme({
    palette: {
        primary: {
            main: colors.primary,
        },
        secondary: {
            main: colors.secondary,
        },
        success: {
            main: colors.success,
        },
        warning: {
            main: colors.warning,
        },
        error: {
            main: colors.error,
        },
        text: {
            primary: colors.textPrimary,
            secondary: colors.textSecondary
        }
    },
});
