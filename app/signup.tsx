import React from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';
import Toast from 'react-native-root-toast'; // <-- import Toast cross-platform
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
// import { authStyles } from './styles/auth.styles';


const schema = yup.object({
  prenom: yup.string().required('Le prénom est obligatoire'),
  nom: yup.string().required('Le nom est obligatoire'),
  email: yup.string().email('Email invalide').required('Email est obligatoire'),
  password: yup.string().min(6, 'Minimum 6 caractères').required('Mot de passe obligatoire'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Les mots de passe doivent correspondre')
    .required('Confirmation obligatoire'),
});

export default function Signup() {
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

      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        createdAt: Timestamp.fromDate(new Date()),
      });

      Toast.show('Inscription réussie !', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    } catch (error: any) {
      Toast.show(`Erreur : ${error.message}`, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    }
  };

  return (
    <ScrollView >
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Créer un compte</Text>

      {['prenom', 'nom', 'email', 'password', 'confirmPassword'].map((field, index) => (
        <View key={index}>
          <Controller
            control={control}
            name={field}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder={
                  field === 'confirmPassword'
                    ? 'Confirmer le mot de passe'
                    : field.charAt(0).toUpperCase() + field.slice(1)
                }
                secureTextEntry={field.toLowerCase().includes('password')}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>
      ))}

      <Button title="S'inscrire" onPress={handleSubmit(onSubmit)} disabled={isSubmitting} />
    </ScrollView>
  );
}
