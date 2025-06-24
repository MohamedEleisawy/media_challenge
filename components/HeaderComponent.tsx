import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HeaderComponent = () => {
  return (
    <View style={styles.header}>
      <View style={styles.ligne}>
        <Text style={styles.headerTextOne}>Ici, </Text>
        <Text style={styles.headerText}>chaque voix compte.</Text>
      </View>
      <Text style={styles.subHeaderText}>Partage ton ressenti, ton vécu, ton point de vue.</Text>
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
    color: '#202C53',
  },
  headerTextOne: {
    fontSize: 32,
    fontWeight: 'normal',
    color: '#202C53',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
  },
});

export default HeaderComponent;
