import { useTheme } from '@/components/ui/Theme';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LoginForm from './login';
import SignupForm from './signup';

export default function LoginChoiceScreen() {
  const [formToShow, setFormToShow] = useState(null);
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {!formToShow && (
        <>
          <Text style={[styles.title, { color: theme.text }]}>Bienvenue !</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => setFormToShow('login')}>
            <Text style={styles.buttonText}>Connexion</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => setFormToShow('signup')}>
            <Text style={styles.buttonText}>Inscription</Text>
          </TouchableOpacity>
        </>
      )}

      {formToShow === 'login' && <LoginForm />}
      {formToShow === 'signup' && <SignupForm />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  button: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: { color: 'white', textAlign: 'center', fontSize: 16 },
});
