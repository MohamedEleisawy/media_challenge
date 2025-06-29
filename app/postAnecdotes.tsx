import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../authContext';

// Composant Checkbox custom
function Checkbox({ label, checked, onChange }) {
  return (
    <TouchableOpacity style={styles.checkboxContainer} onPress={() => onChange(!checked)}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkboxTick}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function PostAnecdoteScreen() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [checks, setChecks] = useState([false, false, false]);
  const { user } = useAuth();

  const handlePost = async () => {
    if (text.trim() === '') {
      Alert.alert('Erreur', 'Le message ne peut pas être vide.');
      return;
    }
    if (checks.includes(false)) {
      Alert.alert('Erreur', 'Merci de cocher toutes les cases.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'anecdotes'), {
        text: text.trim(),
        createdAt: serverTimestamp(),
        author: user?.email || 'Anonyme',
      });
      Alert.alert('Succès', 'Anecdote envoyée !');
      setText('');
      setChecks([false, false, false]);
    } catch (err) {
      Alert.alert('Erreur', "Impossible d'envoyer l'anecdote.");
    } finally {
      setLoading(false);
    }
  };

  const checkboxLabels = [
    "Je m'engage à m'exprimer avec respect, sans insultes ni propos discriminants.",
    "Je m'exprime en mon nom, avec sincérité et responsabilité.",
    "Je reconnais la diversité des vécus et je contribue à un espace d’écoute et de dialogue.",
  ];

  return (
        <View style={styles.screen}>

      <Text style={styles.title}>Raconte-nous ton anecdote !</Text>
      <Text style={styles.subtitle}>Donne le contexte, sois pertinent et surtout : dans le respect !</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email ? user.email[0].toUpperCase() : 'A'}
            </Text>
          </View>
          <TextInput
            style={styles.input}
            multiline
            maxLength={300}
            placeholder="Nouvelle anecdote..."
            value={text}
            onChangeText={setText}
          />
        </View>
        <Text style={styles.counter}>{text.length}/300</Text>
      </View>
      <Text style={styles.sectionTitle}>En partageant mon témoignage,</Text>
      {checkboxLabels.map((label, i) => (
        <Checkbox
          key={i}
          label={label}
          checked={checks[i]}
          onChange={val => setChecks(checks.map((v, idx) => idx === i ? val : v))}
        />
      ))}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePost}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Envoi...' : 'Publier'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontWeight: 'bold', fontSize: 22, marginBottom: 4, color: '#222' },
  subtitle: { color: '#666', marginBottom: 18, fontSize: 14 },
  card: {
    backgroundColor: '#fcfcfc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#ffe6b2', alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: { fontWeight: 'bold', fontSize: 18, color: '#9b6e2c' },
  input: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 12,
    minHeight: 60,
    fontSize: 16,
    color: '#222',
    textAlignVertical: 'top',
  },
  counter: { alignSelf: 'flex-end', color: '#bbb', fontSize: 12, marginTop: 2 },
  sectionTitle: { marginVertical: 12, fontWeight: '600', color: '#7595C7' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 2, borderColor: '#7595C7',
    backgroundColor: '#fff', marginRight: 8, alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#f7b731', borderColor: '#7595C7' },
  checkboxTick: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  checkboxLabel: { color: '#444', fontSize: 14, flex: 1 },
  button: {
    backgroundColor: '#222', borderRadius: 24, marginTop: 24,
    paddingVertical: 14, alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
