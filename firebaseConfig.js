// Configuration Firebase minimale sans AsyncStorage
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; // ← ajoute cette ligne
// import { getReactNativePersistence, initializeAuth } from 'firebase/auth/react-native';
import { getReactNativePersistence, initializeAuth } from "firebase/auth"
import AsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: "AIzaSyCEZoku3JPgmAQAvZLALFEEg2E4U099QLg",
  authDomain: "media-challenge-27fb4.firebaseapp.com",
  projectId: "media-challenge-27fb4",
  storageBucket: "media-challenge-27fb4.appspot.com",
  messagingSenderId: "25949980327",
  appId: "1:25949980327:web:e2cfdcf5dba8c3ba34bd82",
  measurementId: "G-GHJRH6XCC2"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app); // ← ajoute ceci

export { auth, db }; // ← exporte bien les deux