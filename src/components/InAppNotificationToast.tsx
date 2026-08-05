import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Car, Clock, ShieldAlert, X, ChevronRight, Volume2 } from 'lucide-react';
import { subscribeInAppNotifications, InAppNotificationPayload, unlockAudioContext, playDriverOrderChime, playClientAcceptedChime } from '../services/notificationService';

interface InAppNotificationToastProps {
  onNavigateTab?: (tab: 'booking' | 'confirm' | 'history' | 'account' | 'driver') => void;
}

export const InAppNotificationToast: React.FC<InAppNotificationToastProps> = ({ onNavigateTab }) => {
  const [currentNotification, setCurrentNotification] = useState<InAppNotificationPayload | null>(null);

  useEffect(() => {
    const unsub = subscribeInAppNotifications((payload) => {
      setCurrentNotification(payload);

      // Play sound and vibration based on type
      unlockAudioContext();
      if (payload.type === 'driver_order' || payload.type === 'urgent') {
        playDriverOrderChime();
      } else {
        playClientAcceptedChime();
      }

      // Auto dismiss after 8 seconds
      const timer = setTimeout(() => {
        setCurrentNotification(null);
      }, 8000);

      return () => clearTimeout(timer);
    });

    return () => unsub();
  }, []);

  if (!currentNotification) return null;

  const getIcon = () => {
    switch (currentNotification.type) {
      case 'ride_accepted':
        return <Car className="w-5 h-5 text-emerald-400" />;
      case 'ride_completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'driver_order':
        return <Bell className="w-5 h-5 text-amber-300 animate-bounce" />;
      default:
        return <Bell className="w-5 h-5 text-emerald-400" />;
    }
  };

  const handleActionClick = () => {
    if (currentNotification.targetTab && onNavigateTab) {
      onNavigateTab(currentNotification.targetTab);
    }
    setCurrentNotification(null);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in slide-in-from-top duration-300">
      <div className="bg-[#111C2D] text-white p-4 rounded-3xl shadow-2xl border border-emerald-500/30 backdrop-blur-md relative overflow-hidden flex items-start gap-3">
        {/* Glow bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0D631B] via-emerald-400 to-amber-400" />

        {/* Icon */}
        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 mt-0.5">
          {getIcon()}
        </div>

        {/* Text Body */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h4 className="font-bold text-xs text-white truncate">{currentNotification.title}</h4>
            <span className="inline-flex items-center gap-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold px-1.5 py-0.2 rounded-md uppercase">
              <Volume2 className="w-2.5 h-2.5" />
              Direct
            </span>
          </div>
          <p className="text-white/80 text-[11px] leading-snug line-clamp-2">
            {currentNotification.body}
          </p>

          {currentNotification.targetTab && (
            <button
              type="button"
              onClick={handleActionClick}
              className="mt-2 text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 transition"
            >
              <span>{currentNotification.actionLabel || 'Voir la course'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setCurrentNotification(null)}
          className="text-white/50 hover:text-white p-1 rounded-full transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
