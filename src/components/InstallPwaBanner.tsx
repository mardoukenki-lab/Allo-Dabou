import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, MoreVertical, PlusSquare, CheckCircle, ExternalLink } from 'lucide-react';
import { triggerHaptic } from '../services/hapticService';

export const InstallPwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

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
    triggerHaptic('medium');
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowGuideModal(true);
    }
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-[#111C2D] via-[#1C2C42] to-[#0D631B] text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-xs">Application Android DABOU VTC</span>
              <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[9px] px-1.5 py-0.2 rounded-md uppercase">
                Chrome PWA
              </span>
            </div>
            <p className="text-white/80 text-[11px] truncate">
              Ajoutez l'app sur l'écran d'accueil pour un accès instantané
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="bg-[#0D631B] hover:bg-[#0A4E15] text-white font-extrabold px-3 py-1.5 rounded-xl text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 border border-emerald-400/30"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>{deferredPrompt ? 'Installer' : 'Guide Android'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setShowBanner(false);
            }}
            className="p-1 text-white/60 hover:text-white cursor-pointer"
            title="Masquer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Android Chrome Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111C2D]/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-[#E4E9EE] overflow-hidden p-5 relative">
            <button
              onClick={() => {
                triggerHaptic('light');
                setShowGuideModal(false);
              }}
              className="absolute top-4 right-4 text-[#5B6B7A] hover:text-[#111C2D] bg-[#F7F8FB] hover:bg-[#E4E9EE] p-1.5 rounded-full transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-[#0D631B]/10 text-[#0D631B] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#0D631B]/20">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-[#111C2D] text-base font-serif-heading">
                Installer sur Android
              </h3>
              <p className="text-xs text-[#5B6B7A]">
                Suivez ces 3 étapes simples depuis Chrome sur votre smartphone Android :
              </p>
            </div>

            <div className="space-y-3 text-xs text-[#111C2D] mb-5">
              <div className="flex items-start gap-3 bg-[#F7F8FB] p-3 rounded-2xl border border-[#E4E9EE]">
                <div className="w-6 h-6 rounded-full bg-[#111C2D] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-bold flex items-center gap-1">
                    Appuyez sur le menu Chrome
                    <MoreVertical className="w-3.5 h-3.5 text-[#0D631B]" />
                  </p>
                  <p className="text-[#5B6B7A] text-[11px]">
                    Les 3 points verticaux en haut à droite de votre navigateur Chrome.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#F7F8FB] p-3 rounded-2xl border border-[#E4E9EE]">
                <div className="w-6 h-6 rounded-full bg-[#111C2D] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-bold flex items-center gap-1">
                    Sélectionnez "Ajouter à l'écran d'accueil"
                    <PlusSquare className="w-3.5 h-3.5 text-[#0D631B]" />
                  </p>
                  <p className="text-[#5B6B7A] text-[11px]">
                    Ou "Installer l'application" dans la liste des options.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#E8F3EA] p-3 rounded-2xl border border-[#D4E8D9]">
                <div className="w-6 h-6 rounded-full bg-[#0D631B] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-bold text-[#0D631B] flex items-center gap-1">
                    Validez l'installation
                    <CheckCircle className="w-3.5 h-3.5 text-[#0D631B]" />
                  </p>
                  <p className="text-[#5B6B7A] text-[11px]">
                    L'icône ALLÔ DABOU VTC apparaîtra directement sur votre écran d'accueil Android !
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowGuideModal(false);
              }}
              className="w-full py-3 bg-[#0D631B] hover:bg-[#0A4E15] text-white font-extrabold text-xs rounded-2xl transition cursor-pointer shadow-sm text-center"
            >
              C'est compris, fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};
