import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { db } from '../firebaseConfig';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Toast from 'react-native-toast-message';

export default function PostPollScreen() {
  const [sondage, setSondage] = useState('');
  const [checks, setChecks] = useState([false, false, false]);
  const [choice, setChoice] = useState(null);

  const checkboxLabels = [
    "Je m'engage à m'exprimer avec respect, sans insultes ni propos discriminants.",
    "Je m'exprime en mon nom, avec sincérité et responsabilité.",
    "Je reconnais la diversité des vécus et je contribue à un espace d’écoute et de dialogue.",
  ];

  const handlePublish = async () => {
    if (checks.includes(false)) {
      Toast.show({
        type: 'error',
        text1: 'Cases non cochées',
        text2: 'Merci de cocher toutes les cases avant de publier.',
      });
      return;
    }

    if (sondage.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Le sondage ne peut pas être vide.',
      });
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      await addDoc(collection(db, 'polls'), {
        authorId: user?.uid || 'anonymous',
        question: sondage.trim(),
        options: [
          { id: '1', text: 'Oui', votes: 0 },
          { id: '2', text: 'Non', votes: 0 },
        ],
        voters: [],
        createdAt: serverTimestamp(),
      });

      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: 'Sondage publié !',
      });

      setSondage('');
      setChecks([false, false, false]);
      setChoice(null);
    } catch (error) {
      console.error('Erreur Firestore:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: "Le sondage n'a pas pu être publié.",
      });
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>Fais un sondage !</Text>
      <Text style={styles.subHeader}>Sois concis et surtout reste dans le respect de tous !</Text>
      <View style={styles.card}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Pose ta question..."
            value={sondage}
            maxLength={140}
            onChangeText={setSondage}
          />
        </View>
        <Text style={styles.counter}>{sondage.length}/140</Text>
        <View style={styles.choicesRow}>
          <TouchableOpacity
            style={[
              styles.choiceBtn,
              choice === 'oui' && styles.choiceBtnActive,
            ]}
            onPress={() => setChoice('oui')}
          >
            <Text style={[
              styles.choiceText,
              choice === 'oui' && styles.choiceTextActive,
            ]}>Oui…</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.choiceBtn,
              choice === 'non' && styles.choiceBtnActive,
            ]}
            onPress={() => setChoice('non')}
          >
            <Text style={[
              styles.choiceText,
              choice === 'non' && styles.choiceTextActive,
            ]}>Non…</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.sectionTitle}>En partageant mon témoignage,</Text>
      {checkboxLabels.map((label, i) => (
        <TouchableOpacity
          key={i}
          style={styles.checkboxContainer}
          onPress={() => {
            const updated = [...checks];
            updated[i] = !updated[i];
            setChecks(updated);
          }}
        >
          <View style={[styles.checkbox, checks[i] && styles.checkboxChecked]}>
            {checks[i] && <Text style={styles.checkboxTick}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>{label}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[
          styles.publishButton,
          (sondage.trim() === '' || checks.includes(false)) && styles.buttonDisabled,
        ]}
        onPress={handlePublish}
        disabled={sondage.trim() === '' || checks.includes(false)}
      >
        <Text style={styles.buttonText}>Publier</Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFBEA', padding: 20 },
  header: { fontWeight: 'bold', fontSize: 26, marginBottom: 4, color: '#00235B', textAlign: 'center' },
  subHeader: { color: '#666', marginBottom: 18, fontSize: 15, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#ffe6b2', alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontWeight: 'bold', fontSize: 18, color: '#9b6e2c' },
  input: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 12,
    minHeight: 40,
    fontSize: 16,
    color: '#222',
    textAlignVertical: 'top',
  },
  counter: { alignSelf: 'flex-end', color: '#bbb', fontSize: 12, marginTop: 2 },
  choicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 2,
  },
  choiceBtn: {
    flex: 1,
    backgroundColor: '#e6f0fa',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#e6f0fa',
  },
  choiceBtnActive: {
    backgroundColor: '#00235B',
    borderColor: '#00235B',
  },
  choiceText: {
    color: '#00235B',
    fontWeight: 'bold',
    fontSize: 16,
  },
  choiceTextActive: {
    color: '#fff',
  },
  sectionTitle: { marginVertical: 12, fontWeight: '600', color: '#7595C7' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 2, borderColor: '#7595C7',
    backgroundColor: '#fff', marginRight: 8, alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#7595C7', borderColor: '#7595C7' },
  checkboxTick: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  checkboxLabel: { color: '#7595C7', fontSize: 14, flex: 1 },
  publishButton: {
    backgroundColor: '#00235B', borderRadius: 24, marginTop: 24,
    paddingVertical: 14, alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
