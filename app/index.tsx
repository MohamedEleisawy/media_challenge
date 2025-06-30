import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import HeaderComponent from '@/components/HeaderComponent';
import AnecdoteCarousel from '@/components/AnecdoteCarousel';
import PollsCarousel from '@/components/PollsCarousel';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();
  const [anecdotes, setAnecdotes] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const auth = getAuth();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
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

      const anecdotesData = anecdoteSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const pollsData = pollSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

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
      const poll = polls.find((p) => p.id === pollId);

      if (!user || !poll || poll.voters?.includes(user.uid)) return;

      const updatedOptions = poll.options.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );
      const updatedVoters = [...(poll.voters || []), user.uid];

      await updateDoc(pollRef, {
        options: updatedOptions,
        voters: updatedVoters,
      });

      setPolls((prev) =>
        prev.map((p) =>
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
        <ActivityIndicator size="large" color="#bcd3ff" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? '#1c1c1c' : '#ffffff' }]}>
      <HeaderComponent />

      <TouchableOpacity style={styles.talkCard} onPress={() => router.push('/postChoice')}>
        <Text style={styles.talkText}>Envie d'en parler ?</Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top</Text>
        <View style={styles.sectionTag}>
          <Text style={styles.sectionTagText}>anecdotes</Text>
        </View>
      </View>

      <AnecdoteCarousel anecdotes={anecdotes.slice(0, 5)} />

      <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/anecdote')}>
        <Text style={styles.linkText}>Voir toutes les anecdotes</Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTag}>
          <Text style={styles.sectionTagText}>Sondage</Text>
        </View>
      </View>

      <PollsCarousel polls={polls} userId={user?.uid} onVote={handleVote} />

      <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/polls')}>
        <Text style={styles.linkText}>Voir tous les sondages</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/help')}>
        <Text style={styles.linkText}>Tu as besoin d’aide ? ❤️‍🩹</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/news')}>
        <Text style={styles.linkText}>Reste informée 🗞️</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
  },
  talkCard: {
    backgroundColor: '#bcd3ff',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 24,
    alignItems: 'center',
  },
  talkText: {
    color: '#1c1c1c',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginRight: 10,
  },
  sectionTag: {
    backgroundColor: '#bcd3ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sectionTagText: {
    color: '#1c1c1c',
    fontSize: 14,
    fontWeight: '600',
  },
  linkCard: {
    backgroundColor: '#2e2e2e',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 12,
    alignItems: 'center',
  },
  linkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});
