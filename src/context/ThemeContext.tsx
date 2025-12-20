import { createContext, useContext, useState, ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { getTheme } from '../theme';
import { PaletteMode, CssBaseline } from '@mui/material';

interface ThemeContextType {
    mode: PaletteMode;
    toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'dark',
    toggleColorMode: () => { },
});

export const useThemeContext = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
    // 1. Check local storage, default to 'dark'
    const [mode, setMode] = useState<PaletteMode>(() => {
        const savedMode = localStorage.getItem('themeMode');
        return (savedMode === 'light' || savedMode === 'dark') ? savedMode : 'light';
    });

    // 2. Update toggle function
    const toggleColorMode = () => {
        setMode((prevMode) => {
            const newMode = prevMode === 'light' ? 'dark' : 'light';
            localStorage.setItem('themeMode', newMode);
            return newMode;
        });
    };

    // 3. Generate theme
    const theme = getTheme(mode);

    return (
        <ThemeContext.Provider value={{ mode, toggleColorMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};
