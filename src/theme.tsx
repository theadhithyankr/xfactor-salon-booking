import { createTheme, alpha, ThemeOptions } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
    palette: {
        mode,
        ...(mode === 'dark' ? {
            // Dark Mode (Current)
            primary: {
                main: '#FF0000',
                light: '#FF4545',
                dark: '#B20000',
                contrastText: '#ffffff',
            },
            secondary: {
                main: '#ffffff',
                dark: '#b0b0b0',
                contrastText: '#000000',
            },
            background: {
                default: '#000000',
                paper: '#121212',
            },
            text: {
                primary: '#ffffff',
                secondary: '#b3b3b3',
            },
            action: {
                hover: alpha('#FF0000', 0.1),
            },
        } : {
            // Light Mode (New)
            primary: {
                main: '#E60000', // Slightly darker red for white bg contrast
                light: '#FF4545',
                dark: '#B20000',
                contrastText: '#ffffff',
            },
            secondary: {
                main: '#000000', // Black for secondary on white
                dark: '#333333',
                contrastText: '#ffffff',
            },
            background: {
                default: '#ffffff',
                paper: '#f8f9fa', // Very light grey
            },
            text: {
                primary: '#1a1a1a',
                secondary: '#666666',
            },
            action: {
                hover: alpha('#E60000', 0.08),
            },
        }),
    },
    typography: {
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        h1: { fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 },
        h2: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.01em' },
        h3: { fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.01em' },
        h4: { fontSize: '1.5rem', fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    padding: '10px 24px',
                    boxShadow: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: mode === 'dark'
                            ? '0 4px 12px rgba(255, 0, 0, 0.4)'
                            : '0 4px 12px rgba(230, 0, 0, 0.25)',
                    },
                },
                containedPrimary: {
                    background: mode === 'dark' ? '#FF0000' : '#E60000',
                    '&:hover': {
                        background: '#D40000',
                    },
                },
                outlinedPrimary: {
                    borderColor: mode === 'dark' ? '#FF0000' : '#E60000',
                    color: mode === 'dark' ? '#FF0000' : '#E60000',
                    '&:hover': {
                        borderColor: '#FF4545',
                        backgroundColor: alpha(mode === 'dark' ? '#FF0000' : '#E60000', 0.1),
                    },
                }
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: '16px',
                    // Adapt card bg for light mode if needed
                    backgroundColor: mode === 'dark' ? '#121212' : '#ffffff',
                },
                elevation1: {
                    boxShadow: mode === 'dark'
                        ? '0px 4px 20px rgba(0, 0, 0, 0.8)'
                        : '0px 4px 20px rgba(0, 0, 0, 0.08)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: mode === 'dark'
                        ? alpha('#000000', 0.8)
                        : alpha('#ffffff', 0.8),
                    backdropFilter: 'blur(12px)',
                    borderBottom: mode === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.05)',
                    color: mode === 'dark' ? '#fff' : '#000', // Ensure text is visible
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: mode === 'dark' ? '#121212' : '#ffffff',
                    border: mode === 'dark' ? '1px solid #333' : '1px solid #e0e0e0',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        borderColor: mode === 'dark' ? '#FF0000' : '#E60000',
                        transform: 'translateY(-4px)',
                        boxShadow: mode === 'dark'
                            ? '0 8px 25px rgba(255, 0, 0, 0.2)'
                            : '0 8px 25px rgba(230, 0, 0, 0.15)',
                    },
                },
            },
        },
    },
});

export const getTheme = (mode: PaletteMode) => createTheme(getDesignTokens(mode));
// Default export for backward compatibility if needed, but we should switch to using getTheme
export default createTheme(getDesignTokens('dark'));
