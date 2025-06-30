import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

const lightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  card: '#F5F5F5',
};

const darkTheme = {
  background: '#373737',
  text: '#FFFFFF',
  card: '#2C2C2E',
};

type Theme = typeof lightTheme;
type ThemeContextType = {
  theme: Theme;
  isDarkMode: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within ThemeProvider');
  return context;
};
