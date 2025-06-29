import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../authContext';
import { db } from '../firebaseConfig';

export default function ModeratorPage() {
  // État pour gérer l'utilisateur connecté et son rôle
  const { user, userRole } = useAuth();
  
  // États pour stocker les données récupérées depuis Firestore
  const [anecdotes, setAnecdotes] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Vérification des permissions et chargement initial des données
  useEffect(() => {
    const checkModeratorAccess = async () => {
      // Contrôle d'accès : seuls les admins et modérateurs peuvent accéder
      if (!user || !['admin', 'moderateur'].includes(userRole)) {
        Alert.alert('Accès refusé', 'Vous n\'avez pas les permissions de modération.');
        router.replace('/profil');
        return;
      }

      await fetchContent();
    };

    checkModeratorAccess();
  }, [user, userRole]);

  // Récupération de tous les contenus (anecdotes et sondages) avec les pseudos des auteurs
  const fetchContent = async () => {
    try {
      // Récupération simultanée des anecdotes et des utilisateurs
      const anecdotesSnapshot = await getDocs(collection(db, 'anecdotes'));
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      // Transformation des utilisateurs en objet pour un accès rapide par ID
      const usersData = usersSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
      }, {});

      // Enrichissement des anecdotes avec le pseudo de l'auteur
      const anecdotesList = anecdotesSnapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        return {
          ...data,
          authorPseudo: usersData[data.authorId]?.pseudo || 'Inconnu'
        };
      });
      setAnecdotes(anecdotesList);

      // Même processus pour les sondages
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

  // Fonction de suppression de contenu avec confirmation
  const deleteContent = async (collectionName, id, type) => {
    // Double confirmation avant suppression définitive
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
              // Suppression du document dans Firestore
              await deleteDoc(doc(db, collectionName, id));
              Alert.alert('Succès', `${type} supprimé`);
              // Rechargement des données pour mettre à jour l'affichage
              await fetchContent();
            } catch (error) {
              Alert.alert('Erreur', `Impossible de supprimer ${type}`);
            }
          }
        }
      ]
    );
  };

  // Affichage du loader pendant le chargement
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

      {/* Bouton d'accès aux signalements */}
      <TouchableOpacity style={styles.reportsButton} onPress={() => router.push('/reports')}>
        <Text style={styles.reportsButtonText}>🚨 Voir les signalements</Text>
      </TouchableOpacity>

      {/* Section de modération des anecdotes */}
      <Text style={styles.sectionTitle}>📝 Anecdotes ({anecdotes.length})</Text>
      {anecdotes.map((anecdote) => (
        <View key={anecdote.id} style={styles.contentCard}>
          <Text style={styles.author}>👤 {anecdote.authorPseudo}</Text>
          <Text style={styles.content}>{anecdote.text}</Text>
          <Text style={styles.date}>
            {anecdote.createdAt ? new Date(anecdote.createdAt.seconds * 1000).toLocaleDateString() : 'Date inconnue'}
          </Text>
          {/* Bouton de suppression avec confirmation */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteContent('anecdotes', anecdote.id, 'cette anecdote')}
          >
            <Text style={styles.deleteButtonText}>🗑️ Supprimer</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Section de modération des sondages */}
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

      {/* Bouton de retour */}
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
  backButtonText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  reportsButton: { 
    backgroundColor: '#ff6b6b', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 20,
    alignItems: 'center'
  },
  reportsButtonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});
