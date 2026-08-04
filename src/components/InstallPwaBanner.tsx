import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const InstallPwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="bg-[#0D631B] text-white px-4 py-3 shadow-xs flex items-center justify-between text-xs sm:text-sm border-b border-[#0A4E15]">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-white/15 rounded-xl border border-white/20">
          <Download className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-bold block font-serif-heading">Installer l’application Android</span>
          <span className="text-white/80 text-[11px]">Accès rapide directement depuis l'écran d'accueil</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="bg-white text-[#0D631B] font-bold px-3.5 py-1.5 rounded-full text-xs shadow-xs hover:bg-[#F7F8FB] transition cursor-pointer"
        >
          Installer
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="p-1 text-white/70 hover:text-white cursor-pointer"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

