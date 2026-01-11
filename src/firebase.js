// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAqsJGhVAX0wb634RtlEWtIx35z7p3NDkw",
  authDomain: "yuanlabweb.firebaseapp.com",
  projectId: "yuanlabweb",
  storageBucket: "yuanlabweb.firebasestorage.app",
  messagingSenderId: "1038497833108",
  appId: "1:1038497833108:web:60ed5e09459439d4c71481",
  measurementId: "G-89LXFD0C3K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
