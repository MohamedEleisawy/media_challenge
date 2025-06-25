import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LoginForm from './login';
import SignupForm from './signup';                                                                                                                                               

export default function LoginChoiceScreen() {
  const [formToShow, setFormToShow] = useState(null);

  return (
    <View style={styles.container}>
      {!formToShow && (
        <>
          <Text style={styles.title}>Bienvenue !</Text>
          <TouchableOpacity style={styles.button} onPress={() => setFormToShow('login')}>
            <Text style={styles.buttonText}>Connexion</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setFormToShow('signup')}>
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
    backgroundColor: '#00235B',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: { color: 'white', textAlign: 'center', fontSize: 16 },
});
