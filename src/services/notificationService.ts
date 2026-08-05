import { Ride } from '../types';
import { formatFcfa } from './pricingService';
import { getMessagingInstance, db } from '../lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';

// In-App Notification Dispatcher Types and Bus
export interface InAppNotificationPayload {
  id?: string;
  title: string;
  body: string;
  type?: 'ride_accepted' | 'ride_completed' | 'driver_order' | 'info' | 'urgent';
  targetTab?: 'booking' | 'confirm' | 'history' | 'account' | 'driver';
  actionLabel?: string;
}

type NotificationListener = (payload: InAppNotificationPayload) => void;
const inAppListeners: Set<NotificationListener> = new Set();

export function subscribeInAppNotifications(listener: NotificationListener) {
  inAppListeners.add(listener);
  return () => {
    inAppListeners.delete(listener);
  };
}

export function emitInAppNotification(payload: InAppNotificationPayload) {
  inAppListeners.forEach((listener) => {
    try {
      listener(payload);
    } catch (e) {
      console.error('Error emitting in-app notification:', e);
    }
  });

  // Also trigger system browser push notification if permitted
  triggerBrowserNotification(payload.title, { body: payload.body });
}

export const DISPATCH_WHATSAPP_NUMBER = '2250101682535'; // Official Dabou Dispatch & Support WhatsApp (0101682535)


/**
 * Registers Firebase Cloud Messaging (FCM) Push Token for the current user
 */
export async function registerFcmTokenForUser(userId: string): Promise<string | null> {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.log('FCM messaging not supported or disabled in this environment.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Browser push notification permission denied.');
      return null;
    }

    // Attempt to retrieve FCM token
    const token = await getToken(messaging, {
      // VAPID key or default web push configuration
    }).catch((err) => {
      console.warn('FCM token generation error (will use Web Push fallback):', err);
      return null;
    });

    if (token && userId) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { fcmToken: token });
      console.log('FCM Token successfully saved for user:', userId);
      return token;
    }

    return null;
  } catch (err) {
    console.warn('Error in registerFcmTokenForUser:', err);
    return null;
  }
}

/**
 * Listens for active foreground FCM push messages
 */
export async function subscribeForegroundFcmMessages(
  onNotificationReceived: (payload: { title: string; body: string }) => void
) {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return () => {};

    return onMessage(messaging, (payload) => {
      console.log('Received FCM foreground notification:', payload);
      const title = payload.notification?.title || 'Allô Dabou VTC';
      const body = payload.notification?.body || 'Nouvelle mise à jour de course';
      onNotificationReceived({ title, body });

      // Trigger Web Push notification if allowed
      triggerBrowserNotification(title, { body });
    });
  } catch (err) {
    console.warn('Error setting up FCM foreground listener:', err);
    return () => {};
  }
}

/**
 * Generates a pre-filled WhatsApp message for quick team assignment
 */
export function generateWhatsAppDispatchUrl(ride: Ride): string {
  const serviceLabel = 
    ride.serviceType === 'delivery' 
      ? '📦 LIVRAISON DE COLIS' 
      : ride.serviceType === 'concierge' 
      ? '🔑 CONCIERGERIE & COURSES' 
      : '🚖 TRANSPORT VTC PASSAGER';

  const text = `*NOUVELLE DEMANDE ALLÔ DABOU VTC*
----------------------------------
📌 *Service:* ${serviceLabel}
🆔 *Réf:* #${ride.id.slice(-6).toUpperCase()}
👤 *Client:* ${ride.userName || 'Client'} (${ride.userPhone || ride.userEmail})
📍 *Départ / Lieu:* ${ride.pickupAddress}
🏁 *Destination / Livraison:* ${ride.destinationAddress}
${ride.serviceType === 'delivery' && ride.packageDetails ? `📦 *Colis à livrer:* ${ride.packageDetails}\n` : ''}${ride.serviceType === 'delivery' && ride.recipientPhone ? `📱 *Tél Destinataire:* ${ride.recipientPhone}\n` : ''}${ride.serviceType === 'concierge' && ride.conciergeTask ? `🛍️ *Course à effectuer:* ${ride.conciergeTask}\n` : ''}📏 *Distance estimée:* ${ride.distanceKm} km (~${ride.durationMin} min)
💰 *Tarif:* ${formatFcfa(ride.priceFcfa)}
${ride.notes ? `📝 *Notes:* ${ride.notes}\n` : ''}----------------------------------
Merci de me confirmer la prise en charge par un coursier/chauffeur.`;

  return `https://wa.me/${DISPATCH_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * Triggers server-side email/webhook notification to the dispatch team
 */
export async function notifyTeamNewBooking(ride: Ride): Promise<boolean> {
  try {
    const res = await fetch('/api/notify-ride', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ride),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not dispatch webhook notification:', err);
    return false;
  }
}

/**
 * Web Audio Synthesizer for instant audible alerts
 */
let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Ensures AudioContext is unlocked by user interaction
 */
export function unlockAudioContext() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

if (typeof window !== 'undefined') {
  const unlockEvents = ['click', 'touchstart', 'touchend', 'keydown'];
  const handleUnlock = () => {
    unlockAudioContext();
    unlockEvents.forEach((evt) => window.removeEventListener(evt, handleUnlock));
  };
  unlockEvents.forEach((evt) => window.addEventListener(evt, handleUnlock, { passive: true }));

  // Auto-register service worker for lockscreen notifications
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  }
}

/**
 * Plays a high-volume repeating horn / siren alert for Driver when a new ride arrives
 */
export function playDriverOrderChime() {
  try {
    unlockAudioContext();
    const ctx = getAudioContext();
    if (!ctx) return;

    const startTime = ctx.currentTime;
    
    // Play 3 loud siren pulses (duration ~2.1 seconds)
    for (let pulse = 0; pulse < 3; pulse++) {
      const pStart = startTime + pulse * 0.7;

      // High siren oscillator 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(880, pStart); // A5
      osc1.frequency.exponentialRampToValueAtTime(1318.51, pStart + 0.25); // E6
      
      gain1.gain.setValueAtTime(0.8, pStart);
      gain1.gain.exponentialRampToValueAtTime(0.01, pStart + 0.5);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(pStart);
      osc1.stop(pStart + 0.5);

      // Low harmonic oscillator 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(659.25, pStart + 0.1); // E5
      osc2.frequency.exponentialRampToValueAtTime(1046.50, pStart + 0.35); // C6

      gain2.gain.setValueAtTime(0.7, pStart + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, pStart + 0.55);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(pStart + 0.1);
      osc2.stop(pStart + 0.55);
    }

    // Trigger physical device vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([600, 150, 600, 150, 600, 150, 1000]);
    }
  } catch (e) {
    console.warn('Audio chime playback failed:', e);
  }
}

/**
 * Plays a pleasant high-volume success chime for Client when ride is accepted
 */
export function playClientAcceptedChime() {
  try {
    unlockAudioContext();
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Chord G4 -> B4 -> D5 -> G5 bright chord
    const freqs = [392.00, 493.88, 587.33, 783.99];
    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.12);
      gain.gain.setValueAtTime(0.7, now + index * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + index * 0.12);
      osc.stop(now + index * 0.12 + 0.7);
    });

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([300, 100, 300, 100, 500]);
    }
  } catch (e) {
    console.warn('Client chime playback failed:', e);
  }
}

/**
 * Requests browser push notification permissions
 */
export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Triggers a browser/service worker lock screen notification
 */
export async function triggerBrowserNotification(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const defaultOptions: NotificationOptions & Record<string, any> = {
        icon: '/pwa-icon.svg',
        badge: '/pwa-icon.svg',
        vibrate: [600, 150, 600, 150, 600, 150, 1000],
        requireInteraction: true,
        renotify: true,
        tag: 'allo-dabou-ride-alert',
        ...options,
      };

      // Prefer Service Worker registration for Lock Screen & Background push
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready.catch(() => null);
        if (registration && 'showNotification' in registration) {
          await registration.showNotification(title, defaultOptions);
          return;
        }
      }

      // Fallback to standard window Notification
      new Notification(title, defaultOptions);
    } catch (err) {
      console.warn('Browser push notification error:', err);
    }
  }
}

