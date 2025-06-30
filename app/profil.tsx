import { useTheme } from '@/components/ui/Theme';
import { useFonts } from 'expo-font';
import { useRouter } from "expo-router";
import { signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-root-toast';
import { useAuth } from '../authContext';
import { auth, db } from '../firebaseConfig';

export default function ProfileScreen() {
  const { user } = useAuth();
  const theme = useTheme();
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
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#00235B" />
        <Text style={[styles.loadingText, { color: theme.text }]}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Avatar et informations principales */}
      <View style={styles.profileHeader}>
        <Image
          style={styles.avatar}
          source={userData.avatar ? { uri: userData.avatar } : require('../assets/images/images.png')}
        />
        <Text style={[styles.pseudo, { color: theme.text }]}>{userData.pseudo}</Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          Membre depuis le {userData.createdAt}
        </Text>
      </View>

      {/* Boutons d'administration conditionnels */}
      {userData.role === 'admin' && (
        <TouchableOpacity 
          style={[styles.adminButton, { backgroundColor: theme.error }]} 
          onPress={() => router.push('/admin')}
        >
          <Text style={styles.adminButtonText}>🔧 Administration</Text>
        </TouchableOpacity>
      )}

      {userData.role === 'moderateur' && (
        <TouchableOpacity 
          style={[styles.moderatorButton, { backgroundColor: theme.warning }]} 
          onPress={() => router.push('/moderator')}
        >
          <Text style={styles.moderatorButtonText}>🛡️ Modération</Text>
        </TouchableOpacity>
      )}

      {/* Section Mes anecdotes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Mes </Text>
          <View style={styles.sectionTitleHighlight}>
            <Text style={styles.sectionTitleWhite}>anecdotes</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{anecdotes.length}</Text>
          </View>
        </View>

        {anecdotes.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
              Aucune anecdote publiée pour le moment
            </Text>
          </View>
        ) : (
          anecdotes.slice(0, 3).map((anecdote) => (
            <View key={anecdote.id} style={[styles.anecdoteCard, { backgroundColor: theme.anecdoteCard }]}>
              <Text style={[styles.anecdoteText, { color: theme.text }]} numberOfLines={3}>
                {anecdote.text}
              </Text>
              <View style={styles.anecdoteFooter}>
                <Text style={[styles.anecdoteDate, { color: theme.textSecondary }]}>
                  {new Date(anecdote.createdAt?.seconds * 1000).toLocaleDateString()}
                </Text>
                <View style={styles.reactions}>
                  {['🥰', '😂', '😯', '😢', '😡'].map((emoji) => (
                    <View key={emoji} style={styles.reactionItem}>
                      <Text style={styles.emoji}>{emoji}</Text>
                      <Text style={[styles.reactionCount, { color: theme.textSecondary }]}>
                        {Array.isArray(anecdote.reactions?.[emoji]) ? anecdote.reactions[emoji].length : 0}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Section Mes sondages */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Mes </Text>
          <View style={styles.sectionTitleHighlight}>
            <Text style={styles.sectionTitleWhite}>sondages</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{polls.length}</Text>
          </View>
        </View>

        {polls.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
              Aucun sondage publié pour le moment
            </Text>
          </View>
        ) : (
          polls.slice(0, 3).map((poll) => {
            const totalVotes = Array.isArray(poll.options)
              ? poll.options.reduce((sum, opt) => sum + opt.votes, 0)
              : 0;

            return (
              <View key={poll.id} style={[styles.pollCard, { backgroundColor: theme.pollCard }]}>
                <Text style={[styles.pollQuestion, { color: theme.text }]} numberOfLines={2}>
                  {poll.question}
                </Text>
                <View style={styles.pollFooter}>
                  <Text style={[styles.pollDate, { color: theme.textSecondary }]}>
                    {new Date(poll.createdAt?.seconds * 1000).toLocaleDateString()}
                  </Text>
                  <View style={styles.pollStats}>
                    <Text style={[styles.pollVotes, { color: '#00235B' }]}>
                      {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                {/* Barre de progression simplifiée */}
                <View style={styles.progressBar}>
                  {poll.options?.map((option, index) => {
                    const percent = totalVotes ? (option.votes / totalVotes) * 100 : 0;
                    return (
                      <View
                        key={option.id}
                        style={{
                          width: `${percent}%`,
                          height: 4,
                          backgroundColor: index === 0 ? '#00235B' : '#7595C7',
                          borderRadius: 2,
                        }}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Section Mes préférences */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Mes </Text>
          <View style={styles.sectionTitleHighlight}>
            <Text style={styles.sectionTitleWhite}>préférences</Text>
          </View>
        </View>

        <View style={styles.preferencesContainer}>
          <TouchableOpacity 
            style={[styles.preferenceItem]} 
            onPress={() => router.push('/confidentialiteModeration')}
          >
            <Text style={[styles.preferenceText, { color: theme.text }]}>Confidentialité et modération</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.preferenceItem, { }]} 
            onPress={() => router.push('/editProfil')}
          >
            <Text style={[styles.preferenceText, { color: theme.text }]}>Modifier le compte</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.preferenceItem]} 
            onPress={() => router.push('/help')}
          >
            <Text style={[styles.preferenceText, { color: theme.text }]}>Aide</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.preferenceItem]} 
            onPress={handleLogout}
          >
            <Text style={styles.preferenceText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#00235B',
  },
  pseudo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 10,
  },
  adminButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  adminButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  moderatorButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  moderatorButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitleHighlight: {
    backgroundColor: '#00235B',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 5,
  },
  sectionTitleWhite: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  badge: {
    backgroundColor: '#7595C7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  anecdoteCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  anecdoteText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 10,
  },
  anecdoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  anecdoteDate: {
    fontSize: 12,
  },
  reactions: {
    flexDirection: 'row',
    gap: 8,
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  emoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 10,
    fontWeight: '500',
  },
  pollCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pollQuestion: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    lineHeight: 20,
  },
  pollFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pollDate: {
    fontSize: 12,
  },
  pollStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pollVotes: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
  },
  preferencesContainer: {
    gap: 8,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  preferenceIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  preferenceText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  preferenceArrow: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutItem: {
    backgroundColor: '#7595C7',
    borderColor: '#7595C7',
    marginTop: 10,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
});
