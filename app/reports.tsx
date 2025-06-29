import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../authContext';
import { db } from '../firebaseConfig';

export default function ReportsPage() {
  // États pour gérer les signalements et l'interface utilisateur
  const { user, userRole } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Vérification des permissions d'accès et chargement initial
  useEffect(() => {
    const checkModeratorAccess = async () => {
      // Contrôle d'accès : seuls les modérateurs et admins peuvent voir les signalements
      if (!user || !['admin', 'moderateur'].includes(userRole)) {
        Alert.alert('Accès refusé', 'Vous n\'avez pas les permissions pour voir les signalements.');
        router.replace('/profil');
        return;
      }

      await fetchReports();
    };

    checkModeratorAccess();
  }, [user, userRole]);

  // Récupération de tous les signalements depuis Firestore
  const fetchReports = async () => {
    try {
      const reportsSnapshot = await getDocs(collection(db, 'reports'));
      const reportsList = reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Tri par date de signalement (plus récent en premier) pour prioriser
      reportsList.sort((a, b) => new Date(b.reportedAt?.seconds * 1000) - new Date(a.reportedAt?.seconds * 1000));

      setReports(reportsList);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Erreur récupération signalements:', error);
      Alert.alert('Erreur', 'Impossible de charger les signalements');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Traitement des signalements : ignorer ou supprimer le contenu
  const handleResolveReport = async (reportId, action) => {
    try {
      if (action === 'dismiss') {
        // Marquer le signalement comme non fondé
        await updateDoc(doc(db, 'reports', reportId), {
          status: 'dismissed',
          resolvedAt: new Date()
        });
        Alert.alert('Signalement ignoré', 'Le signalement a été marqué comme non fondé.');
      } else if (action === 'delete') {
        const report = reports.find(r => r.id === reportId);
        
        // Suppression du contenu signalé dans sa collection d'origine
        await deleteDoc(doc(db, report.type === 'poll' ? 'polls' : 'anecdotes', report.contentId));
        
        // Marquer le signalement comme résolu avec action prise
        await updateDoc(doc(db, 'reports', reportId), {
          status: 'resolved',
          resolvedAt: new Date(),
          action: 'content_deleted'
        });
        
        Alert.alert('Contenu supprimé', `Le ${report.type === 'poll' ? 'sondage' : 'anecdote'} signalé a été supprimé.`);
      }

      // Rechargement pour mettre à jour l'affichage
      await fetchReports();
    } catch (error) {
      console.error('Erreur traitement signalement:', error);
      Alert.alert('Erreur', 'Impossible de traiter le signalement');
    }
  };

  // Fonction de rafraîchissement pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  // Séparation des signalements par statut pour un affichage organisé
  const pendingReports = reports.filter(report => report.status === 'pending');
  const resolvedReports = reports.filter(report => report.status !== 'pending');

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>Chargement des signalements...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>🚨 Signalements</Text>

      {/* Signalements en attente */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 En attente ({pendingReports.length})</Text>
        {pendingReports.length === 0 ? (
          <Text style={styles.noData}>Aucun signalement en attente.</Text>
        ) : (
          pendingReports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportType}>
                  {report.type === 'poll' ? '📊 Sondage' : '📝 Anecdote'}
                </Text>
                <Text style={styles.reportDate}>
                  {new Date(report.reportedAt?.seconds * 1000).toLocaleDateString()}
                </Text>
              </View>
              
              <Text style={styles.reportAuthor}>Auteur: {report.authorPseudo}</Text>
              <Text style={styles.reportContent}>{report.contentText}</Text>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.dismissButton]}
                  onPress={() => handleResolveReport(report.id, 'dismiss')}
                >
                  <Ionicons name="close-circle" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Ignorer</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    Alert.alert(
                      'Confirmation',
                      `Supprimer définitivement ce ${report.type === 'poll' ? 'sondage' : 'cette anecdote'} ?`,
                      [
                        { text: 'Annuler', style: 'cancel' },
                        { text: 'Supprimer', style: 'destructive', onPress: () => handleResolveReport(report.id, 'delete') }
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Signalements traités */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ Traités ({resolvedReports.length})</Text>
        {resolvedReports.slice(0, 5).map((report) => (
          <View key={report.id} style={[styles.reportCard, styles.resolvedCard]}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportType}>
                {report.type === 'poll' ? '📊 Sondage' : '📝 Anecdote'}
              </Text>
              <Text style={styles.reportStatus}>
                {report.status === 'dismissed' ? 'Ignoré' : 'Supprimé'}
              </Text>
            </View>
            <Text style={styles.reportContent}>{report.contentText}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#00235B', textAlign: 'center', marginBottom: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#00235B' },
  noData: { fontStyle: 'italic', color: '#999', textAlign: 'center', marginVertical: 20 },
  reportCard: { backgroundColor: '#f9f9f9', padding: 15, marginBottom: 15, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#ff6b6b' },
  resolvedCard: { borderLeftColor: '#51cf66', opacity: 0.7 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reportType: { fontSize: 16, fontWeight: 'bold', color: '#00235B' },
  reportDate: { fontSize: 12, color: '#666' },
  reportStatus: { fontSize: 12, color: '#51cf66', fontWeight: 'bold' },
  reportAuthor: { fontSize: 14, color: '#666', marginBottom: 5 },
  reportContent: { fontSize: 16, color: '#333', marginBottom: 15 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 6 },
  dismissButton: { backgroundColor: '#ffa726' },
  deleteButton: { backgroundColor: '#f44336' },
  actionButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 5 },
  backButton: { backgroundColor: '#00235B', padding: 15, borderRadius: 8, marginTop: 20, marginBottom: 40 },
  backButtonText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }
});
