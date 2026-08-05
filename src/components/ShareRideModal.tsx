import React, { useState } from 'react';
import { Share2, MessageSquare, Phone, Copy, Check, X, ShieldCheck, MapPin } from 'lucide-react';
import { Ride } from '../types';

interface ShareRideModalProps {
  ride: Ride;
  isOpen: boolean;
  onClose: () => void;
}

const SERVICE_LABELS: Record<string, string> = {
  moto: 'Moto Express 🛵',
  tricycle: 'Tricycle Cargo 🛺',
  vtc: 'VTC Confort 🚘',
  delivery: 'Livraison de Colis 📦',
  concierge: 'Service de Course 🔑',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En recherche de chauffeur ⏳',
  accepted: 'Chauffeur en route 🚕',
  in_progress: 'Course en cours 🏁',
  completed: 'Course terminée avec succès ✅',
  cancelled: 'Course annulée ❌',
};

export const ShareRideModal: React.FC<ShareRideModalProps> = ({ ride, isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const statusText = STATUS_LABELS[ride.status] || ride.status;
  const serviceText = SERVICE_LABELS[ride.serviceType] || 'Transport';

  // Construct formatted plain-text ride summary
  const summaryText = [
    `🚖 *ALLO DABOU VTC - Récapitulatif de Trajet* 🚖`,
    ``,
    `📋 *Type de service :* ${serviceText}`,
    `📍 *Départ :* ${ride.pickupAddress}`,
    `🏁 *Destination :* ${ride.destinationAddress}`,
    `💰 *Tarif :* ${ride.priceFcfa.toLocaleString('fr-FR')} FCFA (${ride.distanceKm} km)`,
    `🚦 *Statut :* ${statusText}`,
    ride.driverName
      ? `👨‍✈️ *Chauffeur :* ${ride.driverName}\n🚘 *Plaque / Véhicule :* ${ride.driverVehiclePlate || 'Non renseignée'}${ride.driverPhone ? `\n📞 *Tél :* ${ride.driverPhone}` : ''}`
      : `⌛ *Chauffeur :* En cours d'attribution par le dispatching`,
    ``,
    `📱 Commandez et suivez vos courses à Dabou sur ALLO DABOU VTC !`
  ].join('\n');

  const encodedText = encodeURIComponent(summaryText);
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  const smsUrl = `sms:?body=${encodedText}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mon Trajet ALLO DABOU VTC',
          text: summaryText,
        });
      } catch (err) {
        // Share cancelled or failed
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111C2D]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl border border-[#E4E9EE] overflow-hidden p-5 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#5B6B7A] hover:text-[#111C2D] bg-[#F7F8FB] hover:bg-[#E8F3EA] p-1.5 rounded-full transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1 pt-1 mb-4">
          <div className="w-11 h-11 bg-[#E8F3EA] text-[#0D631B] rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-2xs">
            <Share2 className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-[#111C2D] text-base font-serif-heading">
            Partager mon trajet
          </h3>
          <p className="text-xs text-[#5B6B7A]">
            Envoyez la fiche de votre course (destination, prix, chauffeur) à vos proches.
          </p>
        </div>

        {/* Ride Preview Card */}
        <div className="bg-[#F7F8FB] p-3.5 rounded-2xl border border-[#E4E9EE] text-xs space-y-2 mb-4 text-[#111C2D]">
          <div className="flex items-center justify-between font-bold border-b border-[#E4E9EE] pb-2 text-[11px]">
            <span className="text-[#0D631B] uppercase tracking-wider">{serviceText}</span>
            <span className="bg-[#0D631B]/10 text-[#0D631B] px-2 py-0.5 rounded-lg">{ride.priceFcfa.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 font-medium truncate">
              <span className="w-2 h-2 rounded-full bg-[#0D631B] shrink-0" />
              <span>{ride.pickupAddress}</span>
            </p>
            <p className="flex items-center gap-1.5 font-medium truncate">
              <span className="w-2 h-2 rounded-full bg-[#111C2D] shrink-0" />
              <span>{ride.destinationAddress}</span>
            </p>
          </div>
          {ride.driverName && (
            <div className="pt-1.5 border-t border-[#E4E9EE] flex items-center justify-between text-[11px]">
              <span className="text-[#5B6B7A]">Chauffeur : <strong className="text-[#111C2D]">{ride.driverName}</strong></span>
              {ride.driverVehiclePlate && (
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-[#E4E9EE]">
                  {ride.driverVehiclePlate}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* WhatsApp Share Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 transition shadow-xs"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Partager via WhatsApp</span>
          </a>

          {/* SMS Share Button */}
          <a
            href={smsUrl}
            className="w-full py-3 px-4 bg-[#111C2D] hover:bg-[#1C2C42] text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 transition shadow-xs"
          >
            <Phone className="w-4 h-4" />
            <span>Envoyer par SMS</span>
          </a>

          {/* Native Web Share API if supported */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 bg-[#E8F3EA] hover:bg-[#D4E8D9] text-[#0D631B] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Autres applications de partage</span>
            </button>
          )}

          {/* Copy text fallback */}
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-2.5 px-4 bg-[#F7F8FB] hover:bg-[#E4E9EE] text-[#5B6B7A] hover:text-[#111C2D] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer border border-[#E4E9EE]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#0D631B]" />
                <span className="text-[#0D631B]">Récapitulatif copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copier le résumé du trajet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
