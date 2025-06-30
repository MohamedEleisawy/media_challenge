import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../authContext';
import { db } from '../firebaseConfig';
import { useRouter } from 'expo-router';

export default function ModeratorPage() {
  const { user, userRole } = useAuth();
  const [anecdotes, setAnecdotes] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkModeratorAccess = async () => {
      if (!user || !['admin', 'moderateur'].includes(userRole)) {
        Alert.alert('Accès refusé', 'Vous n\'avez pas les permissions de modération.');
        router.replace('/profil');
        return;
      }

      await fetchContent();
    };

    checkModeratorAccess();
  }, [user, userRole]);

  const fetchContent = async () => {
    try {
      // Récupérer toutes les anecdotes avec pseudo
      const anecdotesSnapshot = await getDocs(collection(db, 'anecdotes'));
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
      }, {});

      const anecdotesList = anecdotesSnapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        return {
          ...data,
          authorPseudo: usersData[data.authorId]?.pseudo || 'Inconnu'
        };
      });
      setAnecdotes(anecdotesList);

      // Récupérer tous les sondages avec pseudo
      const pollsSnapshot = await getDocs(collection(db, 'polls'));
      const pollsList = pollsSnapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        return {
          ...data,
          authorPseudo: usersData[data.authorId]?.pseudo || 'Inconnu'
        };
      });
      setPolls(pollsList);

      setLoading(false);
    } catch (error) {
      console.error('Erreur récupération contenu:', error);
      Alert.alert('Erreur', 'Impossible de charger le contenu');
    }
  };

  const deleteContent = async (collectionName, id, type) => {
    Alert.alert(
      'Modération',
      `Supprimer ${type} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, collectionName, id));
              Alert.alert('Succès', `${type} supprimé`);
              await fetchContent();
            } catch (error) {
              Alert.alert('Erreur', `Impossible de supprimer ${type}`);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>Chargement de l'espace modération...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🛡️ Modération</Text>

      {/* Anecdotes à modérer */}
      <Text style={styles.sectionTitle}>📝 Anecdotes ({anecdotes.length})</Text>
      {anecdotes.map((anecdote) => (
        <View key={anecdote.id} style={styles.contentCard}>
          <Text style={styles.author}>👤 {anecdote.authorPseudo}</Text>
          <Text style={styles.content}>{anecdote.text}</Text>
          <Text style={styles.date}>
            {anecdote.createdAt ? new Date(anecdote.createdAt.seconds * 1000).toLocaleDateString() : 'Date inconnue'}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteContent('anecdotes', anecdote.id, 'cette anecdote')}
          >
            <Text style={styles.deleteButtonText}>🗑️ Supprimer</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Sondages à modérer */}
      <Text style={styles.sectionTitle}>📊 Sondages ({polls.length})</Text>
      {polls.map((poll) => (
        <View key={poll.id} style={styles.contentCard}>
          <Text style={styles.author}>👤 {poll.authorPseudo}</Text>
          <Text style={styles.content}>{poll.question}</Text>
          <Text style={styles.date}>
            {poll.createdAt ? new Date(poll.createdAt.seconds * 1000).toLocaleDateString() : 'Date inconnue'}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteContent('polls', poll.id, 'ce sondage')}
          >
            <Text style={styles.deleteButtonText}>🗑️ Supprimer</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Retour au profil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#00235B', textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 15, color: '#00235B' },
  contentCard: { backgroundColor: '#f9f9f9', padding: 15, marginBottom: 10, borderRadius: 8 },
  author: { fontSize: 14, fontWeight: 'bold', color: '#00235B', marginBottom: 5 },
  content: { fontSize: 16, marginBottom: 8, color: '#333' },
  date: { fontSize: 12, color: '#666', marginBottom: 10 },
  deleteButton: { backgroundColor: '#f44336', padding: 10, borderRadius: 6, alignSelf: 'flex-end' },
  deleteButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  backButton: { backgroundColor: '#00235B', padding: 15, borderRadius: 8, marginTop: 20, marginBottom: 40 },
  backButtonText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }
});
 