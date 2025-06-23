import { useRouter } from "expo-router";
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Toast from 'react-native-root-toast';
import { useAuth } from '../authContext';
import { useFonts } from 'expo-font';
import { auth, db } from '../firebaseConfig';

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
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'GreatVibes-Regular': require('../assets/fonts/GreatVibes-Regular.ttf'),
    'Nunito-ExtraBoldItalic': require('../assets/fonts/Nunito-ExtraBoldItalic.ttf'),
  });
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const createdAtDate = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date';
          setUserData({
            ...data,
            createdAt: createdAtDate
          });
        } else {
          Toast.show("❌ Aucune donnée utilisateur trouvée.", {
            backgroundColor: "#f44336",
            textColor: "white",
          });
        }
      } catch (error: any) {
        Toast.show(`❌ ${error.message}`, {
          backgroundColor: "#f44336",
          textColor: "white",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Toast.show('👋 Déconnecté avec succès.', {
        backgroundColor: "#9E9E9E",
        textColor: "white",
      });
      router.replace("/");
    } catch (error: any) {
      Toast.show(`❌ ${error.message}`, {
        backgroundColor: "#f44336",
        textColor: "white",
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00235B" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }
  if (!fontsLoaded) return null; 

  return (
    <View style={styles.container}>
      <Image
        style={styles.avatar}
        source={userData.avatar ? { uri: userData.avatar } : require('../assets/images/images.png')}
      />
      <Text style={styles.pseudo}>{userData.pseudo}</Text>
      <Text style={styles.infoText}>Date de création: {userData.createdAt}</Text>

      <View style={styles.anecdotesTitleContainer}>
        <Text style={styles.anecdotesTitleBlue}>Mes </Text>
        <View style={styles.anecdotesTitleYellow}>
          <Text style={styles.anecdotesTitleWhite}>anecdotes</Text>
        </View>
      </View>

      <View style={styles.anecdotesTitleContainer}>
        <Text style={styles.anecdotesTitleBlue}>Mes </Text>
        <View style={styles.anecdotesTitleYellow}>
          <Text style={styles.anecdotesTitleWhite}>statistiques</Text>
        </View>
      </View>

      <View style={styles.preferencesContainer}>
        <Text style={styles.preferencesTitle}>Mes préférences</Text>
        <TouchableOpacity style={styles.preferenceButton}>
          <Text style={styles.preferenceButtonText}>Confidentialité</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.preferenceButton}>
          <Text style={styles.preferenceButtonText}>Modération</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.preferenceButton}>
          <Text style={styles.preferenceButtonText}>Apparence</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.preferenceButton}>
          <Text style={styles.preferenceButtonText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.preferenceButton} onPress={() => router.push('/editProfil')}>
          <Text style={styles.preferenceButtonText}>Modifier le compte</Text>
        </TouchableOpacity>
      </View>

      <Button
        title="🚪 Se déconnecter"
        onPress={handleLogout}
        color="#f44336"
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#00235B',
  },
  pseudo: {
    fontFamily: 'GreatVibes-Regular', // Assurez-vous que ce nom est correct
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 7,
    color: '#00235B',
  },
  infoText: {
    fontFamily: 'GreatVibes-Regular', // Assurez-vous que ce nom est correct
    fontSize: 16,
    marginBottom: 10,
    color: '#00235B',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'GreatVibes-Regular', // Assurez-vous que ce nom est correct
    fontSize: 16,
    color: '#00235B',
  },
  preferencesContainer: {
    width: '100%',
    marginBottom: 20,
  },
  preferencesTitle: {
    fontFamily: 'GreatVibes-Regular', // Assurez-vous que ce nom est correct
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#00235B',
    textAlign: 'left',
  },
  preferenceButton: {
    backgroundColor: '#00235B',
    padding: 15,
    marginVertical: 5,
    borderRadius: 25,
    alignItems: 'center',
  },
  preferenceButtonText: {
    fontFamily: 'GreatVibes-Regular', // Assurez-vous que ce nom est correct
    color: '#F9DC5C',
    fontWeight: 'bold',
    fontSize: 16,
  },
  anecdotesTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    alignSelf: 'flex-start',
  },
  anecdotesTitleBlue: {
    fontFamily: 'GreatVibes-Regular', // Assurez-vous que ce nom est correct
    color: '#00235B',
    fontSize: 24,
    fontWeight: 'bold',
  },
  anecdotesTitleYellow: {
    backgroundColor: '#FFE066',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 1,
    elevation: 12,
    transform: [{ rotate: '-1deg' }],
  },
  anecdotesTitleWhite: {
    fontFamily: 'GreatVibes-Regular', // Assurez-vous que ce nom est correct
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
