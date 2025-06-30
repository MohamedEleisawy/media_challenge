import { useTheme } from '@/components/ui/Theme';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Timestamp, doc, setDoc } from 'firebase/firestore';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';
import { auth, db } from '../firebaseConfig';

// 🔧 Gestion des erreurs Firebase
function getFirebaseAuthErrorMessage(errorCode: string) {
  switch (errorCode) {
    case 'auth/invalid-email':
      return "L'adresse email n'est pas valide.";
    case 'auth/email-already-in-use':
      return "Cette adresse email est déjà utilisée.";
    case 'auth/weak-password':
      return "Le mot de passe est trop faible (minimum 6 caractères).";
    default:
      return "Une erreur est survenue. Veuillez réessayer.";
  }
}

const schema = yup.object({
  email: yup.string().email('Email invalide').required('Email est obligatoire'),
  pseudo: yup.string().required('Le pseudo est obligatoire'),
  password: yup.string().min(6, 'Minimum 6 caractères').required('Mot de passe obligatoire'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Les mots de passe doivent correspondre')
    .required('Confirmation obligatoire'),
});

export default function Signup() {
  const router = useRouter();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        pseudo: data.pseudo,
        email: data.email,
        role: 'user',
        createdAt: Timestamp.fromDate(new Date()),
      });

      Toast.show({
        type: 'success',
        text1: '✅ Inscription réussie',
      });

      router.replace('/');
    } catch (error: any) {
      const message = getFirebaseAuthErrorMessage(error.code || '');
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: message,
      });
    }
  };

  const getPlaceholder = (field: string) => {
    switch (field) {
      case 'pseudo':
        return 'Pseudo';
      case 'email':
        return 'Adresse email';
      case 'password':
        return 'Mot de passe';
      case 'confirmPassword':
        return 'Confirmer le mot de passe';
      default:
        return '';
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]} keyboardShouldPersistTaps="handled">
      <Text style={[styles.title, { color: theme.text }]}>Créer un compte</Text>
      <View style={[styles.formBlock, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        {['pseudo', 'email', 'password', 'confirmPassword'].map((field, index) => (
          <View key={index} style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.text }]}>
              {field === 'pseudo'
                ? 'Pseudo'
                : field === 'email'
                ? 'Email'
                : field === 'password'
                ? 'Mot de passe'
                : 'Confirmer le mot de passe'}
            </Text>
            <Controller
              control={control}
              name={field}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    placeholder={getPlaceholder(field)}
                    placeholderTextColor={theme.textSecondary}
                    secureTextEntry={field.toLowerCase().includes('password')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={[
                      styles.input,
                      { backgroundColor: theme.emojiButton, borderColor: theme.border, color: theme.text },
                      errors[field] ? { borderColor: '#D32F2F' } : null,
                    ]}
                  />
                  {errors[field] && (
                    <Text style={styles.error}>{errors[field]?.message}</Text>
                  )}
                </>
              )}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>S'inscrire</Text>
        </TouchableOpacity>

        {/* Lien connexion */}
        <TouchableOpacity onPress={() => router.push('/login')} style={styles.link}>
          <Text style={[styles.signupText, { color: theme.textSecondary }]}>
            Déjà inscrit ? <Text style={[styles.signupLink, { color: theme.primary }]}>Se connecter</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 36,
    paddingHorizontal: 0,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 22,
    fontFamily: 'Nunito-Bold',
  },
  formBlock: {
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 22,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  fieldContainer: {
    marginBottom: 12,
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
    marginBottom: 2,
    fontStyle: 'italic',
    fontSize: 15,
    fontFamily: 'Nunito-Regular',
    borderWidth: 1,
  },
  button: {
    borderRadius: 7,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
  },
  error: {
    color: '#D32F2F',
    fontSize: 13,
    marginBottom: 4,
    fontFamily: 'Nunito-Regular',
  },
  link: {
    alignItems: 'center',
    marginTop: 8,
  },
  signupText: {
    fontStyle: 'italic',
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'Nunito-Regular',
  },
  signupLink: {
    textDecorationLine: 'underline',
    fontFamily: 'Nunito-Bold',
  },
});
  
