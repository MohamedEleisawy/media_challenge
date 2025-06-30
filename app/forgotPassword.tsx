import { useTheme } from '@/components/ui/Theme';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { auth } from '../firebaseConfig';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const theme = useTheme();

  const handleReset = async () => {
    if (!email) {
      Toast.show({
        type: 'info',
        text1: '📧 Email requis',
        text2: 'Merci de renseigner votre email.',
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Toast.show({
        type: 'success',
        text1: '✉️ Lien envoyé',
        text2: 'Vérifie ta boîte mail.',
      });
      router.replace('/'); // retourne à l'accueil après
    } catch (error: any) {
      const message = error?.message || "Erreur inconnue";
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: message,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>🔁 Réinitialiser le mot de passe</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={theme.textSecondary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
      />

      <Button title="Envoyer le lien de réinitialisation" onPress={handleReset} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 8 },
});
