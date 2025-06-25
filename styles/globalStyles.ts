// styles/globalStyles.js
import { StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
  containerButton: {
    fontFamily: 'GreatVibes-Regularr', // Assurez-vous que ce nom est correct
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    alignSelf: 'flex-start',
  },

  TitleWhite: {
    fontFamily: 'GreatVibes-Regularr', // Assurez-vous que ce nom est correct
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },

  TitleBlue: {
    fontFamily: 'GreatVibes-Regularr', // Assurez-vous que ce nom est correct
    color: '#00235B',
    fontSize: 32,
    fontWeight: 'bold',
  },
  containerButtonYellow: {
    backgroundColor: '#FFE066',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerButtonBlue: {
    backgroundColor: '#00235B',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  TitleYellow: {
    fontFamily: 'GreatVibes-Regularr', // Assurez-vous que ce nom est correct
    color: '#00235B',
    fontSize: 32,
    fontWeight: 'bold',
  },
   preferencesTitleContainer: {
    backgroundColor: '#00235B',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  preferencesTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  preferenceButton: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
  },
  preferenceButtonText: {
    fontSize: 16,
    color: '#00235B',
  },
    section: {
    backgroundColor: '#7595C7',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default globalStyles;
