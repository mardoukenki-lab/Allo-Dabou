import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getMessaging, isSupported, Messaging } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with specific database ID and long polling for iframe reliability
export const db = (() => {
  try {
    const dbId = firebaseConfig.firestoreDatabaseId || undefined;
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, dbId);
  } catch (err) {
    return firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  }
})();

// Connection test
if (typeof window !== 'undefined') {
  getDocFromServer(doc(db, '_connection_test', 'ping')).catch((err) => {
    if (err instanceof Error && err.message.includes('the client is offline')) {
      console.warn('Firestore connection warning:', err.message);
    }
  });
}

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
