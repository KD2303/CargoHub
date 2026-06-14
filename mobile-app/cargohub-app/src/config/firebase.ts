import { initializeApp, getApps, getApp } from 'firebase/app';
// removed top-level auth imports
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDjKAcjV950Kk-P3LeLTbwurURBrrTKMak",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "cargo-hub-app.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "cargo-hub-app",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "cargo-hub-app.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "443821391360",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:443821391360:android:179597721af2cf44e022e5",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let auth: any;

if (Platform.OS === 'web') {
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
} else {
  const { initializeAuth, getReactNativePersistence, getAuth } = require('firebase/auth');
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (error: any) {
    // If auth is already initialized
    if (error.code === 'auth/already-initialized') {
      auth = getAuth(app);
    } else {
      throw error;
    }
  }
}

export { app, auth };
