import React, { useState } from 'react';
import { Star, X, CheckCircle2, Loader2, MessageSquare, Bike, Award } from 'lucide-react';
import { Ride } from '../types';
import { submitRideRating } from '../services/rideService';

interface RideRatingModalProps {
  ride: Ride;
  isOpen: boolean;
  onClose: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Décevant 😞',
  2: 'Moyen 😐',
  3: 'Bien 🙂',
  4: 'Très bien ! 😊',
  5: 'Excellent, parfait ! 🌟',
};

export const RideRatingModal: React.FC<RideRatingModalProps> = ({ ride, isOpen, onClose }) => {
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [hoverStars, setHoverStars] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStars < 1 || selectedStars > 5) {
      setErrorMsg('Veuillez sélectionner au moins 1 étoile.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await submitRideRating(ride.id, selectedStars, comment);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de l’envoi de votre évaluation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStars = hoverStars || selectedStars;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111C2D]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl border border-[#E4E9EE] overflow-hidden p-5 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#5B6B7A] hover:text-[#111C2D] bg-[#F7F8FB] hover:bg-[#E8F3EA] p-1.5 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-[#E8F3EA] text-[#0D631B] rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-[#111C2D] text-lg font-serif-heading">
              Merci pour votre avis !
            </h3>
            <p className="text-xs text-[#5B6B7A] max-w-xs mx-auto">
              Votre note a bien été enregistrée et transmise dans le profil de {ride.driverName || 'votre chauffeur'}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center space-y-1 pt-1">
              <div className="w-10 h-10 bg-[#E8F3EA] text-[#0D631B] rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-[#111C2D] text-base font-serif-heading">
                Évaluer votre course
              </h3>
              {ride.driverName && (
                <p className="text-xs font-semibold text-[#5B6B7A]">
                  Chauffeur : <span className="text-[#111C2D] font-bold">{ride.driverName}</span>
                </p>
              )}
            </div>

            {/* Stars selection */}
            <div className="bg-[#F7F8FB] p-4 rounded-2xl border border-[#E4E9EE] text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedStars(star)}
                    onMouseEnter={() => setHoverStars(star)}
                    onMouseLeave={() => setHoverStars(0)}
                    className="p-1 transition-transform transform active:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= activeStars
                          ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                          : 'fill-gray-200 text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold text-amber-700 min-h-[18px]">
                {RATING_LABELS[activeStars] || ''}
              </p>
            </div>

            {/* Optional Comment */}
            <div>
              <label className="text-[11px] font-bold text-[#111C2D] block mb-1 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-[#0D631B]" />
                <span>Remarque ou compliment (optionnel) :</span>
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chauffeur ponctuel, conduite prudente..."
                className="w-full px-3 py-2 bg-[#F7F8FB] border border-[#E4E9EE] rounded-xl text-xs font-medium text-[#111C2D] outline-none focus:border-[#0D631B]"
              />
            </div>

            {errorMsg && (
              <p className="text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-xl text-center">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#0D631B] hover:bg-[#0A4E15] text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 transition shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Envoi de l'évaluation...</span>
                </>
              ) : (
                <span>Envoyer l'évaluation (⭐ {selectedStars}/5)</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
