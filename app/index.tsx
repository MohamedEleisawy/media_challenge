import AnecdoteCarousel from '@/components/AnecdoteCarousel';
import HeaderComponent from '@/components/HeaderComponent';
import PollsCarousel from '@/components/PollsCarousel'; // Import the PollsCarousel component
import globalStyles from '@/styles/globalStyles';
import { useRouter } from 'expo-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';

export default function Home() {
  const router = useRouter();
  
  // États pour gérer les données et l'interface
  const [anecdotes, setAnecdotes] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const auth = getAuth();

  // Écoute des changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe(); // Nettoyage de l'écouteur
  }, []);

  // Fonction pour calculer le nombre total de réactions d'une anecdote
  const getTotalReactions = (anecdote) => {
    if (!anecdote.reactions) return 0;
    return Object.values(anecdote.reactions).reduce((total, emojiArray) => {
      return total + (Array.isArray(emojiArray) ? emojiArray.length : 0);
    }, 0);
  };

  // Fonction pour calculer le nombre total de votes d'un sondage
  const getTotalVotes = (poll) => {
    if (!poll.options || !Array.isArray(poll.options)) return 0;
    return poll.options.reduce((total, option) => total + (option.votes || 0), 0);
  };

  // Fonction de récupération des données depuis Firestore avec tri par popularité
  const fetchData = async () => {
    try {
      // Requêtes parallèles pour optimiser les performances
      const anecdoteQuery = query(collection(db, 'anecdotes'), orderBy('createdAt', 'desc'));
      const pollQuery = query(collection(db, 'polls'), orderBy('createdAt', 'desc'));

      const [anecdoteSnap, pollSnap] = await Promise.all([getDocs(anecdoteQuery), getDocs(pollQuery)]);

      // Transformation des données Firestore en objets JavaScript
      const anecdotesData = anecdoteSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const pollsData = pollSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Tri des anecdotes par nombre total de réactions (décroissant)
      const sortedAnecdotes = anecdotesData.sort((a, b) => {
        return getTotalReactions(b) - getTotalReactions(a);
      });

      // Tri des sondages par nombre total de votes (décroissant)
      const sortedPolls = pollsData.sort((a, b) => {
        return getTotalVotes(b) - getTotalVotes(a);
      });

      setAnecdotes(sortedAnecdotes);
      setPolls(sortedPolls);
    } catch (err) {
      console.error('Erreur chargement données :', err);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial des données
  useEffect(() => {
    fetchData();
  }, []);

  // Fonction de gestion des votes sur les sondages
  const handleVote = async (pollId, optionId) => {
    try {
      const pollRef = doc(db, 'polls', pollId);
      const poll = polls.find((p) => p.id === pollId);

      // Vérifications de sécurité : utilisateur connecté, sondage existant, vote unique
      if (!user || !poll || poll.voters?.includes(user.uid)) return;

      // Mise à jour des votes : incrémentation de l'option choisie
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

      // Mise à jour immédiate de l'état local pour une UX fluide
      setPolls((prev) =>
        prev.map((p) => (p.id === pollId ? { ...p, options: updatedOptions, voters: updatedVoters } : p))
      );
    } catch (err) {
      console.error('Erreur lors du vote :', err);
    }
  };

  // Affichage du loader pendant le chargement
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#555" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* En-tête de l'application */}
      <HeaderComponent />
      
      {/* Section d'invitation à la contribution */}
      <TouchableOpacity
        style={globalStyles.section}
        onPress={() => router.push('/postChoice')}
      >
        <Text style={globalStyles.sectionTitle}>Envie d'en parler ?</Text>
      </TouchableOpacity>

      {/* Section des top anecdotes avec carousel - affichage des 5 plus populaires */}
      <View style={globalStyles.containerButton}>
        <Text style={globalStyles.TitleBlue}>Dernières</Text>
        <View style={globalStyles.containerButtonBlue}>
          <Text style={globalStyles.TitleWhite}>anecdotes</Text>
        </View>
      </View>
      {/* Affichage des 5 anecdotes avec le plus de réactions */}
      <AnecdoteCarousel anecdotes={anecdotes.slice(0, 5)} />
      <TouchableOpacity style={globalStyles.section} onPress={() => router.push('/anecdote')}>
        <Text style={globalStyles.sectionTitle}>Voir toutes les anecdotes</Text>
      </TouchableOpacity>

      {/* Section des sondages avec carousel interactif - affichage des 5 plus votés */}
      <View style={globalStyles.containerButton}>
        <Text style={globalStyles.TitleBlue}>Derniers</Text>
        <View style={globalStyles.containerButtonBlue}>
          <Text style={globalStyles.TitleWhite}>sondages</Text>
        </View>
      </View>
      {/* Carousel des 5 sondages les plus votés avec fonctionnalité de vote */}
      <PollsCarousel polls={polls.slice(0, 5)} userId={user?.uid} onVote={handleVote} />
      <TouchableOpacity style={globalStyles.section} onPress={() => router.push('/polls')}>
        <Text style={globalStyles.sectionTitle}>Voir tous les sondages</Text>
      </TouchableOpacity>

      {/* Sections d'aide et d'information */}
      <TouchableOpacity style={globalStyles.section} onPress={() => router.push('/help')}>
        <Text style={globalStyles.sectionTitle}>Tu as besoin d'aide ? ❤️‍🩹</Text>
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
