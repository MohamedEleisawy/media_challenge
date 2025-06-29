import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { auth } from '../firebaseConfig';

// 🔧 Fonction de gestion des erreurs Firebase spécifiques à la connexion
function getFirebaseAuthErrorMessage(errorCode: string) {
  switch (errorCode) {
    case 'auth/invalid-email':
      return "L'adresse email est invalide.";
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

// ✅ Schéma de validation pour les champs de connexion
const schema = Yup.object().shape({
  email: Yup.string().email("Email invalide").required("L'email est requis"),
  password: Yup.string().min(6, "Minimum 6 caractères").required("Mot de passe requis"),
});

export default function LoginScreen() {
  const router = useRouter();

  // Configuration du formulaire avec validation
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Fonction de traitement de la connexion
  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      // Authentification avec Firebase Auth
      await signInWithEmailAndPassword(auth, data.email, data.password);
      
      // Notification de succès
      Toast.show({
        type: 'success',
        text1: '✅ Connexion réussie',
      });
      
      // Redirection vers la page d'accueil après connexion
      router.replace('/');
    } catch (error: any) {
      // Gestion des erreurs avec messages personnalisés
      const message = getFirebaseAuthErrorMessage(error.code || '');
      Toast.show({
        type: 'error',
        text1: 'Erreur de connexion',
        text2: message,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      {/* Champ Email avec validation */}
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

      {/* Champ Mot de passe avec validation */}
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

      {/* Bouton de connexion */}
      <Button title="Se connecter" onPress={handleSubmit(onSubmit)} />

      {/* Liens utiles : mot de passe oublié et inscription */}
      <Link href="/forgotPassword" asChild>
        <TouchableOpacity style={styles.link}>
          <Text style={styles.linkText}>🔁 Mot de passe oublié ?</Text>
        </TouchableOpacity>
      </Link>

      <View style={styles.signupContainer}>
        <Text>Pas de compte ?</Text>
        <Link href="/signup" asChild>
          <Text style={styles.linkText}>Inscris-toi maintenant !</Text>
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
  signupContainer: { marginTop: 20, alignItems: 'center' },
});
