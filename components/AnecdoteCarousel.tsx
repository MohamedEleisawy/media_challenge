import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { db } from '../firebaseConfig';
import { doc, updateDoc, onSnapshot, collection, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 50;

export default function AnecdoteCarousel({ anecdotes: initialAnecdotes }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [anecdotes, setAnecdotes] = useState(initialAnecdotes || []);
  const flatListRef = useRef();
  const auth = getAuth();
  const user = auth.currentUser;
  const EMOJIS = ['🥰', '😂', '😯', '😢', '😡'];

  useEffect(() => {
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
  }, []);

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
      console.log("User not authenticated");
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
    }
  };

  const renderItem = ({ item }) => {
    const pseudo = typeof item.pseudo === 'string' ? item.pseudo : 'Inconnu';

    return (
      <View style={styles.card}>
        <Text style={styles.author}>👤{pseudo}</Text>
        <Text style={styles.text}>{item.text}</Text>
        <View style={styles.reactions}>
          {EMOJIS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.emojiButton}
              onPress={() => handleEmojiPress(item.id, emoji)}
            >
              <Text style={styles.emoji}>{emoji}</Text>
              <Text style={styles.reactionCount}>{item.reactions?.[emoji]?.length || 0}</Text>
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
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0} style={styles.navButton}>
          <Text style={styles.buttonText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.pagination}>{currentIndex + 1}/{anecdotes.length}</Text>
        <TouchableOpacity onPress={handleNext} disabled={currentIndex === anecdotes.length - 1} style={styles.navButton}>
          <Text style={styles.buttonText}>➡️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: { marginVertical: 20, height: 300 },
  card: {
    height: 200,
    width: CARD_WIDTH,
    marginHorizontal: 20,
    backgroundColor: 'rgba(254, 242, 186, 0.34)',
    borderRadius: 10,
    padding: 16,
    marginLeft: 18,
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  author: { fontWeight: '600', marginBottom: 5 },
  text: { fontSize: 16, marginBottom: 10 },
  reactions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  emojiButton: { padding: 6, borderRadius: 25, backgroundColor: '#7595C7', marginHorizontal: 6, alignItems: 'center' },
  emoji: { fontSize: 16 },
  reactionCount: { fontSize: 12, color: '#000' },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  navButton: { padding: 10 },
  buttonText: { fontSize: 24 },
  pagination: { fontSize: 16, marginHorizontal: 12 },
});
