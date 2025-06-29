import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../authContext';
import { db } from '../firebaseConfig';

// Composant personnalisé pour les cases à cocher avec état
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
  // Navigation et gestion d'état
  const router = useRouter();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [checks, setChecks] = useState([false, false, false]); // État des cases à cocher
  const { user } = useAuth(); // Récupération de l'utilisateur connecté

  // Fonction de publication d'anecdote avec validations
  const handlePost = async () => {
    // Vérification de l'authentification
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Connexion requise',
        text2: 'Vous devez être connecté pour publier une anecdote.',
      });
      return;
    }
    
    // Validation du contenu
    if (text.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Le message ne peut pas être vide.',
      });
      return;
    }
    
    // Vérification de l'acceptation des conditions
    if (checks.includes(false)) {
      Toast.show({
        type: 'error',
        text1: 'Cases non cochées',
        text2: 'Merci de cocher toutes les cases avant de publier.',
      });
      return;
    }
    
    setLoading(true);
    try {
      // Sauvegarde de l'anecdote dans Firestore
      await addDoc(collection(db, 'anecdotes'), {
        text: text.trim(),
        createdAt: serverTimestamp(), // Timestamp côté serveur
        authorId: user.uid, // Association avec l'utilisateur
      });
      
      // Notification de succès
      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: 'Anecdote envoyée !',
      });
      
      // Réinitialisation du formulaire
      setText('');
      setChecks([false, false, false]);
      
      // Redirection différée pour laisser le toast s'afficher
      setTimeout(() => {
        router.push('/');
      }, 1200);
    } catch (error) {
      // Gestion des erreurs de publication
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: "Impossible d'envoyer l'anecdote.",
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Définition des textes des conditions d'utilisation
  const checkboxLabels = [
    "Je m'engage à m'exprimer avec respect, sans insultes ni propos discriminants.",
    "Je m'exprime en mon nom, avec sincérité et responsabilité.",
    "Je reconnais la diversité des vécus et je contribue à un espace d'écoute et de dialogue.",
  ];

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Raconte-nous ton anecdote !</Text>
      <Text style={styles.subtitle}>Donne le contexte, sois pertinent et surtout : dans le respect !</Text>
      
      {/* Carte de saisie avec avatar et compteur de caractères */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {/* Affichage de la première lettre de l'email ou A par défaut */}
              {user?.email ? user.email[0].toUpperCase() : 'A'}
            </Text>
          </View>
          <TextInput
            style={styles.input}
            multiline
            maxLength={300} // Limitation de caractères
            placeholder="Nouvelle anecdote..."
            value={text}
            onChangeText={setText}
          />
        </View>
        {/* Compteur de caractères en temps réel */}
        <Text style={styles.counter}>{text.length}/300</Text>
      </View>
      
      {/* Section des conditions d'utilisation */}
      <Text style={styles.sectionTitle}>En partageant mon témoignage,</Text>
      {checkboxLabels.map((label, i) => (
        <Checkbox
          key={i}
          label={label}
          checked={checks[i]}
          // Mise à jour de l'état des cases à cocher
          onChange={val => setChecks(checks.map((v, idx) => idx === i ? val : v))}
        />
      ))}
      
      {/* Bouton de publication avec états conditionnels */}
      <TouchableOpacity
        style={[
          styles.button,
          // Désactivation visuelle si conditions non remplies
          (loading || !user) && styles.buttonDisabled
        ]}
        onPress={handlePost}
        disabled={loading || !user}
      >
        <Text style={styles.buttonText}>
          {/* Texte dynamique selon l'état */}
          {loading ? 'Envoi...' : user ? 'Publier' : 'Connexion requise'}
        </Text>
      </TouchableOpacity>
      
      {/* Composant Toast pour les notifications */}
      <Toast />
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
  checkboxChecked: { backgroundColor: '#7595C7', borderColor: '#7595C7' },
  checkboxTick: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  checkboxLabel: { color: '#7595C7', fontSize: 14, flex: 1 },
  button: {
    backgroundColor: '#222', borderRadius: 24, marginTop: 24,
    paddingVertical: 14, alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
