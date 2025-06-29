import Ionicons from '@expo/vector-icons/build/Ionicons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';
import globalStyles from '../styles/globalStyles';

export default function PollsPage() {
  // États pour gérer les sondages et l'utilisateur connecté
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const auth = getAuth();

  // Écoute des changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Écoute en temps réel des sondages avec récupération des pseudos
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'polls'), async (snapshot) => {
      const pollDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Enrichissement de chaque sondage avec le pseudo de l'auteur
      const pollsWithPseudo = await Promise.all(
        pollDocs.map(async (poll) => {
          try {
            // Récupération du document utilisateur pour obtenir le pseudo
            const userDoc = await getDoc(doc(db, 'users', poll.authorId));
            const userData = userDoc.exists() ? userDoc.data() : {};
            const pseudo = typeof userData.pseudo === 'string' ? userData.pseudo : 'Inconnu';

            return {
              ...poll,
              pseudo,
              // Protection contre les données malformées
              options: Array.isArray(poll.options) ? poll.options : [],
              voters: Array.isArray(poll.voters) ? poll.voters : [],
            };
          } catch (err) {
            console.error('Erreur en récupérant le pseudo:', err);
            return {
              ...poll,
              pseudo: 'Inconnu',
              options: Array.isArray(poll.options) ? poll.options : [],
              voters: Array.isArray(poll.voters) ? poll.voters : [],
            };
          }
        })
      );

      setPolls(pollsWithPseudo);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Gestion du vote avec vérifications de sécurité
  const handleVote = async (pollId, optionId) => {
    try {
      const pollRef = doc(db, 'polls', pollId);
      const poll = polls.find((p) => p.id === pollId);

      // Vérifications : utilisateur connecté, sondage existant, pas déjà voté
      if (!user || !poll || poll.voters?.includes(user.uid)) return;

      // Mise à jour des votes : incrémentation de l'option sélectionnée
      const updatedOptions = poll.options.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );
      // Ajout de l'utilisateur à la liste des votants
      const updatedVoters = [...(poll.voters || []), user.uid];

      // Sauvegarde en base de données
      await updateDoc(pollRef, {
        options: updatedOptions,
        voters: updatedVoters,
      });

      // Mise à jour de l'état local pour un affichage immédiat
      setPolls((prev) =>
        prev.map((p) => (p.id === pollId ? { ...p, options: updatedOptions, voters: updatedVoters } : p))
      );
    } catch (err) {
      console.error('Error during voting:', err);
    }
  };

  // Fonction de signalement de contenu inapproprié
  const handleReport = async (poll) => {
    // Vérification de l'authentification avant signalement
    if (!user) {
      Alert.alert('Connexion requise', 'Vous devez être connecté pour signaler un contenu.');
      return;
    }

    try {
      // Création d'un nouveau signalement dans la collection 'reports'
      await addDoc(collection(db, 'reports'), {
        type: 'poll',
        contentId: poll.id,
        contentText: poll.question,
        authorId: poll.authorId,
        authorPseudo: poll.pseudo,
        reportedBy: user.uid,
        reportedAt: new Date(),
        status: 'pending',
      });

      Alert.alert('Signalement envoyé', 'Le sondage a été bien signalé. Merci de nous aider à maintenir une communauté respectueuse.');
    } catch (error) {
      console.error('Erreur signalement:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le signalement. Veuillez réessayer.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#555" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={globalStyles.containerButton}>
        <Text style={globalStyles.TitleBlue}>Tous les</Text>
        <View style={globalStyles.containerButtonBlue}>
          <Text style={globalStyles.TitleWhite}>sondages</Text>
        </View>
      </View>

      {polls.length === 0 ? (
        <Text style={styles.noData}>Aucun sondage pour le moment.</Text>
      ) : (
        polls.map((poll) => {
          const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
          const alreadyVoted = poll.voters.includes(user?.uid);

          return (
            <View key={poll.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.authorRow}>
                  <Text style={styles.authorIcon}>👤</Text>
                  <TouchableOpacity onPress={() => handleReport(poll)}>
                    <Ionicons name="flag" size={20} style={styles.flag} />
                  </TouchableOpacity>
                  <Text style={styles.author}>{poll.pseudo}</Text>
                </View>
              </View>
              <Text style={styles.question}>{poll.question}</Text>

              {!user ? (
                <Text style={styles.loginNote}>
                  🔒 Connecte-toi pour voir les résultats et voter.
                </Text>
              ) : alreadyVoted ? (
                <>
                  <View style={styles.progressRow}>
                    {poll.options.map((option, index) => {
                      const percent = totalVotes ? Math.round((option.votes / totalVotes) * 100) : 0;
                      return (
                        <View
                          key={option.id}
                          style={{
                            flex: percent,
                            backgroundColor: option.color || (index === 0 ? '#7A91C1' : '#F9C846'),
                            height: 20,
                            borderTopLeftRadius: index === 0 ? 12 : 0,
                            borderBottomLeftRadius: index === 0 ? 12 : 0,
                            borderTopRightRadius: index === poll.options.length - 1 ? 12 : 0,
                            borderBottomRightRadius: index === poll.options.length - 1 ? 12 : 0,
                          }}
                        />
                      );
                    })}
                  </View>
                  <View style={styles.optionLabelRow}>
                    {poll.options.map((option, index) => {
                      const percent = totalVotes ? Math.round((option.votes / totalVotes) * 100) : 0;
                      return (
                        <View
                          key={option.id}
                          style={{
                            flex: 1,
                            alignItems: index === 0 ? 'flex-start' : 'flex-end',
                          }}
                        >
                          <Text style={{ fontWeight: '700', color: '#142A63' }}>{percent}%</Text>
                          <Text style={{ color: '#142A63' }}>{option.text}</Text>
                        </View>
                      );
                    })}
                  </View>
                </>
              ) : (
                <View style={styles.voteButtons}>
                  {poll.options.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.voteBtn}
                      onPress={() => handleVote(poll.id, option.id)}
                    >
                      <Text style={styles.voteBtnText}>{option.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noData: { textAlign: 'center', color: '#888', marginVertical: 30 },
  card: {
    backgroundColor: '#FDF9ED',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  authorIcon: { fontSize: 18, marginRight: 6 },
  author: { fontWeight: 'bold', color: '#142A63' },
  question: { fontSize: 15, color: '#222', marginVertical: 8 },
  loginNote: { color: '#888', fontStyle: 'italic', marginTop: 8 },
  voteButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  voteBtn: {
    backgroundColor: '#142A63',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginHorizontal: 5,
    marginTop: 8,
  },
  voteBtnText: { color: '#fff', fontWeight: 'bold' },
  progressRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#e8e8e8',
    borderRadius: 12,
    height: 20,
    overflow: 'hidden',
    marginVertical: 10,
  },
  optionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
    flag: {
    position: 'absolute',
    left: 260,
    top: -10,
    color: '#35518A',
  },
});
