/**
 * Haptic Feedback Service for Android Native Feel
 */

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

export const triggerHaptic = (type: HapticType = 'light') => {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'light':
      case 'selection':
        navigator.vibrate(12);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate(40);
        break;
      case 'success':
        navigator.vibrate([15, 50, 20]);
        break;
      case 'warning':
        navigator.vibrate([25, 40, 25]);
        break;
      case 'error':
        navigator.vibrate([40, 60, 40, 60, 40]);
        break;
      default:
        navigator.vibrate(15);
    }
  } catch (err) {
    // Silent fail if vibration permissions or user gesture is missing
  }
};
