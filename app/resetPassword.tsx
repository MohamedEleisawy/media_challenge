import { useTheme } from '@/components/ui/Theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { confirmPasswordReset } from 'firebase/auth';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { auth } from '../firebaseConfig';

export default function ResetPasswordScreen() {
  const { oobCode } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password) {
      Toast.show({
        type: 'info',
        text1: '⚠️ Veuillez saisir un nouveau mot de passe',
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: 'info',
        text1: '⚠️ Le mot de passe doit contenir au moins 6 caractères',
      });
      return;
    }

    if (!oobCode) {
      Toast.show({
        type: 'error',
        text1: 'Code de réinitialisation invalide ou manquant',
      });
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      Toast.show({
        type: 'success',
        text1: '✅ Mot de passe réinitialisé avec succès',
      });
      router.replace('/login');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur lors de la réinitialisation',
        text2: error.message || 'Veuillez réessayer plus tard',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Réinitialiser le mot de passe</Text>

      <TextInput
        placeholder="Nouveau mot de passe"
        placeholderTextColor={theme.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
      />

      <Button
        title={loading ? "Chargement..." : "Valider"}
        onPress={handleResetPassword}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, marginBottom: 20, fontWeight: 'bold', textAlign: 'center' },
  input: { borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 5 },
});
