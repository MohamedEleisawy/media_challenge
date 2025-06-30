import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import Toast from 'react-native-toast-message';
import { useRouter, Link } from 'expo-router';
import { useTheme } from '@/components/ui/Theme';

const schema = Yup.object().shape({
  email: Yup.string().email("Email invalide").required("L'email est requis"),
  password: Yup.string().min(6, "Minimum 6 caractères").required("Mot de passe requis"),
});

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      Toast.show({ type: 'success', text1: '✅ Connexion réussie' });
      router.replace('/');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de connexion',
        text2: "Vérifie tes identifiants ou réessaie plus tard.",
      });
    }
  };

  return (
    <View style={[styles.formBlock, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      {/* Email */}
      <Text style={[styles.label, { color: theme.text }]}>Email</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="contrepoint@gmail.com"
            placeholderTextColor={theme.textSecondary}
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { backgroundColor: theme.emojiButton, borderColor: theme.border, color: theme.text }]}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      {/* Mot de passe */}
      <Text style={[styles.label, { color: theme.text }]}>Mot de passe</Text>
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="monmotdepasse"
            placeholderTextColor={theme.textSecondary}
            value={value}
            onChangeText={onChange}
            secureTextEntry
            style={[styles.input, { backgroundColor: theme.emojiButton, borderColor: theme.border, color: theme.text }]}
          />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      {/* Bouton Connexion */}
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>

      {/* Lien mot de passe oublié */}
      <Link href="/forgotPassword" asChild>
        <TouchableOpacity>
          <Text style={[styles.forgotLink, { color: theme.primary }]}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
      </Link>

      {/* Lien inscription */}
      <Text style={[styles.signupText, { color: theme.textSecondary }]}>
        Pas de compte ? <Text style={[styles.signupLink, { color: theme.primary }]}>Inscris-toi maintenant !</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  formBlock: {
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  label: {
    fontSize: 15,
    marginBottom: 4,
    fontFamily: 'Nunito-Bold',
  },
  input: {
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    fontStyle: 'italic',
    fontSize: 15,
    fontFamily: 'Nunito-Regular',
    borderWidth: 1,
  },
  button: {
    borderRadius: 7,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
  },
  forgotLink: {
    textDecorationLine: 'underline',
    fontSize: 14,
    marginTop: 2,
    marginBottom: 2,
    fontFamily: 'Nunito-Regular',
    textAlign: 'left',
  },
  error: {
    color: '#D32F2F',
    fontSize: 13,
    marginBottom: 4,
    fontFamily: 'Nunito-Regular',
  },
  signupText: {
    fontStyle: 'italic',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Nunito-Regular',
  },
  signupLink: {
    textDecorationLine: 'underline',
    fontFamily: 'Nunito-Bold',
  },
});
  
