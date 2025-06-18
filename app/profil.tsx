import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../authContext';

export default function ProfilScreen() { // Renommé pour éviter les conflits
  const { user } = useAuth();

  if (!user) {
    return <Text>Chargement...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon Profil</Text>
      <Text>Prénom : {user.displayName || 'Non défini'}</Text>
      <Text>Email : {user.email}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  title: { fontSize: 24, marginBottom: 10 },
});
