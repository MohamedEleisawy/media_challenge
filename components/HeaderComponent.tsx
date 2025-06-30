import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from './ui/Theme';

const HeaderComponent = () => {
  const theme = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.ligne}>
        <Text style={[styles.headerTextOne, { color: theme.text }]}>Ici, </Text>
        <Text style={[styles.headerText, { color: theme.primary }]}>chaque voix compte.</Text>
      </View>
      <Text style={[styles.subHeaderText, { color: theme.textSecondary }]}>Partage ton ressenti, ton vécu, ton point de vue.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 22,
  },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  headerTextOne: {
    fontSize: 32,
    fontWeight: 'normal',
  },
  subHeaderText: {
    fontSize: 16,
  },
});

export default HeaderComponent;
