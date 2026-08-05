import React, { useState, useEffect } from 'react';
import { Bell, Volume2, ShieldCheck, Check, Sparkles, VolumeX } from 'lucide-react';
import { requestPushPermission, playDriverOrderChime, triggerBrowserNotification, unlockAudioContext, emitInAppNotification } from '../services/notificationService';

export const NotificationPermissionBanner: React.FC = () => {
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');
  const [dismissed, setDismissed] = useState(false);
  const [testedSound, setTestedSound] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    } else {
      setPermissionState('unsupported');
    }
  }, []);

  if (dismissed || permissionState === 'unsupported') {
    return null;
  }

  const handleEnable = async () => {
    unlockAudioContext();
    const granted = await requestPushPermission();
    if (granted) {
      setPermissionState('granted');
      playDriverOrderChime();
      emitInAppNotification({
        title: '🔔 Alertes Sonores et Écran Verrouillé Activées !',
        body: 'Vous recevrez désormais des signaux sonores forts et des bannières interactives en direct.',
        type: 'info',
      });
    } else if (Notification.permission === 'denied') {
      setPermissionState('denied');
    }
  };

  const handleTestSound = () => {
    unlockAudioContext();
    playDriverOrderChime();
    setTestedSound(true);
    emitInAppNotification({
      title: '🔊 Test du Signal Sonore Allô Dabou VTC',
      body: 'Le synthétiseur audio et les vibrations fonctionnent parfaitement sur votre appareil.',
      type: 'info',
    });
    setTimeout(() => setTestedSound(false), 3000);
  };

  if (permissionState === 'granted') {
    return (
      <div className="bg-[#0D631B]/10 border-b border-[#0D631B]/20 text-[#0D631B] px-4 py-2 text-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0D631B] shrink-0" />
          <span className="font-bold">Notifications & Alertes Sonores : <strong className="text-[#0D631B]">Activées</strong></span>
        </div>
        <button
          type="button"
          onClick={handleTestSound}
          className="bg-[#0D631B] hover:bg-[#0A4E15] text-white font-bold px-2.5 py-1 rounded-xl text-[11px] flex items-center gap-1 transition shadow-2xs"
        >
          <Volume2 className="w-3 h-3 text-amber-300" />
          <span>{testedSound ? '🔊 Test en cours...' : 'Tester le son'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#111C2D] via-[#1A2B42] to-[#0D631B] text-white p-3.5 sm:px-5 sm:py-3 shadow-md border-b border-white/10 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300">
      <div className="flex items-start sm:items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-amber-400 text-[#111C2D] flex items-center justify-center font-bold shrink-0 animate-bounce">
          <Bell className="w-4 h-4 fill-current" />
        </div>
        <div>
          <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
            <span>Activer les notifications sonores & écran verrouillé</span>
            <span className="bg-amber-400 text-[#111C2D] text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md">Recommandé</span>
          </h4>
          <p className="text-white/80 text-[11px] leading-tight">
            Ne manquez aucune course ou confirmation même quand l'application est en arrière-plan ou l'écran verrouillé.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={handleTestSound}
          className="bg-white/15 hover:bg-white/25 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition border border-white/20"
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-300" />
          <span>{testedSound ? '🔊 Test du son...' : 'Tester le son'}</span>
        </button>

        <button
          type="button"
          onClick={handleEnable}
          className="bg-[#0D631B] hover:bg-[#0A4E15] text-white font-extrabold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm border border-emerald-400/30"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Activer maintenant</span>
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-white/60 hover:text-white p-1 text-xs"
          title="Fermer"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

