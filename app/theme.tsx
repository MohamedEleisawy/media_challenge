// theme.tsx
import { useColorScheme } from 'react-native';

export const lightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  card: '#F5F5F5',
  primary: '#3B82F6',
  secondary: '#60A5FA',
};

export const darkTheme = {
  background: '#1C1C1E',
  text: '#FFFFFF',
  card: '#2C2C2E',
  primary: '#2563EB',
  secondary: '#60A5FA',
};

// Hook personnalisé
export const useTheme = () => {
  const colorScheme = useColorScheme(); // "light" ou "dark"
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};
