import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'sky' | 'gold';

interface ThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Load from localStorage or default to 'sky'
        const saved = localStorage.getItem('lawagent_theme');
        return (saved === 'gold' || saved === 'sky') ? saved : 'sky';
    });

    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        console.log('Theme changed to:', theme, '- data-theme attribute:', document.documentElement.getAttribute('data-theme'));

        // Save to localStorage
        localStorage.setItem('lawagent_theme', theme);

        // Add visual feedback with transition effect
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';

        // Flash effect to make change obvious
        document.body.style.opacity = '0.95';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 150);

        // Cleanup transition after effect
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
