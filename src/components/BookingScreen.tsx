import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Navigation, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Bike, 
  HelpCircle,
  Sparkles,
  ArrowUpDown,
  Package,
  KeyRound,
  ShoppingBag,
  Phone,
  FileText,
  Building2,
  Compass,
  X,
  Search
} from 'lucide-react';
import { 
  DABOU_LANDMARKS, 
  calculateDrivingDistance, 
  getCurrentUserCoordinates 
} from '../services/mapsService';
import { calculateRidePrice } from '../services/pricingService';
import { DISPATCH_WHATSAPP_NUMBER } from '../services/notificationService';
import { PricingCalculation, ServiceType, DabouLandmark } from '../types';

interface BookingScreenProps {
  onContinueToConfirmation: (
    pickup: string,
    destination: string,
    pricing: PricingCalculation,
    serviceDetails?: {
      serviceType: ServiceType;
      packageDetails?: string;
      recipientPhone?: string;
      conciergeTask?: string;
    }
  ) => void;
}

export const BookingScreen: React.FC<BookingScreenProps> = ({
  onContinueToConfirmation,
}) => {
  const [serviceType, setServiceType] = useState<ServiceType>('taxi');
  const [pickup, setPickup] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [packageDetails, setPackageDetails] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [conciergeTask, setConciergeTask] = useState<string>('');

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isGpsAutoFilled, setIsGpsAutoFilled] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calcResult, setCalcResult] = useState<PricingCalculation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showFormulaInfo, setShowFormulaInfo] = useState<boolean>(false);

  // Neighborhoods UI state
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'Quartier' | 'Lieu'>('all');
  const [showPickupDropdown, setShowPickupDropdown] = useState<boolean>(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState<boolean>(false);
  const [showQuartiersModal, setShowQuartiersModal] = useState<boolean>(false);
  const [modalSearch, setModalSearch] = useState<string>('');

  const pickupRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  // Auto-detect user GPS position on mount to pre-fill pickup address
  useEffect(() => {
    let isMounted = true;
    if (!pickup) {
      setIsLocating(true);
      getCurrentUserCoordinates()
        .then((coords) => {
          if (isMounted && coords?.address) {
            setPickup(coords.address);
            setIsGpsAutoFilled(true);
          }
        })
        .catch(() => {
          // If permission denied or unavailable on load, fail gracefully without showing error banner
        })
        .finally(() => {
          if (isMounted) setIsLocating(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickupRef.current && !pickupRef.current.contains(event.target as Node)) {
        setShowPickupDropdown(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recalculate fare whenever pickup, destination, or serviceType changes
  useEffect(() => {
    let isCancelled = false;

    async function runMatrixCalculation() {
      if (!pickup.trim() || !destination.trim()) {
        setCalcResult(null);
        return;
      }

      setIsCalculating(true);
      setLocationError(null);

      try {
        const matrix = await calculateDrivingDistance(pickup.trim(), destination.trim());
        if (!isCancelled) {
          const pricing = calculateRidePrice(matrix.distanceKm, matrix.durationMin, serviceType);
          setCalcResult(pricing);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Error calculating fare:', err);
          setLocationError(err.message || 'Impossible d’évaluer la distance de conduite.');
          setCalcResult(null);
        }
      } finally {
        if (!isCancelled) {
          setIsCalculating(false);
        }
      }
    }

    const timer = setTimeout(runMatrixCalculation, 350);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [pickup, destination, serviceType]);

  const handleUseGps = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const coords = await getCurrentUserCoordinates();
      setPickup(coords.address);
      setIsGpsAutoFilled(true);
    } catch (err: any) {
      setLocationError(err.message);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSelectLandmark = (type: 'pickup' | 'destination', name: string) => {
    if (type === 'pickup') {
      setPickup(name);
      setIsGpsAutoFilled(false);
      setShowPickupDropdown(false);
    } else {
      setDestination(name);
      setShowDestinationDropdown(false);
    }
  };

  const handleSwap = () => {
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
  };

  // Filtered landmarks for pickup/destination dropdowns
  const filterLandmarks = (query: string) => {
    const clean = query.trim().toLowerCase();
    if (!clean) return DABOU_LANDMARKS;
    return DABOU_LANDMARKS.filter(
      (item) =>
        item.name.toLowerCase().includes(clean) ||
        item.category.toLowerCase().includes(clean) ||
        (item.description && item.description.toLowerCase().includes(clean))
    );
  };

  const pickupSuggestions = filterLandmarks(pickup);
  const destinationSuggestions = filterLandmarks(destination);

  // Quick chips depending on selected category filter
  const displayedChips = DABOU_LANDMARKS.filter((item) => {
    if (activeCategoryFilter === 'Quartier') return item.category === 'Quartier';
    if (activeCategoryFilter === 'Lieu') return item.category !== 'Quartier';
    return true;
  });

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      {/* Service Selection Tabs */}
      <div className="bg-white rounded-[28px] p-2 border border-[#E5E5DE] shadow-xs flex gap-1">
        <button
          type="button"
          onClick={() => setServiceType('taxi')}
          className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition ${
            serviceType === 'taxi' || serviceType === 'vtc'
              ? 'bg-[#0D631B] text-white shadow-xs'
              : 'text-[#5B6B7A] hover:bg-[#F7F8FB] hover:text-[#111C2D]'
          }`}
        >
          <Bike className="w-4 h-4 shrink-0" />
          <span>Transport Taxi VTC</span>
        </button>

        <button
          type="button"
          onClick={() => setServiceType('delivery')}
          className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition ${
            serviceType === 'delivery'
              ? 'bg-[#0D631B] text-white shadow-xs'
              : 'text-[#5B6B7A] hover:bg-[#F7F8FB] hover:text-[#111C2D]'
          }`}
        >
          <Package className="w-4 h-4 shrink-0" />
          <span>Livraison Colis</span>
        </button>

        <button
          type="button"
          onClick={() => setServiceType('concierge')}
          className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition ${
            serviceType === 'concierge'
              ? 'bg-[#0D631B] text-white shadow-xs'
              : 'text-[#5B6B7A] hover:bg-[#F7F8FB] hover:text-[#111C2D]'
          }`}
        >
          <KeyRound className="w-4 h-4 shrink-0" />
          <span>Conciergerie</span>
        </button>
      </div>

      {/* Main Booking Card */}
      <section className="bg-white rounded-[32px] p-6 sm:p-8 shadow-xs border border-[#E5E5DE]">
        <h2 className="text-2xl font-bold mb-2 text-[#111C2D] font-serif-heading flex items-center justify-between">
          <span>
            {(serviceType === 'taxi' || serviceType === 'vtc') && 'Où allez-vous ?'}
            {serviceType === 'delivery' && 'Service de Livraison Express'}
            {serviceType === 'concierge' && 'Conciergerie & Procourses'}
          </span>
          <span className="text-xs font-sans font-bold bg-[#E8F3EA] text-[#0D631B] px-3 py-1 rounded-full border border-[#D4E8D9]">
            {(serviceType === 'taxi' || serviceType === 'vtc') && 'Taxi Passager'}
            {serviceType === 'delivery' && 'Livraison'}
            {serviceType === 'concierge' && 'Achats & Services'}
          </span>
        </h2>

        <p className="text-xs text-[#5B6B7A] mb-6">
          {(serviceType === 'taxi' || serviceType === 'vtc') && 'Transport rapide et sécurisé en moto-taxi à Dabou.'}
          {serviceType === 'delivery' && 'Expédition urgente de colis, plis, vêtements ou repas à domicile.'}
          {serviceType === 'concierge' && 'Faites faire vos achats (marché, pharmacie) ou démarches sur mesure.'}
        </p>

        <div className="space-y-4">
          {/* Pickup / Departure Field */}
          <div className="relative" ref={pickupRef}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] uppercase tracking-widest font-extrabold text-[#5B6B7A] pl-1">
                {(serviceType === 'taxi' || serviceType === 'vtc') && 'Point de départ'}
                {serviceType === 'delivery' && 'Lieu de ramassage (Départ)'}
                {serviceType === 'concierge' && 'Lieu d’achat ou d’intervention'}
              </label>
              <button
                type="button"
                onClick={handleUseGps}
                disabled={isLocating}
                className="text-[11px] font-bold text-[#0D631B] hover:text-[#0A4E15] flex items-center gap-1 bg-[#E8F3EA] px-2.5 py-1 rounded-xl transition hover:bg-[#D4E8D9]"
              >
                {isLocating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3 text-[#0D631B]" />
                )}
                <span>Position GPS</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={pickup}
                onChange={(e) => {
                  setPickup(e.target.value);
                  setIsGpsAutoFilled(false);
                  setShowPickupDropdown(true);
                }}
                onFocus={() => setShowPickupDropdown(true)}
                placeholder={
                  serviceType === 'taxi' || serviceType === 'vtc'
                    ? "Ex: Quartier M'Brimbo, Grand Marché, Gare Routière..." 
                    : serviceType === 'delivery'
                    ? "Lieu où récupérer le colis (Quartier, point connu)..."
                    : "Lieu de la course (ex: Quartier Leboutou, Pharmacie)..."
                }
                className="w-full pt-3 pb-3 px-4 pl-10 bg-[#F7F8FB] border border-[#E4E9EE] rounded-2xl focus:outline-none focus:border-[#0D631B] font-medium text-sm text-[#111C2D] transition"
              />
              <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0D631B]" />
              {pickup && (
                <button
                  type="button"
                  onClick={() => {
                    setPickup('');
                    setIsGpsAutoFilled(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#5B6B7A] hover:text-[#111C2D]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* GPS Auto-fill status notification badge */}
            {isGpsAutoFilled && pickup && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#0D631B] bg-[#E8F3EA] px-3 py-1 rounded-xl w-fit border border-[#D4E8D9]">
                <Sparkles className="w-3 h-3 text-[#0D631B] shrink-0" />
                <span>Départ pré-rempli automatiquement par géolocalisation GPS</span>
              </div>
            )}

            {/* Pickup Suggestions Autocomplete Dropdown */}
            {showPickupDropdown && pickupSuggestions.length > 0 && (
              <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-[#E5E5DE] rounded-2xl shadow-lg max-h-56 overflow-y-auto divide-y divide-[#F0F2F5]">
                <div className="p-2 bg-[#F7F8FB] text-[10px] font-extrabold uppercase tracking-wider text-[#5B6B7A] flex justify-between items-center sticky top-0">
                  <span>Quartiers & Lieux suggérés ({pickupSuggestions.length})</span>
                  <button
                    type="button"
                    onClick={() => setShowPickupDropdown(false)}
                    className="text-[#5B6B7A] hover:text-[#111C2D]"
                  >
                    Fermer
                  </button>
                </div>
                {pickupSuggestions.map((lm) => (
                  <button
                    key={`p-sugg-${lm.id}`}
                    type="button"
                    onClick={() => handleSelectLandmark('pickup', lm.name)}
                    className="w-full px-4 py-2.5 text-left hover:bg-[#E8F3EA] transition flex items-start gap-2.5 group"
                  >
                    <Building2 className="w-4 h-4 text-[#0D631B] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#111C2D] group-hover:text-[#0D631B] truncate">
                          {lm.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F7F8FB] border border-[#E4E9EE] text-[#5B6B7A] rounded-full shrink-0">
                          {lm.category}
                        </span>
                      </div>
                      {lm.description && (
                        <p className="text-[11px] text-[#5B6B7A] truncate mt-0.5">{lm.description}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Quick Landmark Chips for Pickup */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#5B6B7A]">Sélection rapide :</span>
              {displayedChips.slice(0, 5).map((lm) => (
                <button
                  key={`p-${lm.id}`}
                  type="button"
                  onClick={() => handleSelectLandmark('pickup', lm.name)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl transition ${
                    pickup === lm.name
                      ? 'bg-[#0D631B] text-white shadow-xs'
                      : 'bg-[#F7F8FB] text-[#111C2D] border border-[#E4E9EE] hover:bg-[#E8F3EA] hover:text-[#0D631B]'
                  }`}
                >
                  {lm.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dotted Divider & Swap Button */}
          <div className="flex items-center justify-between relative my-1 py-1">
            <div className="h-px flex-1 bg-[#E5E5DE]"></div>
            <button
              type="button"
              onClick={handleSwap}
              className="mx-3 p-2 bg-[#E8F3EA] text-[#0D631B] hover:bg-[#D4E8D9] rounded-full shadow-xs border border-[#D4E8D9] transition flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
              title="Inverser départ et destination"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Inverser</span>
            </button>
            <div className="h-px flex-1 bg-[#E5E5DE]"></div>
          </div>

          {/* Destination Field */}
          <div className="relative" ref={destinationRef}>
            <label className="text-[10px] uppercase tracking-widest font-extrabold text-[#5B6B7A] pl-1 block mb-1">
              {(serviceType === 'taxi' || serviceType === 'vtc') && 'Destination'}
              {serviceType === 'delivery' && 'Lieu de livraison (Arrivée)'}
              {serviceType === 'concierge' && 'Lieu de remise finale'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setShowDestinationDropdown(true);
                }}
                onFocus={() => setShowDestinationDropdown(true)}
                placeholder={
                  serviceType === 'taxi' || serviceType === 'vtc'
                    ? "Ex: Quartier Leboutou, Hôpital Général, Mairie..."
                    : "Saisissez l'adresse ou quartier de livraison..."
                }
                className="w-full pt-3 pb-3 px-4 pl-10 bg-[#F7F8FB] border border-[#E4E9EE] rounded-2xl focus:outline-none focus:border-[#0D631B] font-medium text-sm text-[#111C2D] transition"
              />
              <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0D631B]" />
              {destination && (
                <button
                  type="button"
                  onClick={() => setDestination('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#5B6B7A] hover:text-[#111C2D]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Destination Suggestions Autocomplete Dropdown */}
            {showDestinationDropdown && destinationSuggestions.length > 0 && (
              <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-[#E5E5DE] rounded-2xl shadow-lg max-h-56 overflow-y-auto divide-y divide-[#F0F2F5]">
                <div className="p-2 bg-[#F7F8FB] text-[10px] font-extrabold uppercase tracking-wider text-[#5B6B7A] flex justify-between items-center sticky top-0">
                  <span>Quartiers & Lieux suggérés ({destinationSuggestions.length})</span>
                  <button
                    type="button"
                    onClick={() => setShowDestinationDropdown(false)}
                    className="text-[#5B6B7A] hover:text-[#111C2D]"
                  >
                    Fermer
                  </button>
                </div>
                {destinationSuggestions.map((lm) => (
                  <button
                    key={`d-sugg-${lm.id}`}
                    type="button"
                    onClick={() => handleSelectLandmark('destination', lm.name)}
                    className="w-full px-4 py-2.5 text-left hover:bg-[#E8F3EA] transition flex items-start gap-2.5 group"
                  >
                    <Building2 className="w-4 h-4 text-[#0D631B] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#111C2D] group-hover:text-[#0D631B] truncate">
                          {lm.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F7F8FB] border border-[#E4E9EE] text-[#5B6B7A] rounded-full shrink-0">
                          {lm.category}
                        </span>
                      </div>
                      {lm.description && (
                        <p className="text-[11px] text-[#5B6B7A] truncate mt-0.5">{lm.description}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}


          </div>

          {/* Button to open full Dabou Neighborhoods Modal */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowQuartiersModal(true)}
              className="w-full py-2.5 px-4 bg-[#F7F8FB] hover:bg-[#E8F3EA] border border-[#E4E9EE] hover:border-[#D4E8D9] rounded-2xl text-xs font-bold text-[#0D631B] transition flex items-center justify-center gap-2 group"
            >
              <Compass className="w-4 h-4 text-[#0D631B] group-hover:rotate-45 transition-transform" />
              <span>📍 Voir les 24 Quartiers & Repères de Dabou (Google Maps)</span>
            </button>
          </div>

          {/* Specific fields for Delivery */}
          {serviceType === 'delivery' && (
            <div className="space-y-3 pt-2 border-t border-[#E5E5DE]">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-extrabold text-[#5B6B7A] pl-1 block mb-1">
                  Que livrons-nous ?
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
                  <input
                    type="text"
                    value={packageDetails}
                    onChange={(e) => setPackageDetails(e.target.value)}
                    placeholder="Ex: Sac de riz 25kg, enveloppe administrative, plat chaud..."
                    className="w-full pt-3 pb-3 px-4 pl-10 bg-[#F7F8FB] border border-[#E4E9EE] rounded-2xl text-sm font-medium outline-none focus:border-[#0D631B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-extrabold text-[#5B6B7A] pl-1 block mb-1">
                  Téléphone du destinataire
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="Ex: 07 00 00 00 00"
                    className="w-full pt-3 pb-3 px-4 pl-10 bg-[#F7F8FB] border border-[#E4E9EE] rounded-2xl text-sm font-medium outline-none focus:border-[#0D631B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Specific fields for Concierge / Procourses */}
          {serviceType === 'concierge' && (
            <div className="pt-2 border-t border-[#E5E5DE]">
              <label className="text-[10px] uppercase tracking-widest font-extrabold text-[#5B6B7A] pl-1 block mb-1">
                Description de la course / commission à effectuer
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3.5 top-3.5 text-[#5B6B7A]" />
                <textarea
                  value={conciergeTask}
                  onChange={(e) => setConciergeTask(e.target.value)}
                  rows={2}
                  placeholder="Ex: Acheter 2 boîtes d'Efferalgan à la pharmacie centrale et m'apporter les médicaments avec le reçu."
                  className="w-full pl-10 pr-4 py-3 bg-[#F7F8FB] border border-[#E4E9EE] rounded-2xl text-sm font-medium outline-none focus:border-[#0D631B]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {locationError && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-red-800 text-xs">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Attention</span>
              <span>{locationError}</span>
            </div>
          </div>
        )}

        {/* Estimation Banner Card in Forest Green */}
        <div className="mt-8 p-6 sm:p-7 bg-[#0D631B] rounded-[24px] text-white space-y-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-extrabold text-white/80 mb-1">
                Estimation du tarif {serviceType === 'concierge' ? '(Base Conciergerie 700 FCFA)' : '(Base 500 FCFA)'}
              </p>
              {isCalculating ? (
                <div className="flex items-center gap-2 py-1">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                  <span className="text-xs text-white/80">Calcul en cours...</span>
                </div>
              ) : calcResult && calcResult.isValid ? (
                <div>
                  <p className="text-3xl sm:text-4xl font-bold font-serif-heading">
                    {calcResult.finalPriceFcfa} <span className="text-base font-normal opacity-90">FCFA</span>
                  </p>
                  <p className="text-xs text-white/80 mt-1">
                    📏 {calcResult.distanceKm} km • ⏱️ ~{calcResult.durationMin} min
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold font-serif-heading text-white/90">
                  --- <span className="text-sm font-normal">FCFA</span>
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFormulaInfo(!showFormulaInfo)}
              className="text-xs text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full border border-white/20 transition flex items-center gap-1 font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Calcul</span>
            </button>
          </div>

          {/* Formula info expansion */}
          {showFormulaInfo && (
            <div className="pt-3 border-t border-white/20 text-xs text-white/90 space-y-1">
              <p className="font-bold text-white flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Grille tarifaire Allô Dabou :
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-white/80">
                <li>Transport & Livraison : 500 FCFA base fixe (jusqu'à 4.0 km)</li>
                <li>Conciergerie / Procourses : 700 FCFA base fixe (jusqu'à 4.0 km)</li>
                <li>Distance supplémentaire : +150 FCFA / km</li>
                <li>Arrondi au multiple de 25 FCFA le plus proche.</li>
              </ul>
            </div>
          )}

          <button
            type="button"
            disabled={!calcResult || !calcResult.isValid || isCalculating}
            onClick={() => {
              if (calcResult && calcResult.isValid) {
                onContinueToConfirmation(pickup, destination, calcResult, {
                  serviceType,
                  packageDetails,
                  recipientPhone,
                  conciergeTask,
                });
              }
            }}
            className={`w-full py-3.5 px-6 rounded-full font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${
              calcResult && calcResult.isValid && !isCalculating
                ? 'bg-white text-[#0D631B] hover:bg-[#E8F3EA] cursor-pointer'
                : 'bg-white/20 text-white/50 cursor-not-allowed'
            }`}
          >
            <span>
              {serviceType === 'vtc' && 'Réserver le transport'}
              {serviceType === 'delivery' && 'Commander la livraison'}
              {serviceType === 'concierge' && 'Commander la conciergerie'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Discreet Support Footer */}
      <div className="flex items-center justify-between px-2 pt-2 text-xs text-[#5B6B7A]">
        <span>Allô Dabou VTC • Services 24/7</span>
        <a
          href={`https://wa.me/${DISPATCH_WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-[#0D631B] hover:underline flex items-center gap-1"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Support WhatsApp (01 01 68 25 35)</span>
        </a>
      </div>

      {/* Full Dabou Neighborhoods & Landmarks Modal */}
      {showQuartiersModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-[#E5E5DE] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-[#0D631B] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight font-serif-heading">Quartiers & Repères de Dabou</h3>
                  <p className="text-xs text-white/80">Données géographiques réelles Google Maps Dabou</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuartiersModal(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Category Filter */}
            <div className="p-4 border-b border-[#E5E5DE] bg-[#F7F8FB] space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Rechercher un quartier, marché, gare, village..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4E9EE] rounded-xl text-sm outline-none focus:border-[#0D631B] text-[#111C2D]"
                />
                {modalSearch && (
                  <button
                    type="button"
                    onClick={() => setModalSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B6B7A] hover:text-[#111C2D]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('all')}
                  className={`px-3 py-1 rounded-xl transition ${
                    activeCategoryFilter === 'all'
                      ? 'bg-[#0D631B] text-white shadow-2xs'
                      : 'bg-white text-[#5B6B7A] border border-[#E4E9EE] hover:bg-[#E8F3EA]'
                  }`}
                >
                  Tous ({DABOU_LANDMARKS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('Quartier')}
                  className={`px-3 py-1 rounded-xl transition ${
                    activeCategoryFilter === 'Quartier'
                      ? 'bg-[#0D631B] text-white shadow-2xs'
                      : 'bg-white text-[#5B6B7A] border border-[#E4E9EE] hover:bg-[#E8F3EA]'
                  }`}
                >
                  Quartiers ({DABOU_LANDMARKS.filter((i) => i.category === 'Quartier').length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('Lieu')}
                  className={`px-3 py-1 rounded-xl transition ${
                    activeCategoryFilter === 'Lieu'
                      ? 'bg-[#0D631B] text-white shadow-2xs'
                      : 'bg-white text-[#5B6B7A] border border-[#E4E9EE] hover:bg-[#E8F3EA]'
                  }`}
                >
                  Gares, Marchés & Équipements ({DABOU_LANDMARKS.filter((i) => i.category !== 'Quartier').length})
                </button>
              </div>
            </div>

            {/* Neighborhoods List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-[#F0F2F5]">
              {DABOU_LANDMARKS.filter((lm) => {
                const matchSearch =
                  !modalSearch ||
                  lm.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
                  (lm.description && lm.description.toLowerCase().includes(modalSearch.toLowerCase())) ||
                  lm.category.toLowerCase().includes(modalSearch.toLowerCase());
                const matchCategory =
                  activeCategoryFilter === 'all' ||
                  (activeCategoryFilter === 'Quartier' && lm.category === 'Quartier') ||
                  (activeCategoryFilter === 'Lieu' && lm.category !== 'Quartier');
                return matchSearch && matchCategory;
              }).map((lm) => (
                <div
                  key={`modal-${lm.id}`}
                  className="pt-2.5 pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7F8FB] px-2 rounded-xl transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#E8F3EA] rounded-xl text-[#0D631B] shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#111C2D]">{lm.name}</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-[#F7F8FB] border border-[#E4E9EE] text-[#5B6B7A] rounded-full">
                          {lm.category}
                        </span>
                      </div>
                      {lm.description && (
                        <p className="text-xs text-[#5B6B7A] mt-0.5">{lm.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pl-11 sm:pl-0">
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectLandmark('pickup', lm.name);
                        setShowQuartiersModal(false);
                      }}
                      className="px-3 py-1.5 bg-[#E8F3EA] hover:bg-[#D4E8D9] text-[#0D631B] rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Départ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectLandmark('destination', lm.name);
                        setShowQuartiersModal(false);
                      }}
                      className="px-3 py-1.5 bg-[#0D631B] hover:bg-[#0A4E15] text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Arrivée</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F7F8FB] border-t border-[#E5E5DE] flex justify-between items-center text-xs text-[#5B6B7A]">
              <span>24 lieux et quartiers répertoriés à Dabou</span>
              <button
                type="button"
                onClick={() => setShowQuartiersModal(false)}
                className="px-4 py-2 bg-white border border-[#E4E9EE] rounded-xl font-bold text-[#111C2D] hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
