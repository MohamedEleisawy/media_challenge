import { useRouter } from "expo-router";
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
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
      } catch (error) {
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
      
      {/* Mes anecdotes */}
      <View style={globalStyles.containerButton}>
        <Text style={globalStyles.TitleBlue}>Mes </Text>
        <View style={globalStyles.containerButtonBlue}>
          <Text style={globalStyles.TitleWhite}>anecdotes</Text>
        </View>
      </View>
      
      <View style={globalStyles.containerButton}>
        <Text style={globalStyles.TitleBlue}>Mes </Text>
        <View style={globalStyles.containerButtonBlue}>
          <Text style={globalStyles.TitleWhite}>statistiques</Text>
        </View>
      </View>


      {/* Mes préférences */}
      <View style={globalStyles.containerButton}>
        <Text style={globalStyles.TitleBlue}>Mes </Text>
        <View style={globalStyles.containerButtonBlue}>
          <Text style={globalStyles.TitleWhite}>préférences</Text>
        </View>
      </View>
      <TouchableOpacity style={globalStyles.preferenceButton}>
        <Text style={globalStyles.preferenceButtonText}>Confidentialité et modération</Text>
      </TouchableOpacity>
      <TouchableOpacity style={globalStyles.preferenceButton} onPress={() => router.push('/editProfil')}>
        <Text style={globalStyles.preferenceButtonText}>Modifier le compte</Text>
      </TouchableOpacity>
      <TouchableOpacity style={globalStyles.preferenceButton}>
        <Text style={globalStyles.preferenceButtonText} onPress={handleLogout}>Déconnexion</Text>
      </TouchableOpacity>

      {/* <Button
        title="🚪 Se déconnecter"
        onPress={handleLogout}
        color="#f44336"
      /> */}
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
