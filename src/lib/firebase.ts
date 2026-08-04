import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported, Messaging } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with specific database ID if present in config
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Messaging (FCM)
let messagingPromise: Promise<Messaging | null> | null = null;
export const getMessagingInstance = async (): Promise<Messaging | null> => {
  if (typeof window === 'undefined') return null;
  if (!messagingPromise) {
    messagingPromise = isSupported().then((supported) => {
      if (supported) {
        return getMessaging(app);
      }
      return null;
    }).catch((err) => {
      console.warn('FCM Messaging is not supported in this browser environment:', err);
      return null;
    });
  }
  return messagingPromise;
};

export default app;
