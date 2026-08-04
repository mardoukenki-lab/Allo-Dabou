import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Ride, RideStatus, UserProfile } from '../types';
import { 
  subscribeAllRides, 
  acceptRideByDriver, 
  updateRideStatusByDriver,
  subscribeAllUsers
} from '../services/rideService';
import { 
  playDriverOrderChime, 
  requestPushPermission, 
  triggerBrowserNotification,
  generateWhatsAppDispatchUrl,
  registerFcmTokenForUser,
  DISPATCH_WHATSAPP_NUMBER
} from '../services/notificationService';
import { formatFcfa } from '../services/pricingService';
import { 
  Bike, 
  Bell, 
  BellRing, 
  PhoneCall, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Navigation, 
  User, 
  DollarSign, 
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Power,
  Users,
  UserCheck,
  UserX
} from 'lucide-react';

interface DriverDashboardScreenProps {
  onOpenAuth: () => void;
}

export const DriverDashboardScreen: React.FC<DriverDashboardScreenProps> = ({ onOpenAuth }) => {
  const { user, userProfile, isAdmin, isDriver, isApprovedDriver, approveDriverByAdmin } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'pending' | 'confirmed' | 'completed' | 'all' | 'drivers_admin'>('pending');
  const [pushEnabled, setPushEnabled] = useState<boolean>(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Track previous pending ride IDs to trigger push notification only for new orders
  const knownPendingIds = useRef<Set<string>>(new Set());
  const initialLoadDone = useRef<boolean>(false);

  // Auto-register FCM token for drivers upon mounting
  useEffect(() => {
    if (user && isApprovedDriver) {
      registerFcmTokenForUser(user.uid).then((token) => {
        if (token) console.log('FCM token auto-registered for driver:', token);
      });
    }
  }, [user, isApprovedDriver]);

  // Fetch rides
  useEffect(() => {
    if (!user) {
      setRides([]);
      setLoading(false);
      return;
    }

    const unsub = subscribeAllRides(
      (updatedRides) => {
        setRides(updatedRides);
        setLoading(false);

        // Filter currently pending rides
        const currentPendingRides = updatedRides.filter((r) => r.status === 'pending');
        const currentPendingIds = new Set(currentPendingRides.map((r) => r.id));

        // If not initial load, detect new incoming pending rides
        if (initialLoadDone.current) {
          currentPendingRides.forEach((ride) => {
            if (!knownPendingIds.current.has(ride.id)) {
              // Trigger loud driver sound chime & push notification!
              playDriverOrderChime();
              triggerBrowserNotification(`🚖 NOUVELLE COURSE DABOU #${ride.id.slice(-5).toUpperCase()}`, {
                body: `Départ: ${ride.pickupAddress}\nDestination: ${ride.destinationAddress}\nTarif: ${formatFcfa(ride.priceFcfa)}`,
              });
            }
          });
        } else {
          initialLoadDone.current = true;
        }

        knownPendingIds.current = currentPendingIds;
      },
      (err) => {
        console.error('Error fetching driver rides:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  // Fetch all users for Admin
  useEffect(() => {
    if (!isAdmin) return;
    const unsub = subscribeAllUsers(
      (users) => {
        setAllUsers(users);
      },
      (err) => console.error('Admin users subscription error:', err)
    );
    return () => unsub();
  }, [isAdmin]);

  const handleEnablePush = async () => {
    const granted = await requestPushPermission();
    setPushEnabled(granted);
    if (granted) {
      playDriverOrderChime();
      triggerBrowserNotification(' Notifications Chauffeur FCM Activées', {
        body: 'Vous recevrez un signal sonore et visuel à chaque nouvelle réservation de course à Dabou.',
      });
      if (user) {
        registerFcmTokenForUser(user.uid);
      }
    }
  };

  const handleAcceptRide = async (ride: Ride) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setActionLoadingId(ride.id);
    try {
      const driverName = userProfile?.displayName || user.email?.split('@')[0] || 'Chauffeur Dabou';
      const driverPhone = userProfile?.phone || '0700000000';
      await acceptRideByDriver(ride.id, {
        driverId: user.uid,
        driverName,
        driverPhone,
      });

      // Send push notification trigger
      triggerBrowserNotification('Course Acceptée !', {
        body: `Vous avez accepté la course #${ride.id.slice(-5).toUpperCase()} pour ${ride.userName || 'le client'}.`,
      });
    } catch (err: any) {
      alert('Erreur lors de la prise en charge de la course: ' + (err.message || String(err)));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusChange = async (rideId: string, newStatus: RideStatus) => {
    setActionLoadingId(rideId);
    try {
      await updateRideStatusByDriver(rideId, newStatus);
    } catch (err: any) {
      alert('Erreur lors du changement de statut: ' + (err.message || String(err)));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAdminApproveDriver = async (driverUid: string, approve: boolean) => {
    setActionLoadingId(driverUid);
    try {
      await approveDriverByAdmin(driverUid, approve);
      alert(approve ? 'Chauffeur approuvé avec succès !' : 'Statut du chauffeur réinitialisé.');
    } catch (err: any) {
      alert('Erreur lors de la mise à jour: ' + (err.message || String(err)));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metrics calculation
  const pendingRides = rides.filter((r) => r.status === 'pending');
  const activeRides = rides.filter((r) => r.status === 'confirmed');
  const completedRides = rides.filter((r) => r.status === 'completed');
  
  const todayEarningsFcfa = completedRides.reduce((acc, r) => acc + r.priceFcfa, 0);

  const pendingDriverRequests = allUsers.filter(
    (u) =>
      u.role !== 'admin' &&
      (u.role === 'driver' || u.role === 'driver_pending') &&
      (u.approved === false || u.isApprovedDriver === false || u.role === 'driver_pending')
  );

  const approvedDriversList = allUsers.filter(
    (u) =>
      u.role !== 'admin' &&
      (u.role === 'driver' || u.role === 'driver_pending') &&
      (u.approved === true || u.isApprovedDriver === true)
  );

  const filteredRides = rides.filter((r) => {
    if (filter === 'all' || filter === 'drivers_admin') return true;
    return r.status === filter;
  });

  if (!user) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E5DE] shadow-xs text-center space-y-4 my-6">
        <div className="w-16 h-16 bg-[#E8F3EA] text-[#0D631B] rounded-2xl flex items-center justify-center mx-auto border border-[#D4E8D9]">
          <Bike className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#111C2D]">Connexion Chauffeur VTC requise</h2>
        <p className="text-xs text-[#5B6B7A] max-w-sm mx-auto leading-relaxed">
          Inscrivez-vous ou connectez-vous avec un compte chauffeur pour accéder aux demandes de courses. La création de compte chauffeur nécessite la validation de l'administrateur Allô Dabou VTC.
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full max-w-xs py-3 px-4 bg-[#0D631B] hover:bg-[#0A4E15] text-white font-bold text-xs rounded-2xl transition shadow-xs cursor-pointer"
        >
          Se connecter / S'inscrire Chauffeur
        </button>
      </div>
    );
  }

  // Handle unapproved pending driver account
  if (!isApprovedDriver && !isAdmin) {
    return (
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-amber-200 shadow-md my-6 space-y-4 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center mx-auto border border-amber-300">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-[10px] font-black rounded-full uppercase tracking-wider mb-2">
            Validation Administrateur Requise
          </span>
          <h2 className="text-xl font-bold text-[#111C2D] font-serif-heading">
            Compte Chauffeur en attente de validation
          </h2>
          <p className="text-xs text-[#5B6B7A] mt-2 leading-relaxed">
            Votre compte chauffeur a été enregistré avec succès. Pour des raisons de sécurité, l'administrateur Allô Dabou VTC doit vérifier et valider votre dossier avant que vous ne puissiez prendre en charge des clients.
          </p>
        </div>

        {userProfile?.vehicleNumber && (
          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs font-bold text-amber-900">
            Plaque moto soumise: {userProfile.vehicleNumber}
          </div>
        )}

        <div className="pt-2 space-y-2">
          <a
            href={`https://wa.me/${DISPATCH_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Bonjour Admin Dabou, je viens de créer un compte chauffeur pour ${user.email}. Merci de valider ma création de compte.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#1EBE5B] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contacter l'Admin sur WhatsApp pour validation</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-[#E5E5DE] space-y-5 pb-24">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-br from-[#0D631B] to-[#0A4E15] text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white flex items-center gap-1">
                <Bike className="w-3 h-3" />
                Espace Chauffeur / Admin
              </span>
              <span className="text-xs text-white/80 font-medium">
                {user.email}
              </span>
            </div>

            {/* Availability Toggle */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                  : 'bg-rose-500/20 text-rose-200 border-rose-400/40'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isOnline ? 'En Ligne' : 'Hors Ligne'}</span>
            </button>
          </div>

          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold font-serif-heading">
                Tableau de Bord Chauffeur
              </h2>
              <p className="text-xs text-white/80 mt-0.5">
                Gérez les courses de taxi-moto à Dabou en temps réel.
              </p>
            </div>

            {/* Notification Permission Banner */}
            {!pushEnabled ? (
              <button
                onClick={handleEnablePush}
                className="bg-amber-400 hover:bg-amber-300 text-amber-950 px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <BellRing className="w-4 h-4 animate-bounce" />
                <span>Activer FCM Push Notification</span>
              </button>
            ) : (
              <div className="bg-white/15 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/90 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-emerald-300" />
                <span>Push FCM Activé</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setFilter('pending')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            filter === 'pending'
              ? 'bg-amber-50 border-amber-300 shadow-xs'
              : 'bg-white border-[#E5E5DE] hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-[#5B6B7A]">En Attente</span>
            {pendingRides.length > 0 && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            )}
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1 font-serif-heading">
            {pendingRides.length}
          </p>
        </div>

        <div 
          onClick={() => setFilter('confirmed')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            filter === 'confirmed'
              ? 'bg-blue-50 border-blue-300 shadow-xs'
              : 'bg-white border-[#E5E5DE] hover:border-blue-200'
          }`}
        >
          <span className="text-[11px] font-bold uppercase text-[#5B6B7A]">En Cours</span>
          <p className="text-2xl font-black text-blue-600 mt-1 font-serif-heading">
            {activeRides.length}
          </p>
        </div>

        <div 
          onClick={() => setFilter('completed')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            filter === 'completed'
              ? 'bg-emerald-50 border-emerald-300 shadow-xs'
              : 'bg-white border-[#E5E5DE] hover:border-emerald-200'
          }`}
        >
          <span className="text-[11px] font-bold uppercase text-[#5B6B7A]">Terminées</span>
          <p className="text-2xl font-black text-[#0D631B] mt-1 font-serif-heading">
            {completedRides.length}
          </p>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-[#E5E5DE]">
          <span className="text-[11px] font-bold uppercase text-[#5B6B7A]">Gain Estimé</span>
          <p className="text-lg font-black text-[#111C2D] mt-1 font-serif-heading truncate">
            {formatFcfa(todayEarningsFcfa)}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Admin Driver Validation Toggle */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#E5E5DE]">
        {(['pending', 'confirmed', 'completed', 'all'] as const).map((tab) => {
          const labels: Record<string, string> = {
            pending: `En attente (${pendingRides.length})`,
            confirmed: `En cours (${activeRides.length})`,
            completed: `Terminées (${completedRides.length})`,
            all: `Toutes (${rides.length})`,
          };
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 min-w-[100px] py-2 px-2 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                filter === tab
                  ? 'bg-[#0D631B] text-white shadow-xs'
                  : 'text-[#5B6B7A] hover:bg-[#F7F8FB] hover:text-[#111C2D]'
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}

        {/* ADMIN DRIVER APPROVAL TAB */}
        {isAdmin && (
          <button
            onClick={() => setFilter('drivers_admin')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              filter === 'drivers_admin'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Validation Chauffeurs ({pendingDriverRequests.length})</span>
          </button>
        )}
      </div>

      {/* ADMIN DRIVER APPROVAL SCREEN */}
      {filter === 'drivers_admin' && isAdmin && (
        <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b pb-3 border-amber-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
              <div>
                <h3 className="text-base font-bold text-[#111C2D]">
                  Validation des Compte Chauffeurs (Admin)
                </h3>
                <p className="text-xs text-[#5B6B7A]">
                  En tant qu'administrateur, validez ou refusez les demandes de création de comptes chauffeurs.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-black rounded-full">
              {pendingDriverRequests.length} en attente
            </span>
          </div>

          {/* Pending Requests List */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider">
              ⏳ Demandes en attente de validation ({pendingDriverRequests.length})
            </h4>

            {pendingDriverRequests.length === 0 ? (
              <p className="text-xs text-gray-500 italic bg-gray-50 p-4 rounded-2xl">
                Aucune demande de création de compte chauffeur en attente.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {pendingDriverRequests.map((driver) => (
                  <div key={driver.uid} className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-amber-950">{driver.displayName || 'Sans nom'}</p>
                        <p className="text-xs text-amber-800">{driver.email}</p>
                        <p className="text-xs text-amber-800 font-semibold">{driver.phone || 'Sans téléphone'}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold rounded-full">
                        En attente
                      </span>
                    </div>

                    {driver.vehicleNumber && (
                      <p className="text-xs font-bold text-amber-900 bg-white/80 p-2 rounded-xl border border-amber-200">
                        🛵 Moto/Plaque: {driver.vehicleNumber}
                      </p>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleAdminApproveDriver(driver.uid, true)}
                        disabled={actionLoadingId === driver.uid}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Valider Chauffeur</span>
                      </button>

                      <button
                        onClick={() => handleAdminApproveDriver(driver.uid, false)}
                        disabled={actionLoadingId === driver.uid}
                        className="py-2 px-3 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Refuser</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Already Approved Drivers */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-black uppercase text-[#0D631B] tracking-wider">
              ✅ Chauffeurs Actifs Approuvés ({approvedDriversList.length})
            </h4>

            {approvedDriversList.length === 0 ? (
              <p className="text-xs text-gray-500 italic bg-gray-50 p-4 rounded-2xl">
                Aucun chauffeur actuellement actif.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {approvedDriversList.map((driver) => (
                  <div key={driver.uid} className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-950">{driver.displayName || driver.email}</p>
                      <p className="text-[11px] text-emerald-800">{driver.phone || driver.email}</p>
                      {driver.vehicleNumber && (
                        <p className="text-[10px] text-emerald-700 font-medium">Moto: {driver.vehicleNumber}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleAdminApproveDriver(driver.uid, false)}
                      disabled={actionLoadingId === driver.uid}
                      className="py-1.5 px-2.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[11px] rounded-xl transition cursor-pointer"
                    >
                      Désactiver
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rides Feed */}
      {filter !== 'drivers_admin' && (
        loading ? (
          <div className="bg-white rounded-3xl p-8 border border-[#E5E5DE] text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#0D631B] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-[#5B6B7A] font-medium">Chargement des courses en direct...</p>
          </div>
        ) : filteredRides.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-[#E5E5DE] text-center space-y-3">
            <Clock className="w-10 h-10 text-[#5B6B7A]/40 mx-auto" />
            <h3 className="text-base font-bold text-[#111C2D]">Aucune course dans cette catégorie</h3>
            <p className="text-xs text-[#5B6B7A] max-w-xs mx-auto">
              Dès qu'un client réserve une course à Dabou, elle apparaîtra instantanément ici avec un signal sonore.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredRides.map((ride) => {
              const isPending = ride.status === 'pending';
              const isConfirmed = ride.status === 'confirmed';
              const isCompleted = ride.status === 'completed';
              const isCancelled = ride.status === 'cancelled';

              return (
                <div
                  key={ride.id}
                  className={`bg-white rounded-3xl p-5 border transition-all ${
                    isPending
                      ? 'border-amber-300 ring-2 ring-amber-100 shadow-md'
                      : isConfirmed
                      ? 'border-blue-300 ring-2 ring-blue-50'
                      : 'border-[#E5E5DE] hover:border-[#D4E8D9]'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between border-b border-[#F0F2F5] pb-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-[#0D631B]">
                          #{ride.id.slice(-6).toUpperCase()}
                        </span>
                        {isPending && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Nouvelle Demande
                          </span>
                        )}
                        {isConfirmed && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            En cours de livraison
                          </span>
                        )}
                        {isCompleted && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Terminée
                          </span>
                        )}
                        {isCancelled && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Annulée
                          </span>
                        )}

                        <span className="bg-gray-100 text-gray-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {ride.serviceType === 'delivery' ? '📦 Livraison' : ride.serviceType === 'concierge' ? '🔑 Conciergerie' : '🚖 Transport VTC'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5B6B7A] font-medium mt-0.5">
                        Commandée le {ride.createdAt instanceof Date ? ride.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'récemment'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-[#0D631B] font-serif-heading block leading-none">
                        {formatFcfa(ride.priceFcfa)}
                      </span>
                      <span className="text-[10px] text-[#5B6B7A] font-semibold">
                        {ride.distanceKm} km (~{ride.durationMin} min)
                      </span>
                    </div>
                  </div>

                  {/* Client Info Bar */}
                  <div className="bg-[#F7F8FB] rounded-2xl p-3 mb-3 flex items-center justify-between border border-[#E4E9EE]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#E8F3EA] text-[#0D631B] font-bold text-xs flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111C2D]">
                          {ride.userName || 'Client Dabou'}
                        </p>
                        <p className="text-[11px] text-[#5B6B7A] font-medium">
                          {ride.userPhone || ride.userEmail || 'Sans numéro'}
                        </p>
                      </div>
                    </div>

                    {/* Client Direct Actions */}
                    <div className="flex items-center gap-1.5">
                      {ride.userPhone && (
                        <a
                          href={`tel:${ride.userPhone}`}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold p-2 rounded-xl transition flex items-center gap-1"
                          title="Appeler le client"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Appeler</span>
                        </a>
                      )}
                      <a
                        href={generateWhatsAppDispatchUrl(ride)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] hover:bg-[#1EBE5B] text-white text-xs font-bold p-2 rounded-xl transition flex items-center gap-1"
                        title="Envoyer sur WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Pickup & Destination Route */}
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#0D631B] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#5B6B7A] block">Lieu de prise en charge</span>
                        <p className="font-semibold text-[#111C2D]">{ride.pickupAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Navigation className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#5B6B7A] block">Destination</span>
                        <p className="font-semibold text-[#111C2D]">{ride.destinationAddress}</p>
                      </div>
                    </div>

                    {ride.packageDetails && (
                      <div className="bg-[#E8F3EA] p-2.5 rounded-xl border border-[#D4E8D9] text-[11px] text-[#0D631B] mt-2">
                        <span className="font-bold">📦 Colis :</span> {ride.packageDetails} {ride.recipientPhone ? `(Tél destinataire: ${ride.recipientPhone})` : ''}
                      </div>
                    )}

                    {ride.conciergeTask && (
                      <div className="bg-[#E8F3EA] p-2.5 rounded-xl border border-[#D4E8D9] text-[11px] text-[#0D631B] mt-2">
                        <span className="font-bold">🔑 Tâche Conciergerie :</span> {ride.conciergeTask}
                      </div>
                    )}

                    {ride.notes && (
                      <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 mt-2">
                        <span className="font-bold">Note du client:</span> {ride.notes}
                      </div>
                    )}
                  </div>

                  {/* Driver Action Buttons */}
                  <div className="pt-2 border-t border-[#F0F2F5] flex flex-wrap gap-2">
                    {isPending && (
                      <button
                        onClick={() => handleAcceptRide(ride)}
                        disabled={actionLoadingId === ride.id}
                        className="flex-1 py-3 px-4 bg-[#0D631B] hover:bg-[#0A4E15] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {actionLoadingId === ride.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>ACCEPTER LA COURSE</span>
                      </button>
                    )}

                    {isConfirmed && (
                      <>
                        <button
                          onClick={() => handleStatusChange(ride.id, 'completed')}
                          disabled={actionLoadingId === ride.id}
                          className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Marquer comme Terminée</span>
                        </button>

                        <button
                          onClick={() => handleStatusChange(ride.id, 'cancelled')}
                          disabled={actionLoadingId === ride.id}
                          className="py-2.5 px-3 bg-gray-100 hover:bg-rose-100 text-gray-700 hover:text-rose-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Annuler</span>
                        </button>
                      </>
                    )}

                    {(isCompleted || isCancelled) && (
                      <div className="text-[11px] text-[#5B6B7A] italic">
                        {isCompleted ? 'Course réalisée avec succès.' : 'Course annulée.'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};
