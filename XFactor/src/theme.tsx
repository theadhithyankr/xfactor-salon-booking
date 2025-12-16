import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#FF0000', // Bold Red
            light: '#FF4545',
            dark: '#B20000',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#ffffff', // White
            dark: '#b0b0b0',
            contrastText: '#000000',
        },
        background: {
            default: '#000000', // Pure Black
            paper: '#121212', // Slightly lighter black/grey
        },
        text: {
            primary: '#ffffff',
            secondary: '#b3b3b3',
        },
        action: {
            hover: alpha('#FF0000', 0.1),
        },
    },
    typography: {
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        h1: {
            fontSize: '3.5rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
        },
        h2: {
            fontSize: '2.5rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h3: {
            fontSize: '2rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
        },
    },
    shape: {
        borderRadius: 0, // Sharper edges for a bolder Red/Black look? Or keep rounded? Let's keep 4px for slight softness or 0 for sleek. Let's go with 4.
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '4px', // Geometric feel
                    padding: '10px 24px',
                    boxShadow: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(255, 0, 0, 0.4)', // Red glow
                    },
                },
                containedPrimary: {
                    background: '#FF0000', // Solid Red
                    '&:hover': {
                        background: '#D40000',
                    },
                },
                outlinedPrimary: {
                    borderColor: '#FF0000',
                    color: '#FF0000',
                    '&:hover': {
                        borderColor: '#FF4545',
                        backgroundColor: alpha('#FF0000', 0.1),
                    },
                }
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.8)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: alpha('#000000', 0.8), // Black glass
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: '#121212',
                    border: '1px solid #333',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        borderColor: '#FF0000',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(255, 0, 0, 0.2)',
                    },
                },
            },
        },
    },
});

export default theme;
