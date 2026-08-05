import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  MapPin, 
  XCircle, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Loader2, 
  Bike,
  ChevronRight,
  RefreshCw,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeUserRides, cancelRide } from '../services/rideService';
import { 
  generateWhatsAppDispatchUrl, 
  playClientAcceptedChime, 
  triggerBrowserNotification,
  registerFcmTokenForUser
} from '../services/notificationService';
import { formatFcfa } from '../services/pricingService';
import { Ride, RideStatus, ServiceType } from '../types';

const getServiceTypeBadge = (serviceType?: ServiceType) => {
  switch (serviceType) {
    case 'delivery':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-extrabold rounded-xl shadow-2xs">
          📦 Livraison Colis
        </span>
      );
    case 'concierge':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-extrabold rounded-xl shadow-2xs">
          🔑 Conciergerie
        </span>
      );
    case 'taxi':
    case 'vtc':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8F3EA] border border-[#D4E8D9] text-[#0D631B] text-[11px] font-extrabold rounded-xl shadow-2xs">
          🚖 Taxi VTC
        </span>
      );
  }
};

interface HistoryScreenProps {
  onOpenAuth: () => void;
  onNewBookingClick: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  onOpenAuth,
  onNewBookingClick,
}) => {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | RideStatus>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const prevStatuses = useRef<Record<string, RideStatus>>({});
  const initialClientLoad = useRef<boolean>(false);

  useEffect(() => {
    if (!user) {
      setRides([]);
      setLoading(false);
      return;
    }

    registerFcmTokenForUser(user.uid);

    setLoading(true);
    const unsubscribe = subscribeUserRides(
      user.uid,
      (fetchedRides) => {
        setRides(fetchedRides);
        setLoading(false);

        // Detect if a ride status changed to confirmed
        if (initialClientLoad.current) {
          fetchedRides.forEach((ride) => {
            const oldStatus = prevStatuses.current[ride.id];
            if (oldStatus === 'pending' && ride.status === 'confirmed') {
              playClientAcceptedChime();
              const plateInfo = ride.driverVehiclePlate ? ` (Plaque: ${ride.driverVehiclePlate})` : '';
              triggerBrowserNotification('🎉 Votre course a été acceptée !', {
                body: `Votre chauffeur Dabou ${ride.driverName || 'Chauffeur VTC'}${plateInfo} est en route vers ${ride.pickupAddress}.`,
              });
            }
          });
        } else {
          initialClientLoad.current = true;
        }

        // Update status map
        const statusMap: Record<string, RideStatus> = {};
        fetchedRides.forEach((r) => {
          statusMap[r.id] = r.status;
        });
        prevStatuses.current = statusMap;
      },
      (err) => {
        console.error('Subscription error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleCancel = async (rideId: string) => {
    if (!user) return;
    if (!window.confirm('Voulez-vous vraiment annuler cette réservation ?')) return;

    setCancellingId(rideId);
    setActionError(null);
    try {
      await cancelRide(rideId, user.uid);
    } catch (err: any) {
      setActionError(err.message || 'Impossible d’annuler la course.');
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-[32px] p-8 border border-[#E5E5DE] shadow-xs text-center space-y-4 my-6">
        <div className="w-14 h-14 bg-[#E8F3EA] text-[#0D631B] rounded-full flex items-center justify-center mx-auto border border-[#D4E8D9]">
          <Clock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#111C2D] font-serif-heading">Historique des courses</h2>
          <p className="text-xs text-[#5B6B7A] mt-1">
            Connectez-vous pour consulter l'historique de vos réservations.
          </p>
        </div>
        <button
          onClick={onOpenAuth}
          className="py-3 px-6 bg-[#0D631B] hover:bg-[#0A4E15] text-white font-bold text-xs rounded-2xl shadow transition"
        >
          Se connecter
        </button>
      </div>
    );
  }

  const filteredRides = rides.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const getStatusBadge = (status: RideStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-extrabold rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            En attente
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-3 py-1 bg-[#E8F3EA] text-[#0D631B] border border-[#D4E8D9] text-[11px] font-extrabold rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#0D631B]" />
            Confirmée
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 bg-[#E8F3EA] text-[#0D631B] border border-[#D4E8D9] text-[11px] font-extrabold rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#0D631B]" />
            Terminée
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 bg-red-50 text-red-800 border border-red-200 text-[11px] font-extrabold rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-600" />
            Annulée
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#111C2D] font-serif-heading">Historique des courses</h2>
          <p className="text-xs text-[#5B6B7A]">Suivi et détails de vos réservations</p>
        </div>
        <button
          onClick={onNewBookingClick}
          className="bg-[#0D631B] hover:bg-[#0A4E15] text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-xs transition flex items-center gap-1.5"
        >
          <Bike className="w-4 h-4" />
          <span>Réserver</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'pending', label: 'En attente' },
          { id: 'confirmed', label: 'Confirmées' },
          { id: 'completed', label: 'Terminées' },
          { id: 'cancelled', label: 'Annulées' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
              filter === tab.id
                ? 'bg-[#0D631B] text-white shadow-xs'
                : 'bg-white text-[#5B6B7A] border border-[#E5E5DE] hover:bg-[#F7F8FB] hover:text-[#111C2D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Ride List */}
      {loading ? (
        <div className="p-10 text-center space-y-2 bg-white rounded-[32px] border border-[#E5E5DE]">
          <Loader2 className="w-8 h-8 text-[#0D631B] animate-spin mx-auto" />
          <p className="text-xs font-medium text-[#5B6B7A]">Chargement de vos courses...</p>
        </div>
      ) : filteredRides.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-[32px] border border-[#E5E5DE] space-y-3">
          <p className="text-sm font-bold text-[#111C2D] font-serif-heading">Aucune course trouvée</p>
          <p className="text-xs text-[#5B6B7A]">
            {filter === 'all'
              ? 'Vous n’avez pas encore effectué de réservation.'
              : `Aucune course avec le statut "${filter}".`}
          </p>
          <button
            onClick={onNewBookingClick}
            className="py-2.5 px-5 bg-[#0D631B] text-white font-bold text-xs rounded-2xl shadow transition inline-block"
          >
            Réserver ma première course
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRides.map((ride) => {
            const waUrl = generateWhatsAppDispatchUrl(ride);
            const dateStr = ride.createdAt
              ? new Date(ride.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Récemment';

            return (
              <div
                key={ride.id}
                className="bg-white rounded-[24px] p-5 border border-[#E5E5DE] shadow-xs space-y-3.5 hover:border-[#D4E8D9] transition"
              >
                {/* Header row */}
                <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#5B6B7A]">
                      #{ride.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-[11px] text-[#5B6B7A]">• {dateStr}</span>
                  </div>
                  <div>{getStatusBadge(ride.status)}</div>
                </div>

                {/* Service Type Badge */}
                <div>
                  {getServiceTypeBadge(ride.serviceType)}
                </div>

                {/* Locations */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#111C2D]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0D631B] flex-shrink-0" />
                    <span className="font-bold truncate">{ride.pickupAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#111C2D]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#111C2D] flex-shrink-0" />
                    <span className="font-bold truncate">{ride.destinationAddress}</span>
                  </div>
                </div>

                {/* Extra Service Details */}
                {ride.packageDetails && (
                  <p className="text-[11px] text-[#5B6B7A] bg-[#F7F8FB] px-3 py-1.5 rounded-xl">
                    📦 <strong>Colis :</strong> {ride.packageDetails} {ride.recipientPhone ? `(Tél: ${ride.recipientPhone})` : ''}
                  </p>
                )}
                {ride.conciergeTask && (
                  <p className="text-[11px] text-[#5B6B7A] bg-[#F7F8FB] px-3 py-1.5 rounded-xl">
                    🔑 <strong>Course :</strong> {ride.conciergeTask}
                  </p>
                )}

                {/* Assigned Driver Banner */}
                {ride.driverName && (
                  <div className="bg-[#E8F3EA] p-3.5 rounded-2xl border border-[#D4E8D9] space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0D631B] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                          <Bike className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-[#0D631B] block">Chauffeur Assigné</span>
                          <p className="font-bold text-[#111C2D] text-sm">{ride.driverName}</p>
                        </div>
                      </div>
                      {ride.driverPhone && (
                        <a
                          href={`tel:${ride.driverPhone}`}
                          className="bg-[#0D631B] hover:bg-[#0A4E15] text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition shrink-0"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Appeler</span>
                        </a>
                      )}
                    </div>

                    {/* License Plate Badge */}
                    <div className="pt-2 border-t border-[#D4E8D9]/80 flex items-center justify-between bg-white/80 px-3 py-2 rounded-xl">
                      <span className="text-[11px] font-semibold text-[#5B6B7A]">Plaque d'immatriculation / Véhicule :</span>
                      {ride.driverVehiclePlate ? (
                        <span className="font-mono font-extrabold text-[#111C2D] bg-[#111C2D]/5 px-2.5 py-0.5 rounded-lg border border-[#111C2D]/10 text-xs">
                          🚘 {ride.driverVehiclePlate}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-[#5B6B7A] italic">Non renseignée</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer details & price */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[#5B6B7A] font-medium">
                    {ride.distanceKm} km (~{ride.durationMin} min)
                  </span>
                  <span className="text-lg font-bold text-[#0D631B] font-serif-heading">
                    {formatFcfa(ride.priceFcfa)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#E5E5DE]">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 bg-[#E8F3EA] hover:bg-[#D4E8D9] text-[#0D631B] font-bold text-xs rounded-2xl text-center flex items-center justify-center gap-1.5 transition border border-[#D4E8D9]"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#0D631B]" />
                    <span>WhatsApp Dispatch</span>
                  </a>

                  {ride.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(ride.id)}
                      disabled={cancellingId === ride.id}
                      className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-2xl border border-red-200 flex items-center gap-1 transition"
                    >
                      {cancellingId === ride.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span>Annuler</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

