import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../components/ui/Theme';
import { db } from '../firebaseConfig';

const { width: screenWidth } = Dimensions.get('window');

const PollsCarousel = ({ userId, onVote, polls: propPolls }) => {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [polls, setPolls] = useState(propPolls || []);
  const cardWidth = screenWidth - 64;
  const cardWithMargin = cardWidth + 24; // Include margin in calculation
  const theme = useTheme();

  // Mise à jour des polls quand les props changent
  useEffect(() => {
    if (propPolls && propPolls.length > 0) {
      // Enrichir les polls reçus en props avec les pseudos
      const enrichPolls = async () => {
        const pollsWithPseudo = await Promise.all(propPolls.map(async (poll) => {
          if (!poll.authorId) {
            return { ...poll, pseudo: 'Inconnu' };
          }
          try {
            const userDoc = await getDoc(doc(db, 'users', poll.authorId));
            const userData = userDoc.exists() ? userDoc.data() : {};
            return { 
              ...poll, 
              pseudo: userData.pseudo || 'Inconnu',
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
        }));
        setPolls(pollsWithPseudo);
      };

      enrichPolls();
    }
  }, [propPolls]);

  useEffect(() => {
    // Si aucun poll n'est fourni en props, récupérer depuis Firestore
    if (!propPolls || propPolls.length === 0) {
      const unsubscribe = onSnapshot(collection(db, 'polls'), async (snapshot) => {
        const pollDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const pollsWithPseudo = await Promise.all(
          pollDocs.map(async (poll) => {
            try {
              const userDoc = await getDoc(doc(db, 'users', poll.authorId));
              const userData = userDoc.exists() ? userDoc.data() : {};
              const pseudo = typeof userData.pseudo === 'string' ? userData.pseudo : 'Inconnu';

              return {
                ...poll,
                pseudo,
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
      });

      return () => unsubscribe();
    }
  }, [propPolls]);

  const onScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / cardWithMargin);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index) => {
    scrollRef.current?.scrollTo({ x: index * cardWithMargin, animated: true });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < polls.length - 1) scrollToIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) scrollToIndex(currentIndex - 1);
  };

  const handleReport = async (poll) => {
    if (!userId) {
      Alert.alert('Connexion requise', 'Vous devez être connecté pour signaler un contenu.');
      return;
    }

    try {
      await addDoc(collection(db, 'reports'), {
        type: 'poll',
        contentId: poll.id,
        contentText: poll.question,
        authorId: poll.authorId,
        authorPseudo: poll.pseudo,
        reportedBy: userId,
        reportedAt: new Date(),
        status: 'pending'
      });

      Alert.alert('Signalement envoyé', 'Le sondage a été bien signalé. Merci de nous aider à maintenir une communauté respectueuse.');
    } catch (error) {
      console.error('Erreur signalement:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le signalement. Veuillez réessayer.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.carousel}
      >
        {polls.map((poll) => {
          const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
          const hasVoted = userId ? poll.voters.includes(userId) : false;

          return (
            <View key={poll.id} style={[styles.pollCard, { width: cardWidth, backgroundColor: theme.pollCard }]}>
              <View style={styles.cardHeader}>
                <View style={styles.authorRow}>
                  <Text style={[styles.authorIcon, { color: theme.text }]}>👤</Text>
                  <Text style={[styles.author, { color: theme.primary }]}>{poll.pseudo}</Text>
                  <TouchableOpacity onPress={() => handleReport(poll)}>
                    <Ionicons name="flag" size={20} style={[styles.flag, { color: theme.primary }]} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.pollQuestion, { color: theme.text }]}>{poll.question}</Text>
              
              {/* Logique conditionnelle inspirée de polls.tsx */}
              {!userId ? (
                // Utilisateur non connecté : masquer les résultats
                <Text style={[styles.loginNote, { color: theme.textSecondary }]}>🔒 Connecte-toi pour voir les résultats et voter.</Text>
              ) : hasVoted ? (
                // Utilisateur connecté qui a déjà voté : afficher les résultats
                <View style={styles.chartContainer}>
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
                        <View key={option.id} style={{ flex: 1, alignItems: index === 0 ? 'flex-start' : 'flex-end' }}>
                          <Text style={[styles.percentageText, { color: theme.primary }]}>{percent}%</Text>
                          <Text style={[styles.optionLabel, { color: theme.primary }]}>{option.text}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : (
                // Utilisateur connecté qui n'a pas encore voté : afficher les boutons de vote
                <View style={styles.voteButtons}>
                  {poll.options.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.voteButton, { backgroundColor: theme.buttonPrimary }]}
                      onPress={() => onVote(poll.id, option.id)}
                    >
                      <Text style={styles.voteButtonText}>{option.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Navigation avec thème */}
      <View style={styles.dotsContainer}>
        {polls.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === currentIndex ? theme.primary : theme.border }
            ]}
            onPress={() => scrollToIndex(index)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  carousel: {
    paddingHorizontal: 8,
  },
  pollCard: {
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  author: {
    fontWeight: 'bold',
    flex: 1,
    fontSize: 14,
  },
  pollQuestion: {
    fontSize: 15,
    marginVertical: 8,
    fontWeight: '500',
    lineHeight: 20,
  },
  chartContainer: {
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#333',
    borderRadius: 8,
    height: 16,
    overflow: 'hidden',
    marginVertical: 8,
  },
  optionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  percentageText: {
    fontWeight: '700',
    fontSize: 12,
  },
  optionLabel: {
    fontSize: 12,
  },
  voteButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  voteButton: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    marginTop: 6,
  },
  voteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  loginNote: {
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '50%',
    marginTop: 4,
  },
  counter: {
    fontSize: 14,
    fontWeight: '600',
  },
  flag: {
    marginLeft: 'auto',
  },
});

export default PollsCarousel;