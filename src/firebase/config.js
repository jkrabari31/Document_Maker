// Firebase Configuration
// ⚠️ Replace these values with your actual Firebase project credentials
// Go to: https://console.firebase.google.com → Your Project → Project Settings → General → Your Apps → Firebase SDK snippet

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyAzeugV5Q6hNOTPIpaBqi7GuWBwWVDBqaM",
  authDomain: "dastavejmaster.firebaseapp.com",
  projectId: "dastavejmaster",
  storageBucket: "dastavejmaster.firebasestorage.app",
  messagingSenderId: "986406826291",
  appId: "1:986406826291:web:d77ef77e648f7c7d214e46"
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  !firebaseConfig.apiKey.startsWith("YOUR_")
);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

