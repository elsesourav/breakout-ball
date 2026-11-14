import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Official Firebase configuration for Breakout Ball
 * Project ID: breakout-ball (Standard Cloud Firestore Native)
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyBGy5_GyHzwNsDECkbR8my_PSWYYaCdAPM',
  authDomain: 'breakout-ball.firebaseapp.com',
  projectId: 'breakout-ball',
  storageBucket: 'breakout-ball.firebasestorage.app',
  messagingSenderId: '139813194858',
  appId: '1:139813194858:web:7def41428420668b41ce13',
  measurementId: 'G-7MV0LWSTR6',
};

// Initialize single Firebase instance
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Cloud Firestore native database instance (replaces legacy Realtime Database)
export const firestoreDb = getFirestore(firebaseApp);

// Firebase Authentication instance
export const firebaseAuth = getAuth(firebaseApp);
