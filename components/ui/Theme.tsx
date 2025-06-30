import { useColorScheme } from 'react-native';

export const lightTheme = {
  background: '#FFFFFF',
  cardBackground: '#F5F5F5',
  text: '#000000',
  textSecondary: '#666666',
  primary: '#7595C7', // Bleu des boutons comme dans la capture
  primaryLight: '#7595C7',
  accent: '#F9C846',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  border: '#E0E0E0',
  shadow: '#000000',
  anecdoteCard: 'rgba(254, 242, 186, 0.34)',
  pollCard: '#FDF9ED',
  buttonPrimary: '#7595C7', // Couleur des boutons comme dans la capture
  buttonSecondary: '#7595C7',
  emojiButton: '#E5ECFA',
  navbar: '#FFFFFF',
  footer: '#00235B',
};

export const darkTheme = {
  background: '#000000', // Fond noir comme dans la capture
  cardBackground: '#1A1A1A', // Cartes gris très foncé
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  primary: '#4A90E2', // Bleu adapté pour le dark mode
  primaryLight: '#6BB6FF',
  accent: '#FFD700',
  success: '#66BB6A',
  error: '#FF5252',
  warning: '#FFA726',
  border: '#333333',
  shadow: '#000000',
  anecdoteCard: '#1A1A1A', // Cartes sombres pour anecdotes
  pollCard: '#1A1A1A', // Cartes sombres pour sondages
  buttonPrimary: '#4A90E2',
  buttonSecondary: '#6BB6FF',
  emojiButton: '#2A2A2A',
  navbar: '#000000', // Navbar noire
  footer: '#000000', // Footer noir
};

// Hook personnalisé
export const useTheme = () => {
  const colorScheme = useColorScheme(); // "light" ou "dark"
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};

// Hook pour vérifier si on est en mode sombre
export const useIsDarkMode = () => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark';
};