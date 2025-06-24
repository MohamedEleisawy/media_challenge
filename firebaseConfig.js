import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth/react-native";
import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";  // <-- Import de getStorage ajouté
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
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
// export const storage = getStorage(app);  // <-- Initialisation et export du storage