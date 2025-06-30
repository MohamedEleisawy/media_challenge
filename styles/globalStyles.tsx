import { StyleSheet } from 'react-native';
import { useTheme } from '../components/ui/Theme';

export const createGlobalStyles = (theme: any) => StyleSheet.create({
  containerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  TitleBlue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  containerButtonBlue: {
    backgroundColor: '#00235B', // Couleur bleue fixe pour les badges
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 6,
  },
  TitleWhite: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 20,
  },
  section: {
    backgroundColor: '#7595C7', // Couleur bleue pour les sections boutons
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF', // Texte blanc sur fond bleu
    textAlign: 'center',
  },
  flag: {
    color: theme.primary,
  },
});

// Hook pour utiliser les styles globaux avec le thème
export const useGlobalStyles = () => {
  const theme = useTheme();
  return createGlobalStyles(theme);
};

// Export par défaut pour la compatibilité
export default createGlobalStyles;
