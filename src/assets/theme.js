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
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '@media (max-width: 900px)': {
                        '& .MuiInputBase-root': {
                            fontSize: '0.75rem',
                            height: 36,
                        },
                        '& .MuiInputLabel-root': {
                            fontSize: '0.75rem',
                        },
                    },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    '@media (max-width: 900px)': {
                        fontSize: '0.75rem',
                        height: 36,
                        '& .MuiSelect-select': {
                            padding: '6px 10px',
                        },
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    '@media (max-width: 900px)': {
                        fontSize: '0.75rem',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    '@media (max-width:900px)': {
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                        minHeight: '32px',
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    '@media (max-width:900px)': {
                        fontSize: '0.75rem',
                        padding: '6px 8px',
                    },
                },
                head: {
                    '@media (max-width:900px)': {
                        fontWeight: 'bold',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '@media (max-width:900px)': {
                        height: 'auto', // permite que crezca si hay mucho texto
                    },
                },
            },
        },
    }
});
