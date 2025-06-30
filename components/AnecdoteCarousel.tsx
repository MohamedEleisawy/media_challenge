import { useTheme } from '@/components/ui/Theme';
import { useGlobalStyles } from '@/styles/globalStyles';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 50;

export default function AnecdoteCarousel({ anecdotes: initialAnecdotes }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [anecdotes, setAnecdotes] = useState(initialAnecdotes || []);
  const flatListRef = useRef();
  const auth = getAuth();
  const user = auth.currentUser;
  const EMOJIS = ['🥰', '😂', '😯', '😢', '😡'];
  const theme = useTheme();
  const globalStyles = useGlobalStyles();

  useEffect(() => {
    // Mise à jour des anecdotes quand les props changent
    if (initialAnecdotes && initialAnecdotes.length > 0) {
      // Enrichir les anecdotes reçues en props avec les pseudos
      const enrichAnecdotes = async () => {
        const anecdotesWithPseudo = await Promise.all(initialAnecdotes.map(async (anecdote) => {
          if (!anecdote.authorId) {
            return { ...anecdote, pseudo: 'Inconnu' };
          }
          try {
            const userDoc = await getDoc(doc(db, 'users', anecdote.authorId));
            const userData = userDoc.exists() ? userDoc.data() : {};
            return { ...anecdote, pseudo: userData.pseudo || 'Inconnu' };
          } catch (err) {
            console.error('Erreur en récupérant le pseudo:', err);
            return { ...anecdote, pseudo: 'Inconnu' };
          }
        }));
        setAnecdotes(anecdotesWithPseudo);
      };

      enrichAnecdotes();
    } else {
      // Si aucune anecdote n'est fournie en props, récupérer depuis Firestore
      const unsubscribe = onSnapshot(collection(db, 'anecdotes'), async (snapshot) => {
        const anecdoteDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Récupérer les pseudos associés
        const anecdotesWithPseudo = await Promise.all(anecdoteDocs.map(async (anecdote) => {
          if (!anecdote.authorId) {
            // Si pas d'authorId, on met "Inconnu"
            return { ...anecdote, pseudo: 'Inconnu' };
          }
          try {
            const userDoc = await getDoc(doc(db, 'users', anecdote.authorId));
            const userData = userDoc.exists() ? userDoc.data() : {};
            return { ...anecdote, pseudo: userData.pseudo || 'Inconnu' };
          } catch (err) {
            console.error('Erreur en récupérant le pseudo:', err);
            return { ...anecdote, pseudo: 'Inconnu' };
          }
        }));

        setAnecdotes(anecdotesWithPseudo);
      });

      return () => unsubscribe();
    }
  }, [initialAnecdotes]);

  const handleNext = () => {
    if (currentIndex < anecdotes.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      flatListRef.current.scrollToIndex({ index: currentIndex - 1 });
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getItemLayout = (data, index) => ({
    length: CARD_WIDTH + 40,
    offset: (CARD_WIDTH + 40) * index,
    index,
  });

  const handleEmojiPress = async (anecdoteId, emoji) => {
    if (!user) {
      // Affichage d'un message d'erreur si l'utilisateur n'est pas connecté
      Alert.alert(
        'Connexion requise', 
        'Vous devez être connecté pour réagir aux anecdotes. Connectez-vous pour participer !',
        [
          { text: 'OK', style: 'default' }
        ]
      );
      return;
    }

    try {
      const anecdoteRef = doc(db, 'anecdotes', anecdoteId);
      const anecdoteSnap = await getDoc(anecdoteRef);
      const data = anecdoteSnap.data();
      const currentReactions = data?.reactions || {};

      const userAlreadyReacted = (currentReactions[emoji] || []).includes(user.uid);

      const newReactions = {};
      EMOJIS.forEach(e => {
        newReactions[e] = (currentReactions[e] || []).filter(uid => uid !== user.uid);
      });

      if (!userAlreadyReacted) {
        newReactions[emoji].push(user.uid);
      }

      await updateDoc(anecdoteRef, { reactions: newReactions });

      console.log("Réaction mise à jour !");
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la réaction :", err);
      // Affichage d'un message d'erreur en cas de problème technique
      Alert.alert(
        'Erreur', 
        'Impossible d\'enregistrer votre réaction. Veuillez réessayer.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
    }
  };

  const handleReport = async (anecdote) => {
    if (!user) {
      Alert.alert('Connexion requise', 'Vous devez être connecté pour signaler un contenu.');
      return;
    }

    try {
      await addDoc(collection(db, 'reports'), {
        type: 'anecdote',
        contentId: anecdote.id,
        contentText: anecdote.text,
        authorId: anecdote.authorId,
        authorPseudo: anecdote.pseudo,
        reportedBy: user.uid,
        reportedAt: new Date(),
        status: 'pending'
      });

      Alert.alert('Signalement envoyé', 'L\'anecdote a été bien signalée. Merci de nous aider à maintenir une communauté respectueuse.');
    } catch (error) {
      console.error('Erreur signalement:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le signalement. Veuillez réessayer.');
    }
  };

  const renderItem = ({ item }) => {
    const pseudo = typeof item.pseudo === 'string' ? item.pseudo : 'Inconnu';

    return (
      <View style={[styles.card, { backgroundColor: theme.anecdoteCard }]}>
        <View style={styles.authorRow}>
          <Text style={[styles.author, { color: theme.text }]}>👤{pseudo}</Text>
          <TouchableOpacity onPress={() => handleReport(item)}>
            <Ionicons name="flag" size={20} style={globalStyles.flag}/>
          </TouchableOpacity>
        </View>
        <Text style={[styles.text, { color: theme.text }]}>{item.text}</Text>
        <View style={styles.reactions}>
          {EMOJIS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.emojiContainer}
              onPress={() => handleEmojiPress(item.id, emoji)}
            >
              <View style={[styles.emojiButton, { backgroundColor: theme.emojiButton }]}>
                <Text style={styles.emoji}>{emoji}</Text>
              </View>
              <Text style={[styles.reactionCount, { color: theme.text }]}>{item.reactions?.[emoji]?.length || 0}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={anecdotes}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        getItemLayout={getItemLayout}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 40}
        decelerationRate="fast"
        onMomentumScrollEnd={e => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 40));
          setCurrentIndex(newIndex);
        }}
        contentContainerStyle={{ paddingHorizontal: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: { marginVertical: 20, height: 230 },
  card: {
    height: 200,
    width: CARD_WIDTH,
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 16,
    marginLeft: 18,
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  author: { fontWeight: '600', marginBottom: 5 },
  text: { fontSize: 16, marginBottom: 10 },
  reactions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  emojiContainer: { alignItems: 'center', marginHorizontal: 6 },
  emojiButton: { padding: 6, borderRadius: 25, marginBottom: 2 },
  emoji: { fontSize: 16 },
  reactionCount: { fontSize: 10, color: '#000', fontWeight: '500' },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  navButton: { padding: 10 },
  buttonText: { fontSize: 24 },
  pagination: { fontSize: 16, marginHorizontal: 12 },
});
