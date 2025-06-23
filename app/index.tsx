// app/index.tsx
import { StyleSheet, View, Text } from 'react-native';


export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Bienvenue sur mon app !</Text>
      <Text style={styles.title}>Bienvenue sur mon app !</Text>
      <Text style={styles.subtitle}>Bienvenue sur mon app !</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    // fontFamily: 'Nunito-Bold',
    fontFamily: 'SpaceMono-Regular',
    fontSize: 24,
  },
  subtitle: {
    fontFamily: '',
    // fontFamily: 'Nunito-Bold',
    fontSize: 24,
  },
});