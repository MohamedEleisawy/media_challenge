import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import HeaderComponent from '@/components/HeaderComponent';
import globalStyles from '@/styles/globalStyles';
import AnecdoteCarousel from '@/components/AnecdoteCarousel';
import { useRouter } from 'expo-router';
import PollsCarousel from '@/components/PollsCarousel'; // Import the PollsCarousel component

export default function Home() {
  const router = useRouter();
  const [anecdotes, setAnecdotes] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const auth = getAuth();

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

      const [anecdoteSnap, pollSnap] = await Promise.all([getDocs(anecdoteQuery), getDocs(pollQuery)]);

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
        prev.map((p) => (p.id === pollId ? { ...p, options: updatedOptions, voters: updatedVoters } : p))
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
      <TouchableOpacity
        style={globalStyles.section}
        onPress={() => router.push('/postChoice')}
      >
        <Text style={globalStyles.sectionTitle}>Envie d'en parler ?</Text>
      </TouchableOpacity>

      <View style={globalStyles.containerButton}>
        <Text style={globalStyles.TitleBlue}>Top</Text>
        <View style={globalStyles.containerButtonBlue}>
          <Text style={globalStyles.TitleWhite}>anecdotes</Text>
        </View>
      </View>
      <AnecdoteCarousel anecdotes={anecdotes.slice(0, 5)} />
      <TouchableOpacity style={globalStyles.section} onPress={() => router.push('/anecdote')}>
        <Text style={globalStyles.sectionTitle}>Voir toutes les anecdotes</Text>
      </TouchableOpacity>

      <View style={globalStyles.containerButton}>
        <View style={globalStyles.containerButtonBlue}>
          <Text style={globalStyles.TitleWhite}>Sondage</Text>
        </View>
      </View>
      <PollsCarousel polls={polls} userId={user?.uid} onVote={handleVote} />
      <TouchableOpacity style={globalStyles.section} onPress={() => router.push('/polls')}>
        <Text style={globalStyles.sectionTitle}>Voir tous les sondages</Text>
      </TouchableOpacity>

      <TouchableOpacity style={globalStyles.section} onPress={() => router.push('/help')}>
        <Text style={globalStyles.sectionTitle}>Tu as besoin d’aide ? ❤️‍🩹</Text>
      </TouchableOpacity>

      <TouchableOpacity style={globalStyles.section} onPress={() => router.push('/news')}>
        <Text style={globalStyles.sectionTitle}>Reste informée 🗞️</Text>
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
  noData: {
    textAlign: 'center',
    color: '#888',
  },
});
