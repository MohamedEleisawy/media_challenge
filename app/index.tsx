// app/index.tsx
import { StyleSheet, View, Text, Button } from 'react-native';
import { Link } from 'expo-router';
export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={styles.title}>Bienvenue sur mon app !</Text>
      <Text style={styles.subtitle}>Bienvenue sur mon app !</Text>
      <Link href="/signup" asChild>
        <Button   title="Créer un compte" />
      </Link>
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
    fontFamily: 'SpaceMono-Regular',
    // fontFamily: 'Nunito-Bold',
    fontSize: 24,
  },
});