import { Ride } from '../types';
import { formatFcfa } from './pricingService';
import { getMessagingInstance, db } from '../lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';

export const DISPATCH_WHATSAPP_NUMBER = '2250700000000'; // Official Dabou Dispatch WhatsApp

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

function getAudioContext(): AudioContext | null {
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
 * Plays a loud double chime for Driver when a new ride arrives
 */
export function playDriverOrderChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Note 1: E5 (659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Note 2: A5 (880Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    gain2.gain.setValueAtTime(0.5, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.6);

    // Note 3: C#6 (1108.73Hz)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(1108.73, now + 0.35);
    gain3.gain.setValueAtTime(0.6, now + 0.35);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.35);
    osc3.stop(now + 0.9);
  } catch (e) {
    console.warn('Audio chime playback failed:', e);
  }
}

/**
 * Plays a pleasant success chime for Client when ride is accepted
 */
export function playClientAcceptedChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Chord G4 -> B4 -> D5
    const freqs = [392.00, 493.88, 587.33];
    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.1);
      gain.gain.setValueAtTime(0.4, now + index * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + index * 0.1);
      osc.stop(now + index * 0.1 + 0.5);
    });
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
 * Triggers a browser push notification
 */
export function triggerBrowserNotification(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (err) {
      console.warn('Browser push error:', err);
    }
  }
}
