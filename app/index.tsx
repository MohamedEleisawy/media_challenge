import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import HeaderComponent from '@/components/HeaderComponent';
import globalStyles from '@/styles/globalStyles';
import AnecdoteCarousel from '@/components/AnecdoteCarousel';
import { useRouter } from 'expo-router';
export default function Home() {
  const router = useRouter();
  const [anecdotes, setAnecdotes] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      const anecdoteQuery = query(collection(db, 'anecdotes'), orderBy('createdAt', 'desc'));
      const pollQuery = query(collection(db, 'polls'), orderBy('createdAt', 'desc'));

      const [anecdoteSnap, pollSnap] = await Promise.all([
        getDocs(anecdoteQuery),
        getDocs(pollQuery),
      ]);

      const anecdotesData = anecdoteSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const pollsData = pollSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setAnecdotes(anecdotesData);
      setPolls(pollsData);
    } catch (err) {
      console.error('Erreur chargement données :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVote = async (pollId, optionId) => {
    try {
      const pollRef = doc(db, 'polls', pollId);
      const poll = polls.find(p => p.id === pollId);

      if (!user || !poll || poll.voters?.includes(user.uid)) return;

      const updatedOptions = poll.options.map(opt =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );

      const updatedVoters = [...(poll.voters || []), user.uid];

      await updateDoc(pollRef, {
        options: updatedOptions,
        voters: updatedVoters,
      });

      setPolls(prev =>
        prev.map(p =>
          p.id === pollId ? { ...p, options: updatedOptions, voters: updatedVoters } : p
        )
      );
    } catch (err) {
      console.error('Erreur lors du vote :', err);
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
      <HeaderComponent />
      <TouchableOpacity style={globalStyles.section} onPress={() => Linking.openURL('https://www.mes-allocs.fr/guides/aides-sociales/')}>
        <Text style={globalStyles.sectionTitle}>Envie d'en parler ?</Text>
      </TouchableOpacity>

      <View style={globalStyles.containerButton}>
        <Text style={globalStyles.TitleBlue}>Top</Text>
        <View style={globalStyles.containerButtonBlue}>
          <Text style={globalStyles.TitleWhite}>anecdotes</Text>
        </View>
      </View>
      <AnecdoteCarousel anecdotes={anecdotes.slice(0, 5)} />
      <TouchableOpacity
        style={globalStyles.section}
        onPress={() => router.push('/anecdote')}
      >
        <Text style={globalStyles.sectionTitle}>Voir toutes les anecdotes</Text>
      </TouchableOpacity>

      <View style={globalStyles.containerButton}>
        <View style={globalStyles.containerButtonBlue}>
          <Text style={globalStyles.TitleWhite}>Sondage</Text>
        </View>
      </View>
      {polls.length === 0 ? (
        <Text style={styles.noData}>Aucun sondage pour le moment.</Text>
      ) : (
        polls.map(poll => {
          const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
          const alreadyVoted = poll.voters?.includes(user?.uid);

          return (
            <View key={poll.id} style={styles.card}>
              <Text style={styles.author}>🗣️ {poll.author}</Text>
              <Text style={styles.text}>{poll.question}</Text>

              {user ? (
                poll.options.map(option => {
                  const percent = totalVotes ? ((option.votes / totalVotes) * 100).toFixed(1) : '0';
                  return (
                    <View key={option.id} style={styles.optionContainer}>
                      {alreadyVoted ? (
                        <Text style={styles.votedText}>✔️ {option.text} - {option.votes} votes ({percent}%)</Text>
                      ) : (
                        <TouchableOpacity onPress={() => handleVote(poll.id, option.id)}>
                          <Text style={styles.voteButton}>🗳️ {option.text}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })
              ) : (
                <Text style={styles.votedText}>🔒 Connecte-toi pour voter</Text>
              )}
            </View>
          );
        })
      )}

      <TouchableOpacity style={globalStyles.section} >
        <Text style={globalStyles.sectionTitle}>Suivez nos actualités</Text>
      </TouchableOpacity>

      <TouchableOpacity style={globalStyles.section}>
        <Text style={globalStyles.sectionTitle}>Abonnez-vous à la newsletter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  noData: {
    textAlign: 'center',
    color: '#888',
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  author: {
    fontWeight: '600',
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  optionContainer: {
    marginBottom: 8,
  },
  voteButton: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  votedText: {
    color: '#555',
  },
});