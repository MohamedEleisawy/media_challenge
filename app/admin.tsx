import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../authContext';
import { db } from '../firebaseConfig';

export default function AdminPage() {
  const { user, userRole } = useAuth();
  const [userData, setUserData] = useState(null);
  const [users, setUsers] = useState([]);
  const [anecdotes, setAnecdotes] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user || userRole !== 'admin') {
        Alert.alert('Accès refusé', 'Vous n\'avez pas les permissions administrateur.');
        router.replace('/profil');
        return;
      }

      await fetchData();
    };

    checkAdminAccess();
  }, [user, userRole]);

  const fetchData = async () => {
    try {
      // Récupérer tous les utilisateurs
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);

      // Récupérer toutes les anecdotes
      const anecdotesSnapshot = await getDocs(collection(db, 'anecdotes'));
      const anecdotesList = anecdotesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnecdotes(anecdotesList);

      // Récupérer tous les sondages
      const pollsSnapshot = await getDocs(collection(db, 'polls'));
      const pollsList = pollsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPolls(pollsList);

      setLoading(false);
    } catch (error) {
      console.error('Erreur récupération données:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      Alert.alert('Succès', `Rôle modifié vers ${newRole}`);
      await fetchData();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier le rôle');
    }
  };

  const deleteContent = async (collectionName, id, type) => {
    Alert.alert(
      'Confirmation',
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
              await fetchData();
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
        <Text>Chargement de l'espace administrateur...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔧 Administration</Text>
      
      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Utilisateurs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{anecdotes.length}</Text>
          <Text style={styles.statLabel}>Anecdotes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{polls.length}</Text>
          <Text style={styles.statLabel}>Sondages</Text>
        </View>
      </View>

      {/* Gestion des utilisateurs */}
      <Text style={styles.sectionTitle}>👥 Gestion des utilisateurs</Text>
      {users.map((userItem) => (
        <View key={userItem.id} style={styles.userCard}>
          <Text style={styles.userName}>{userItem.pseudo || 'Sans pseudo'}</Text>
          <Text style={styles.userEmail}>{userItem.email}</Text>
          <Text style={styles.userRole}>Rôle actuel: {userItem.role || 'user'}</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.roleButton, styles.adminBtn]}
              onPress={() => changeUserRole(userItem.id, 'admin')}
            >
              <Text style={styles.buttonText}>Admin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, styles.moderatorBtn]}
              onPress={() => changeUserRole(userItem.id, 'moderateur')}
            >
              <Text style={styles.buttonText}>Modérateur</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, styles.userBtn]}
              onPress={() => changeUserRole(userItem.id, 'user')}
            >
              <Text style={styles.buttonText}>Utilisateur</Text>
            </TouchableOpacity>
          </View>
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
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30 },
  statCard: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, alignItems: 'center', minWidth: 80 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#00235B' },
  statLabel: { fontSize: 12, color: '#666' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 15, color: '#00235B' },
  userCard: { backgroundColor: '#f9f9f9', padding: 15, marginBottom: 10, borderRadius: 8 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#00235B' },
  userEmail: { fontSize: 14, color: '#666', marginVertical: 2 },
  userRole: { fontSize: 14, color: '#333', marginBottom: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around' },
  roleButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, minWidth: 80 },
  adminBtn: { backgroundColor: '#f44336' },
  moderatorBtn: { backgroundColor: '#ff9800' },
  userBtn: { backgroundColor: '#4caf50' },
  buttonText: { color: 'white', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  backButton: { backgroundColor: '#00235B', padding: 15, borderRadius: 8, marginTop: 20, marginBottom: 40 },
  backButtonText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }
});
