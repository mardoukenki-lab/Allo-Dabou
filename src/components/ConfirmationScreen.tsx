import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  Phone, 
  User, 
  FileText, 
  Loader2, 
  MessageSquare, 
  Bike, 
  Package,
  KeyRound,
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createRide } from '../services/rideService';
import { generateWhatsAppDispatchUrl, notifyTeamNewBooking } from '../services/notificationService';
import { PricingCalculation, Ride, ServiceType } from '../types';

interface ConfirmationScreenProps {
  pickup: string;
  destination: string;
  pricing: PricingCalculation;
  serviceType?: ServiceType;
  packageDetails?: string;
  recipientPhone?: string;
  conciergeTask?: string;
  onBack: () => void;
  onRideBookedSuccess: (ride: Ride) => void;
  onOpenAuth: () => void;
  onViewHistory?: () => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  pickup,
  destination,
  pricing,
  serviceType = 'vtc',
  packageDetails = '',
  recipientPhone = '',
  conciergeTask = '',
  onBack,
  onRideBookedSuccess,
  onOpenAuth,
  onViewHistory,
}) => {
  const { user, userProfile } = useAuth();
  const [userName, setUserName] = useState<string>(userProfile?.displayName || '');
  const [userPhone, setUserPhone] = useState<string>(userProfile?.phone || '');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookedRide, setBookedRide] = useState<Ride | null>(null);

  const handleConfirmRide = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!userPhone.trim()) {
      setErrorMsg('Veuillez entrer votre numéro de téléphone pour que le chauffeur ou le livreur puisse vous joindre.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const ride = await createRide({
        userId: user.uid,
        userEmail: user.email || '',
        userName: userName.trim() || user.displayName || 'Client',
        userPhone: userPhone.trim(),
        pickupAddress: pickup,
        destinationAddress: destination,
        distanceKm: pricing.distanceKm,
        durationMin: pricing.durationMin,
        priceFcfa: pricing.finalPriceFcfa,
        notes: notes.trim(),
        serviceType: (serviceType || 'vtc') as ServiceType,
        packageDetails,
        recipientPhone,
        conciergeTask,
      });

      // Dispatch webhook notification to team
      await notifyTeamNewBooking(ride);

      setBookedRide(ride);
      onRideBookedSuccess(ride);
    } catch (err: any) {
      console.error('Error saving ride:', err);
      setErrorMsg(err.message || 'Échec de la réservation. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already booked, show confirmation receipt
  if (bookedRide) {
    const waUrl = generateWhatsAppDispatchUrl(bookedRide);

    return (
      <div className="space-y-6 pb-24 sm:pb-8">
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#E5E5DE] shadow-xs text-center space-y-5">
          <div className="w-16 h-16 bg-[#E8F3EA] text-[#0D631B] rounded-full flex items-center justify-center mx-auto border border-[#D4E8D9]">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-[#E8F3EA] text-[#0D631B] font-extrabold text-xs rounded-full uppercase tracking-widest mb-2 border border-[#D4E8D9]">
              Réf: #{bookedRide.id.slice(-6).toUpperCase()}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111C2D] font-serif-heading">
              {serviceType === 'delivery' && 'Livraison Enregistrée !'}
              {serviceType === 'concierge' && 'Conciergerie Enregistrée !'}
              {serviceType === 'vtc' && 'Course VTC Confirmée !'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6B7A] mt-1.5">
              Votre demande a été transmise à notre centrale. Un coursier/chauffeur Allô Dabou va prendre contact avec vous.
            </p>
          </div>

          {/* Ride Details Card */}
          <div className="p-5 bg-[#F7F8FB] rounded-2xl border border-[#E4E9EE] text-left space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-[#E5E5DE] pb-2">
              <span className="text-[#5B6B7A] font-medium">Service :</span>
              <span className="font-bold text-[#0D631B]">
                {serviceType === 'delivery' && '📦 Livraison de Colis'}
                {serviceType === 'concierge' && '🔑 Conciergerie / Courses'}
                {(serviceType === 'taxi' || serviceType === 'vtc') && '🚖 Transport Taxi VTC Passager'}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#E5E5DE] pb-2">
              <span className="text-[#5B6B7A] font-medium">Départ / Lieu :</span>
              <span className="font-bold text-[#111C2D]">{bookedRide.pickupAddress}</span>
            </div>
            <div className="flex justify-between border-b border-[#E5E5DE] pb-2">
              <span className="text-[#5B6B7A] font-medium">Destination / Remise :</span>
              <span className="font-bold text-[#111C2D]">{bookedRide.destinationAddress}</span>
            </div>

            {bookedRide.packageDetails && (
              <div className="flex justify-between border-b border-[#E5E5DE] pb-2">
                <span className="text-[#5B6B7A] font-medium">Colis :</span>
                <span className="font-bold text-[#111C2D]">{bookedRide.packageDetails}</span>
              </div>
            )}

            {bookedRide.recipientPhone && (
              <div className="flex justify-between border-b border-[#E5E5DE] pb-2">
                <span className="text-[#5B6B7A] font-medium">Destinataire :</span>
                <span className="font-bold text-[#111C2D]">{bookedRide.recipientPhone}</span>
              </div>
            )}

            {bookedRide.conciergeTask && (
              <div className="flex justify-between border-b border-[#E5E5DE] pb-2">
                <span className="text-[#5B6B7A] font-medium">Course :</span>
                <span className="font-bold text-[#111C2D]">{bookedRide.conciergeTask}</span>
              </div>
            )}

            {bookedRide.driverName && (
              <div className="border-b border-[#E5E5DE] pb-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#5B6B7A] font-medium">Chauffeur assigné :</span>
                  <span className="font-bold text-[#111C2D]">{bookedRide.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B6B7A] font-medium">Plaque d'immatriculation :</span>
                  <span className="font-mono font-extrabold text-[#0D631B]">
                    {bookedRide.driverVehiclePlate || 'En attente'}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-between border-b border-[#E5E5DE] pb-2">
              <span className="text-[#5B6B7A] font-medium">Distance :</span>
              <span className="font-bold text-[#111C2D]">{bookedRide.distanceKm} km</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#111C2D] font-bold">Tarif au coursier/chauffeur :</span>
              <span className="text-lg font-bold text-[#0D631B] font-serif-heading">
                {bookedRide.priceFcfa.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (onViewHistory) {
                  onViewHistory();
                } else {
                  onBack();
                }
              }}
              className="w-full py-3.5 px-4 bg-[#0D631B] hover:bg-[#0A4E15] text-white font-bold rounded-2xl text-xs shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Voir le statut de la commande</span>
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-[#E8F3EA] hover:bg-[#D4E8D9] text-[#0D631B] font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contacter le Dispatch sur WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={onBack}
              className="w-full py-3 px-4 bg-[#F7F8FB] hover:bg-[#E8F3EA] text-[#111C2D] hover:text-[#0D631B] font-bold rounded-2xl text-xs border border-[#E4E9EE] transition cursor-pointer"
            >
              Passer une autre commande
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      {/* Top Header Navigation */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2.5 bg-white hover:bg-[#E8F3EA] rounded-2xl border border-[#E5E5DE] text-[#0D631B] transition shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#111C2D] font-serif-heading">Récapitulatif de la commande</h2>
          <p className="text-xs text-[#5B6B7A]">Vérifiez les informations avant validation</p>
        </div>
      </div>

      {/* Main Recap Card */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#E5E5DE] shadow-xs space-y-5">
        {/* Service Badge Header */}
        <div className="p-3 bg-[#E8F3EA] rounded-2xl border border-[#D4E8D9] flex items-center gap-2 text-xs font-bold text-[#0D631B]">
          {serviceType === 'delivery' && <Package className="w-4 h-4" />}
          {serviceType === 'concierge' && <KeyRound className="w-4 h-4" />}
          {(serviceType === 'taxi' || serviceType === 'vtc') && <Bike className="w-4 h-4" />}
          <span>
            {serviceType === 'delivery' && 'Service : Livraison de Colis Express'}
            {serviceType === 'concierge' && 'Service : Conciergerie & Procourses'}
            {(serviceType === 'taxi' || serviceType === 'vtc') && 'Service : Transport Taxi VTC Passager'}
          </span>
        </div>

        {/* Route Details */}
        <div className="space-y-3 bg-[#F7F8FB] p-5 rounded-2xl border border-[#E4E9EE]">
          <div className="flex items-start gap-3">
            <span className="w-3 h-3 rounded-full bg-[#0D631B] mt-1 flex-shrink-0" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5B6B7A]">
                {serviceType === 'delivery' ? 'Point de ramassage' : 'Point de départ / Lieu d’achat'}
              </span>
              <p className="text-sm font-bold text-[#111C2D]">{pickup}</p>
            </div>
          </div>

          <div className="pl-1.5 border-l-2 border-dashed border-[#E5E5DE] ml-1 py-1" />

          <div className="flex items-start gap-3">
            <span className="w-3 h-3 rounded-full bg-[#111C2D] mt-1 flex-shrink-0" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5B6B7A]">
                {serviceType === 'delivery' ? 'Adresse de livraison' : 'Destination / Remise'}
              </span>
              <p className="text-sm font-bold text-[#111C2D]">{destination}</p>
            </div>
          </div>

          {serviceType === 'delivery' && packageDetails && (
            <div className="pt-2 border-t border-[#E5E5DE] text-xs">
              <span className="text-[#5B6B7A] font-bold">Colis : </span>
              <span className="text-[#111C2D]">{packageDetails}</span>
            </div>
          )}

          {serviceType === 'delivery' && recipientPhone && (
            <div className="text-xs">
              <span className="text-[#5B6B7A] font-bold">Tél Destinataire : </span>
              <span className="text-[#111C2D]">{recipientPhone}</span>
            </div>
          )}

          {serviceType === 'concierge' && conciergeTask && (
            <div className="pt-2 border-t border-[#E5E5DE] text-xs">
              <span className="text-[#5B6B7A] font-bold">Details de la commission : </span>
              <span className="text-[#111C2D]">{conciergeTask}</span>
            </div>
          )}
        </div>

        {/* Pricing & Distance Badge */}
        <div className="p-5 bg-[#E8F3EA] rounded-2xl border border-[#D4E8D9] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#0D631B] block">
              Distance : {pricing.distanceKm} km (~{pricing.durationMin} min)
            </span>
            <span className="text-[11px] text-[#5B6B7A]">Paiement en espèces direct à la livraison</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-[#0D631B] font-serif-heading">
              {pricing.formattedPrice}
            </span>
          </div>
        </div>

        {/* Contact Information Form */}
        <div className="space-y-3.5 pt-2">
          <h3 className="text-xs font-extrabold uppercase text-[#5B6B7A] tracking-wider">
            Informations de contact client
          </h3>

          <div>
            <label className="text-xs font-bold text-[#111C2D] block mb-1">Votre Nom</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ex: Kouassi Jean"
                className="w-full pl-10 pr-4 py-3 bg-[#F7F8FB] border border-[#E4E9EE] rounded-2xl text-sm font-medium outline-none focus:border-[#0D631B] text-[#111C2D]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#111C2D] block mb-1">
              Numéro de téléphone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
              <input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="Ex: 07 08 09 10 11"
                className="w-full pl-10 pr-4 py-3 bg-[#F7F8FB] border border-[#E4E9EE] rounded-2xl text-sm font-medium outline-none focus:border-[#0D631B] text-[#111C2D]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#111C2D] block mb-1">
              Instructions complémentaires (Facultatif)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3.5 top-3.5 text-[#5B6B7A]" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Ex: Devant la pharmacie, habillé en chemise bleue..."
                className="w-full pl-10 pr-4 py-3 bg-[#F7F8FB] border border-[#E4E9EE] rounded-2xl text-sm font-medium outline-none focus:border-[#0D631B] text-[#111C2D]"
              />
            </div>
          </div>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Booking Button */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleConfirmRide}
          className="w-full py-4 px-6 bg-[#0D631B] hover:bg-[#0A4E15] text-white font-extrabold text-sm rounded-full shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Enregistrement en cours...</span>
            </>
          ) : (
            <>
              {serviceType === 'delivery' && <Package className="w-5 h-5" />}
              {serviceType === 'concierge' && <KeyRound className="w-5 h-5" />}
              {serviceType === 'vtc' && <Bike className="w-5 h-5" />}
              <span>Confirmer la commande ({pricing.formattedPrice})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
