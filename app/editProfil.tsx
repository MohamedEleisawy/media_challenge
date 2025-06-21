import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-root-toast';
import { useAuth } from '../authContext';
import { db } from '../firebaseConfig';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<{ pseudo: string }>({ pseudo: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data() as any);
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

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, userData);
      Toast.show('✅ Profil mis à jour avec succès.', {
        backgroundColor: "#4CAF50",
        textColor: "white",
      });
      router.back();
    } catch (error: any) {
      Toast.show(`❌ ${error.message}`, {
        backgroundColor: "#f44336",
        textColor: "white",
      });
    } finally {
      setSaving(false);
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
      <Text style={styles.title}>👤 Modifier le Profil</Text>
   
      <TextInput
        style={styles.input}
        placeholder="Pseudo"
        value={userData.pseudo}
        onChangeText={(text) => setUserData({ ...userData, pseudo: text })}
      />
      <Button
        title={saving ? "Enregistrement..." : "💾 Enregistrer"}
        onPress={handleSave}
        color="#4CAF50"
        disabled={saving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
