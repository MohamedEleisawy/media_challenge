import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../authContext';

export default function PostsScreen() {
  const [postType, setPostType] = useState<'anecdote' | 'poll'>('anecdote');

  // Pour anecdote
  const [text, setText] = useState('');

  // Pour sondage
  const [question, setQuestion] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');

  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const handlePost = async () => {
    setLoading(true);

    try {
      if (postType === 'anecdote') {
        if (text.trim() === '') {
          Alert.alert('Erreur', 'Le message ne peut pas être vide.');
          setLoading(false);
          return;
        }
        await addDoc(collection(db, 'anecdotes'), {
          text: text.trim(),
          createdAt: serverTimestamp(),
          author: user?.email || 'Anonyme',
        });
        Alert.alert('Succès', 'Anecdote envoyée !');
        setText('');
      } else if (postType === 'poll') {
        if (
          question.trim() === '' ||
          option1.trim() === '' ||
          option2.trim() === ''
        ) {
          Alert.alert('Erreur', 'Merci de remplir la question et les deux options.');
          setLoading(false);
          return;
        }
        await addDoc(collection(db, 'polls'), {
          question: question.trim(),
          options: [
            { id: '1', text: option1.trim(), votes: 0 },
            { id: '2', text: option2.trim(), votes: 0 },
          ],
          createdAt: serverTimestamp(),
          author: user?.email || 'Anonyme',
        });
        Alert.alert('Succès', 'Sondage créé !');
        setQuestion('');
        setOption1('');
        setOption2('');
      }
    } catch (err) {
      console.error('Erreur Firestore:', err);
      Alert.alert('Erreur', "Impossible d'envoyer le contenu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Choix du type de post */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            postType === 'anecdote' && styles.toggleButtonActive,
          ]}
          onPress={() => setPostType('anecdote')}
        >
          <Text
            style={[
              styles.toggleText,
              postType === 'anecdote' && styles.toggleTextActive,
            ]}
          >
            Anecdote
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            postType === 'poll' && styles.toggleButtonActive,
          ]}
          onPress={() => setPostType('poll')}
        >
          <Text
            style={[
              styles.toggleText,
              postType === 'poll' && styles.toggleTextActive,
            ]}
          >
            Sondage
          </Text>
        </TouchableOpacity>
      </View>

      {postType === 'anecdote' ? (
        <>
          <Text style={styles.label}>Ton témoignage :</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Écris ici ton anecdote..."
            value={text}
            onChangeText={setText}
          />
        </>
      ) : (
        <>
          <Text style={styles.label}>Question du sondage :</Text>
          <TextInput
            style={styles.input}
            placeholder="Écris ta question..."
            value={question}
            onChangeText={setQuestion}
          />

          <Text style={styles.label}>Option 1 :</Text>
          <TextInput
            style={styles.input}
            placeholder="Première proposition"
            value={option1}
            onChangeText={setOption1}
          />

          <Text style={styles.label}>Option 2 :</Text>
          <TextInput
            style={styles.input}
            placeholder="Deuxième proposition"
            value={option2}
            onChangeText={setOption2}
          />
        </>
      )}

      <Button
        title={loading ? 'Envoi...' : 'Poster'}
        onPress={handlePost}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  label: { fontSize: 18, marginBottom: 8 },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#007bff',
    marginHorizontal: 10,
    borderRadius: 20,
  },
  toggleButtonActive: {
    backgroundColor: '#007bff',
  },
  toggleText: {
    color: '#007bff',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: 'white',
  },
});
