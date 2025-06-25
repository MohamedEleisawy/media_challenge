import React from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Timestamp, setDoc, doc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

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



// ✅ Validation avec Yup
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

  // 🔧 Fonction à ajouter en haut de ton composant (avant le return)
const getPlaceholder = (field) => {
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>

      {['pseudo', 'email', 'password', 'confirmPassword'].map((field, index) => (
        <View key={index} style={styles.fieldContainer}>
          <Controller
            control={control}
            name={field}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  placeholder={getPlaceholder(field)}
                  secureTextEntry={field.toLowerCase().includes('password')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={[
                    styles.input,
                    errors[field] ? { borderColor: 'red' } : null,
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


      <Button title="S'inscrire" onPress={handleSubmit(onSubmit)} disabled={isSubmitting} />

      {/* 🔗 Lien vers la connexion */}
      <TouchableOpacity onPress={() => router.push('/login')} style={styles.link}>
        <Text>Deja inscrit ?</Text>
        <Text style={styles.linkText}>Se connecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
  },
  error: {
    color: 'red',
    marginTop: 4,
  },
  link: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});
