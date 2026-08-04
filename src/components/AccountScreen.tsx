import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  LogOut, 
  Save, 
  Loader2, 
  Check, 
  ShieldCheck, 
  MessageSquare, 
  HelpCircle, 
  Info,
  Bike,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DISPATCH_WHATSAPP_NUMBER } from '../services/notificationService';

interface AccountScreenProps {
  onOpenAuth: () => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({ onOpenAuth }) => {
  const { user, userProfile, logout, updateProfileData, requestDriverRole, isAdmin, isApprovedDriver } = useAuth();
  const [name, setName] = useState<string>(userProfile?.displayName || user?.displayName || '');
  const [phone, setPhone] = useState<string>(userProfile?.phone || '');
  const [vehicleNumber, setVehicleNumber] = useState<string>(userProfile?.vehicleNumber || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSubmittingDriverReq, setIsSubmittingDriverReq] = useState<boolean>(false);
  const [driverReqSuccess, setDriverReqSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="bg-white rounded-[32px] p-8 border border-[#E5E5DE] shadow-xs text-center space-y-4 my-6">
        <div className="w-14 h-14 bg-[#E8F3EA] text-[#0D631B] rounded-full flex items-center justify-center mx-auto border border-[#D4E8D9]">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#111C2D] font-serif-heading">Mon Compte</h2>
          <p className="text-xs text-[#5B6B7A] mt-1">
            Connectez-vous pour gérer votre profil et vos coordonnées.
          </p>
        </div>
        <button
          onClick={onOpenAuth}
          className="py-3 px-6 bg-[#0D631B] hover:bg-[#0A4E15] text-white font-bold text-xs rounded-2xl shadow transition"
        >
          Se connecter / S'inscrire
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(false);
    setSaveSuccess(false);
    setErrorMsg(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg('Veuillez saisir un nom complet valide (au moins 2 caractères).');
      return;
    }

    if (!trimmedPhone) {
      setErrorMsg('Le numéro de téléphone est obligatoire pour pouvoir vous contacter.');
      return;
    }

    // Clean phone number: remove spaces, hyphens, plus signs
    const cleanedPhone = trimmedPhone.replace(/[\s\-\+\(\)]/g, '');
    if (!/^\d{8,13}$/.test(cleanedPhone)) {
      setErrorMsg('Veuillez saisir un numéro de téléphone valide (ex: 07 00 00 00 00 ou +225 0700000000).');
      return;
    }

    setIsSaving(true);

    try {
      await updateProfileData(trimmedName, trimmedPhone);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setErrorMsg(err.message || 'Impossible de mettre à jour le profil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) return;
    setIsSubmittingDriverReq(true);
    setDriverReqSuccess(false);
    try {
      await requestDriverRole(vehicleNumber);
      setDriverReqSuccess(true);
    } catch (err: any) {
      alert('Erreur lors de la demande chauffeur: ' + (err.message || String(err)));
    } finally {
      setIsSubmittingDriverReq(false);
    }
  };

  const isPendingDriver = userProfile?.role === 'driver_pending';

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      {/* Header Profile Banner */}
      <div className="bg-[#0D631B] text-white rounded-[32px] p-6 shadow-xs flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center font-bold text-xl text-white shadow-inner shrink-0">
          {(name || user.email || 'A').charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold font-serif-heading tracking-tight">
            {name || 'Client Allô Dabou'}
          </h2>
          <p className="text-xs text-white/80 mt-0.5">{user.email}</p>
          
          <div className="flex flex-wrap gap-1.5 mt-2">
            {isAdmin && (
              <span className="px-2.5 py-0.5 bg-amber-400 text-amber-950 text-[10px] font-black rounded-full uppercase tracking-wider">
                👑 Admin Dabou
              </span>
            )}
            {isApprovedDriver && !isAdmin && (
              <span className="px-2.5 py-0.5 bg-emerald-400 text-emerald-950 text-[10px] font-black rounded-full uppercase tracking-wider flex items-center gap-1">
                <Bike className="w-3 h-3" />
                Chauffeur Certifié Validé
              </span>
            )}
            {isPendingDriver && (
              <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-black rounded-full uppercase tracking-wider flex items-center gap-1">
                <Bike className="w-3 h-3 animate-bounce" />
                Chauffeur en attente de validation
              </span>
            )}
            {!isApprovedDriver && !isPendingDriver && (
              <span className="px-2.5 py-0.5 bg-white/15 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Client Passager
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Driver Status Card */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#E5E5DE] shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-[#111C2D] font-serif-heading flex items-center gap-2">
          <Bike className="w-4 h-4 text-[#0D631B]" />
          <span>Statut Chauffeur VTC</span>
        </h3>

        {isApprovedDriver ? (
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-1">
            <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Votre compte chauffeur est actif et approuvé !</span>
            </p>
            <p className="text-[11px] text-emerald-800">
              Vous pouvez accepter les courses clients et recevoir un signal sonore + notification push à chaque demande dans l'onglet Chauffeur.
            </p>
            {userProfile?.vehicleNumber && (
              <p className="text-[11px] font-bold text-emerald-950 pt-1">
                Immatriculation moto: {userProfile.vehicleNumber}
              </p>
            )}
          </div>
        ) : isPendingDriver ? (
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-1">
            <p className="text-xs font-bold text-amber-900">
              ⏳ Compte Chauffeur en attente de validation
            </p>
            <p className="text-[11px] text-amber-800">
              L'Administrateur Allô Dabou VTC vérifie votre dossier et validera l'accès sous peu.
            </p>
            {userProfile?.vehicleNumber && (
              <p className="text-[11px] font-bold text-amber-900 pt-1">
                Plaque moto enregistrée: {userProfile.vehicleNumber}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-[#F7F8FB] p-4 rounded-2xl border border-[#E4E9EE] space-y-3">
            <p className="text-xs text-[#5B6B7A]">
              Vous souhaitez devenir chauffeur de taxi-moto Allô Dabou VTC ? Renseignez votre numéro d'engin ci-dessous pour soumettre votre demande à l'administrateur.
            </p>
            <form onSubmit={handleRequestDriver} className="space-y-2">
              <input
                type="text"
                required
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="Plaque ou marque moto (Ex: Moto TVS 4522 DB)"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E4E9EE] rounded-xl text-xs font-medium outline-none focus:border-[#0D631B]"
              />
              <button
                type="submit"
                disabled={isSubmittingDriverReq}
                className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingDriverReq ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Bike className="w-3.5 h-3.5" />
                )}
                <span>Soumettre ma demande Chauffeur à l'Admin</span>
              </button>
            </form>
            {driverReqSuccess && (
              <p className="text-xs text-[#0D631B] font-bold">
                Demande envoyée avec succès à l'Administrateur !
              </p>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Form Card */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#E5E5DE] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#111C2D] font-serif-heading flex items-center gap-2">
          <User className="w-4 h-4 text-[#0D631B]" />
          <span>Informations personnelles</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#111C2D] block mb-1">Nom complet</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                className="w-full pl-10 pr-4 py-3 bg-[#F7F8FB] border border-[#E4E9EE] rounded-2xl text-sm font-medium outline-none focus:border-[#0D631B] text-[#111C2D]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#111C2D] block mb-1">
              Adresse e-mail (Non modifiable)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-3 bg-[#E5E5DE]/50 border border-[#E4E9EE] rounded-2xl text-sm font-medium text-[#5B6B7A] cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#111C2D] block mb-1">
              Numéro de téléphone principal
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 07 08 09 10 11"
                className="w-full pl-10 pr-4 py-3 bg-[#F7F8FB] border border-[#E4E9EE] rounded-2xl text-sm font-medium outline-none focus:border-[#0D631B] text-[#111C2D]"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 px-4 bg-[#0D631B] hover:bg-[#0A4E15] text-white font-bold text-xs rounded-full shadow transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Modifications enregistrées !</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer le profil</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Pricing Reference Card */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#E5E5DE] shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-[#111C2D] font-serif-heading flex items-center gap-2">
          <Bike className="w-4 h-4 text-[#0D631B]" />
          <span>Barème des Tarifs - Allô Dabou VTC</span>
        </h3>

        <div className="text-xs text-[#5B6B7A] space-y-2">
          <div className="p-3.5 bg-[#E8F3EA] rounded-2xl border border-[#D4E8D9] flex justify-between items-center">
            <span className="font-bold text-[#111C2D]">Forfait de base (≤ 4 km) :</span>
            <span className="font-bold text-[#0D631B] text-base font-serif-heading">500 FCFA</span>
          </div>
          <div className="p-3.5 bg-[#F7F8FB] rounded-2xl border border-[#E4E9EE] flex justify-between items-center">
            <span className="font-bold text-[#111C2D]">Kilomètre supplémentaire (&gt; 4 km) :</span>
            <span className="font-bold text-[#111C2D] text-sm">+150 FCFA / km</span>
          </div>
          <p className="text-[11px] text-[#5B6B7A] italic">
            Calculé automatiquement sur la distance réelle mesurée par Google Distance Matrix.
          </p>
        </div>
      </div>

      {/* Support & Sign Out */}
      <div className="space-y-3">
        <a
          href={`https://wa.me/${DISPATCH_WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-4 bg-[#E8F3EA] hover:bg-[#D4E8D9] text-[#0D631B] font-bold text-xs rounded-2xl border border-[#D4E8D9] flex items-center justify-center gap-2 transition"
        >
          <MessageSquare className="w-4 h-4 text-[#0D631B]" />
          <span>Contacter le support WhatsApp (01 01 68 25 35)</span>
        </a>

        <button
          onClick={logout}
          className="w-full py-3.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-2xl border border-red-200 flex items-center justify-center gap-2 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Se déconnecter</span>
        </button>
      </div>
    </div>
  );
};

