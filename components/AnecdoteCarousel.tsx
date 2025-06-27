import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { db } from '../firebaseConfig';
import { doc, updateDoc, onSnapshot, collection, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 50;

export default function AnecdoteCarousel({ anecdotes: initialAnecdotes }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [anecdotes, setAnecdotes] = useState(initialAnecdotes);
  const auth = getAuth();
  const user = auth.currentUser;
  const EMOJIS = ['🥰', '😂', '😯', '😢', '😡'];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'anecdotes'), (snapshot) => {
      const updatedAnecdotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnecdotes(updatedAnecdotes);
    });
    return () => unsubscribe();
  }, []);

  const handleEmojiPress = async (anecdoteId, emoji) => {
    if (!user) {
      console.log("User not authenticated");
      return;
    }

    try {
      const anecdoteRef = doc(db, 'anecdotes', anecdoteId);
      const anecdoteSnap = await getDoc(anecdoteRef);
      const data = anecdoteSnap.data();
      const currentReactions = data.reactions || {};

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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.author}>👤{item.author}</Text>
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

  return (
    <View style={styles.carouselContainer}>
      <Carousel
        width={CARD_WIDTH + 40}
        height={200}
        data={anecdotes}
        renderItem={({ item }) => renderItem({ item })}
        onSnapToItem={setCurrentIndex}
        mode="horizontal-stack"
        modeConfig={{ showLength: anecdotes.length }} // ✅ Correction ici
        style={{ flexGrow: 0 }}
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
          style={styles.navButton}
        >
          <Text style={styles.buttonText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.pagination}>{currentIndex + 1}/{anecdotes.length}</Text>
        <TouchableOpacity
          onPress={() => currentIndex < anecdotes.length - 1 && setCurrentIndex(currentIndex + 1)}
          disabled={currentIndex === anecdotes.length - 1}
          style={styles.navButton}
        >
          <Text style={styles.buttonText}>➡️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: { marginVertical: 20, height: 200 },
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
