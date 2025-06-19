import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../authContext'; // 🔁 adapte ce chemin si besoin
import Toast from 'react-native-root-toast';
import { useRouter } from "expo-router";



export default function ProfileScreen() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'users', user.uid );
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
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
    
    router.replace("/"); // ✅ Redirection vers la page d'accueil (index.tsx)
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
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profil</Text>
      <Text style={styles.info}>📧 Email : {user?.email}</Text>
      <Text style={styles.info}>🧑 Prénom : {userData?.prenom}</Text>
      <Text style={styles.info}>👨 Nom : {userData?.nom}</Text>
      <Button title="🚪 Se déconnecter" onPress={handleLogout} color="#f44336" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  info: { fontSize: 18, marginBottom: 10 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
