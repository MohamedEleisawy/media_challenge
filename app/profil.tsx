import { useFonts } from 'expo-font';
import { useRouter } from "expo-router";
import { signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-root-toast';
import { useAuth } from '../authContext';
import { auth, db } from '../firebaseConfig';
import globalStyles from '../styles/globalStyles';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    createdAt: '',
    email: '',
    nom: '',
    prenom: '',
    pseudo: '',
    uid: '',
    avatar: '',
    role: ''
  });
  const [anecdotes, setAnecdotes] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
    'Nunito-ExtraBoldItalic': require('../assets/fonts/Nunito-ExtraBoldItalic.ttf'),
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const createdAtDate = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Date inconnue';
          setUserData({ ...data, createdAt: createdAtDate });
        }

        const anecdotesRef = collection(db, 'anecdotes');
        const anecdotesQuery = query(anecdotesRef, where('authorId', '==', user.uid));
        const anecdotesSnapshot = await getDocs(anecdotesQuery);
        const anecdotesList = anecdotesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAnecdotes(anecdotesList);

        const pollsRef = collection(db, 'polls');
        const pollsQuery = query(pollsRef, where('authorId', '==', user.uid));
        const pollsSnapshot = await getDocs(pollsQuery);
        const pollsList = pollsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPolls(pollsList);
      } catch (error) {
        Toast.show(`❌ ${error.message}`, {
          backgroundColor: "#f44336",
          textColor: "white",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Toast.show('👋 Déconnecté avec succès.', {
        backgroundColor: "#9E9E9E",
        textColor: "white",
      });
      router.replace("/");
    } catch (error) {
      Toast.show(`❌ ${error.message}`, {
        backgroundColor: "#f44336",
        textColor: "white",
      });
    }
  };

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00235B" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        style={styles.avatar}
        source={userData.avatar ? { uri: userData.avatar } : require('../assets/images/images.png')}
      />
      <Text style={styles.pseudo}>{userData.pseudo}</Text>
      <Text style={styles.infoText}>Date de création: {userData.createdAt}</Text>

      {/* Bouton d'administration conditionnel */}
      {userData.role === 'admin' && (
        <TouchableOpacity style={globalStyles.preferenceButton} onPress={() => router.push('/admin')}>
          <Text style={globalStyles.preferenceButtonText}>Page d'administration</Text>
        </TouchableOpacity>
      )}

      {/* Bouton de modérateur conditionnel */}
      {userData.role === 'moderateur' && (
        <TouchableOpacity style={globalStyles.preferenceButton} onPress={() => router.push('/moderator')}>
          <Text style={globalStyles.preferenceButtonText}>Page de modération</Text>
        </TouchableOpacity>
      )}

      {/* Section Anecdotes */}
      <View style={globalStyles.containerButton}>
        <Text style={globalStyles.TitleBlue}>Mes </Text>
        <View style={globalStyles.containerButtonBlue}>
          <Text style={globalStyles.TitleWhite}>anecdotes</Text>
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        {anecdotes.length === 0 ? (
          <Text style={{ fontStyle: 'italic', color: '#999' }}>Aucune anecdote publiée.</Text>
        ) : (
          anecdotes.map((anecdote) => (
            <View key={anecdote.id} style={styles.anecdoteBox}>
              <Text style={styles.anecdoteText}>{anecdote.text}</Text>
              <Text style={styles.anecdoteDate}>
                Publié le {new Date(anecdote.createdAt?.seconds * 1000).toLocaleDateString()}
              </Text>
              <View style={styles.reactions}>
                {['🥰', '😂', '😯', '😢', '😡'].map((emoji) => (
                  <View key={emoji} style={styles.emojiContainer}>
                    <View style={styles.emojiDisplay}>
                      <Text style={styles.emoji}>{emoji}</Text>
                    </View>
                    <Text style={styles.reactionCount}>
                      {Array.isArray(anecdote.reactions?.[emoji]) ? anecdote.reactions[emoji].length : 0}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Section Sondages */}
      <View style={globalStyles.containerButton}>
        <Text style={globalStyles.TitleBlue}>Mes </Text>
        <View style={globalStyles.containerButtonBlue}>
          <Text style={globalStyles.TitleWhite}>sondages</Text>
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        {polls.length === 0 ? (
          <Text style={{ fontStyle: 'italic', color: '#999' }}>Aucun sondage publié.</Text>
        ) : (
          polls.map((poll) => {
            const totalVotes = Array.isArray(poll.options)
              ? poll.options.reduce((sum, opt) => sum + opt.votes, 0)
              : 0;

            return (
              <View key={poll.id} style={styles.pollBox}>
                <Text style={styles.pollQuestion}>{poll.question}</Text>
                <Text style={styles.pollDate}>
                  Publié le {new Date(poll.createdAt?.seconds * 1000).toLocaleDateString()}
                </Text>

                <View style={styles.pollResults}>
                  <View style={styles.progressRow}>
                    {poll.options?.map((option, index) => {
                      const percent = totalVotes ? Math.round((option.votes / totalVotes) * 100) : 0;
                      return (
                        <View
                          key={option.id}
                          style={{
                            flex: percent,
                            backgroundColor: option.color || (index === 0 ? '#7A91C1' : '#F9C846'),
                            height: 16,
                            borderTopLeftRadius: index === 0 ? 8 : 0,
                            borderBottomLeftRadius: index === 0 ? 8 : 0,
                            borderTopRightRadius: index === poll.options.length - 1 ? 8 : 0,
                            borderBottomRightRadius: index === poll.options.length - 1 ? 8 : 0,
                          }}
                        />
                      );
                    })}
                  </View>
                  <View style={styles.optionLabelRow}>
                    {poll.options?.map((option, index) => {
                      const percent = totalVotes ? Math.round((option.votes / totalVotes) * 100) : 0;
                      return (
                        <View
                          key={option.id}
                          style={{
                            flex: 1,
                            alignItems: index === 0 ? 'flex-start' : 'flex-end',
                          }}
                        >
                          <Text style={styles.percentageText}>{percent}%</Text>
                          <Text style={styles.optionLabel}>{option.text}</Text>
                        </View>
                      );
                    })}
                  </View>
                  <Text style={styles.totalVotes}>
                    Total: {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Préférences */}
      <View style={globalStyles.containerButton}>
        <Text style={globalStyles.TitleBlue}>Mes </Text>
        <View style={globalStyles.containerButtonBlue}>
          <Text style={globalStyles.TitleWhite}>préférences</Text>
        </View>
      </View>

      <TouchableOpacity style={globalStyles.preferenceButton} onPress={() => router.push('/confidentialiteModeration')}>
        <Text style={globalStyles.preferenceButtonText}>Confidentialité et modération</Text>
      </TouchableOpacity>
      <TouchableOpacity style={globalStyles.preferenceButton} onPress={() => router.push('/editProfil')}>
        <Text style={globalStyles.preferenceButtonText}>Modifier le compte</Text>
      </TouchableOpacity>
      <TouchableOpacity style={globalStyles.preferenceButton} onPress={() => router.push('/help')}>
        <Text style={globalStyles.preferenceButtonText}>Aide</Text>
      </TouchableOpacity>
      <TouchableOpacity style={globalStyles.preferenceButton} onPress={handleLogout}>
        <Text style={globalStyles.preferenceButtonText}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#00235B',
    alignSelf: 'center',
  },
  pseudo: {
    fontFamily: 'Nunito-Regular',
    fontSize: 24,
    marginBottom: 7,
    color: '#00235B',
    textAlign: 'center',
  },
  infoText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    marginBottom: 20,
    color: '#00235B',
    textAlign: 'center',
  },
  anecdoteBox: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'rgba(254, 242, 186, 0.34)',
    borderRadius: 14,
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  anecdoteText: {
    color: '#333',
    fontSize: 16,
    marginBottom: 8,
  },
  anecdoteDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  reactions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  emojiContainer: {
    alignItems: 'center',
    marginRight: 8,
  },
  emojiDisplay: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#E5ECFA',
    marginBottom: 2,
  },
  emoji: {
    fontSize: 16,
  },
  reactionCount: {
    fontSize: 10,
    color: '#35518A',
    fontWeight: '500',
  },
  pollBox: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#FDF9ED',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  pollQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  pollDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  pollResults: {
    marginTop: 8,
  },
  progressRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    height: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  optionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  percentageText: {
    fontWeight: '700',
    color: '#142A63',
    fontSize: 12,
  },
  optionLabel: {
    color: '#142A63',
    fontSize: 12,
  },
  totalVotes: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: '#00235B',
  },
});
