import { useRouter } from "expo-router";
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Toast from 'react-native-root-toast';
import { useAuth } from '../authContext';
import { useFonts } from 'expo-font';
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
    avatar: ''
  });
  const [anecdotes, setAnecdotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'GreatVibes-Regular': require('../assets/fonts/GreatVibes-Regular.ttf'),
    'Nunito-ExtraBoldItalic': require('../assets/fonts/Nunito-ExtraBoldItalic.ttf'),
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Récupérer les infos utilisateur
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const createdAtDate = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Date inconnue';
          setUserData({ ...data, createdAt: createdAtDate });
        }

        // Récupérer ses anecdotes
        const anecdotesRef = collection(db, 'anecdotes');
        const q = query(anecdotesRef, where('author', '==', user.email));
        const querySnapshot = await getDocs(q);
        const anecdotesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAnecdotes(anecdotesList);
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
            </View>
          ))
        )}
      </View>

      {/* Statistiques */}
      <View style={globalStyles.containerButton}>
        <Text style={globalStyles.TitleBlue}>Mes </Text>
        <View style={globalStyles.containerButtonBlue}>
          <Text style={globalStyles.TitleWhite}>sondages</Text>
        </View>
      </View>

      {/* Préférences */}
      <View style={globalStyles.containerButton}>
        <Text style={globalStyles.TitleBlue}>Mes </Text>
        <View style={globalStyles.containerButtonBlue}>
          <Text style={globalStyles.TitleWhite}>préférences</Text>
        </View>
      </View>

      <TouchableOpacity style={globalStyles.preferenceButton}  onPress={() => router.push('/ConfidentialiteModeration')}>
        <Text style={globalStyles.preferenceButtonText}>Confidentialité et modération</Text>
      </TouchableOpacity>
      <TouchableOpacity style={globalStyles.preferenceButton} onPress={() => router.push('/editProfil')}>
        <Text style={globalStyles.preferenceButtonText}>Modifier le compte</Text>
      </TouchableOpacity>
      <TouchableOpacity style={globalStyles.preferenceButton} onPress={() => router.push('/aide')}>
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
    fontFamily: 'GreatVibes-Regular',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 7,
    color: '#00235B',
    textAlign: 'center',
  },
  infoText: {
    fontFamily: 'GreatVibes-Regular',
    fontSize: 16,
    marginBottom: 20,
    color: '#00235B',
    textAlign: 'center',
  },
  anecdoteBox: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  anecdoteText: {
    color: '#333',
  },
  anecdoteDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'GreatVibes-Regular',
    fontSize: 16,
    color: '#00235B',
  },
});
