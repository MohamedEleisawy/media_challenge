import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import Toast from 'react-native-toast-message';
import { useRouter, Link } from 'expo-router';

// 🔧 Fonction d'erreurs Firebase
function getFirebaseAuthErrorMessage(errorCode: string) {
  switch (errorCode) {
    case 'auth/invalid-email':
      return "L'adresse email n'est pas valide.";
    case 'auth/user-disabled':
      return "Ce compte a été désactivé.";
    case 'auth/user-not-found':
      return "Aucun utilisateur trouvé avec cet email.";
    case 'auth/wrong-password':
      return "Mot de passe incorrect.";
    case 'auth/too-many-requests':
      return "Trop de tentatives. Réessayez plus tard.";
    default:
      return "Une erreur est survenue. Veuillez réessayer.";
  }
}

// ✅ Schéma de validation
const schema = Yup.object().shape({
  email: Yup.string().email("Email invalide").required("L'email est requis"),
  password: Yup.string().min(6, "Minimum 6 caractères").required("Mot de passe requis"),
});

export default function LoginScreen() {
  const router = useRouter();

  const { control, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      Toast.show({
        type: 'success',
        text1: '✅ Connexion réussie',
      });
      router.replace('/');
    } catch (error: any) {
      const message = getFirebaseAuthErrorMessage(error.code || '');
      Toast.show({
        type: 'error',
        text1: 'Erreur de connexion',
        text2: message,
      });
    }
  };

  const handleResetPassword = async () => {
    const email = getValues("email");

    if (!email) {
      Toast.show({
        type: 'info',
        text1: '📧 Entrez votre email pour réinitialiser.',
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Toast.show({
        type: 'success',
        text1: '🔁 Email de réinitialisation envoyé',
      });
    } catch (error: any) {
      const message = getFirebaseAuthErrorMessage(error.code || '');
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: message,
      });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    Toast.show({
      type: 'info',
      text1: '👋 Déconnecté avec succès',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      {/* Email */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Email"
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      {/* Password */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Mot de passe"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            style={styles.input}
          />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <Button title="Se connecter" onPress={handleSubmit(onSubmit)} />

      {/* 🔁 Mot de passe oublié */}
      <TouchableOpacity onPress={handleResetPassword} style={styles.link}>
        <Text style={styles.linkText}>🔁 Mot de passe oublié ?</Text>
      </TouchableOpacity>

      {/* ➕ Lien vers l'inscription */}
      <View style={styles.signupContainer}>
        <Text>Pas encore de compte ?</Text>
        <Link href="/signup" asChild>
          <Text style={styles.linkText}>S'inscrire</Text>
        </Link>
      </View>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  input: { borderBottomWidth: 1, marginBottom: 10, padding: 8 },
  error: { color: 'red', marginBottom: 8 },
  link: { marginTop: 15, alignItems: 'center' },
  linkText: { color: '#007bff', marginTop: 5 },
  signupContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
