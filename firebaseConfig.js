// Import des modules Firebase nécessaires
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Configuration Firebase (ne la publie pas en public)
const firebaseConfig = {
  apiKey: "AIzaSyCEZoku3JPgmAQAvZLALFEEg2E4U099QLg",
  authDomain: "media-challenge-27fb4.firebaseapp.com",
  projectId: "media-challenge-27fb4",
  storageBucket: "media-challenge-27fb4.appspot.com",
  messagingSenderId: "25949980327",
  appId: "1:25949980327:web:e2cfdcf5dba8c3ba34bd82",
  measurementId: "G-GHJRH6XCC2"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Initialisation des services que tu veux utiliser
export const auth = getAuth(app); // Authentification
export const db = getFirestore(app); // Firestore pour stocker les infos utilisateur
// const analytics = getAnalytics(app); // Optionnel
