import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Loader2, Bike, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateLicensePlate } from '../lib/plateGenerator';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [accountType, setAccountType] = useState<'client' | 'driver'>('client');
  const [vehicleNumber, setVehicleNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEmailInUse, setIsEmailInUse] = useState(false);
  const [isInvalidCreds, setIsInvalidCreds] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const translateFirebaseError = (err: any): string => {
    const code = (err?.code || err?.message || String(err)).toLowerCase();
    if (code.includes('invalid-credential') || code.includes('user-not-found') || code.includes('wrong-password')) {
      return 'Adresse e-mail ou mot de passe incorrect.';
    }
    if (code.includes('email-already-in-use')) {
      return 'Un compte existe déjà avec cette adresse e-mail.';
    }
    if (code.includes('weak-password')) {
      return 'Le mot de passe doit comporter au moins 6 caractères.';
    }
    if (code.includes('invalid-email')) {
      return 'Veuillez saisir une adresse e-mail valide.';
    }
    return 'Une erreur est survenue lors de l’authentification.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setIsEmailInUse(false);
    setIsInvalidCreds(false);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
      } else if (mode === 'register') {
        if (!name.trim()) {
          setErrorMsg('Veuillez renseigner votre nom complet.');
          setLoading(false);
          return;
        }
        if (!phone.trim()) {
          setErrorMsg('Veuillez renseigner votre numéro de téléphone.');
          setLoading(false);
          return;
        }
        let finalVehicle = vehicleNumber.trim();
        if (accountType === 'driver' && !finalVehicle) {
          finalVehicle = generateLicensePlate();
          setVehicleNumber(finalVehicle);
        }

        await register(email, password, name, phone, accountType, finalVehicle);
        
        if (accountType === 'driver' && email.trim().toLowerCase() !== 'mardoukenki@gmail.com') {
          setSuccessMsg('Compte chauffeur créé avec succès ! Votre profil est en attente de validation par l’administrateur Allô Dabou.');
          setTimeout(() => {
            onClose();
          }, 3500);
        } else {
          onClose();
        }
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMsg('Un lien de réinitialisation a été envoyé à votre adresse e-mail.');
      }
    } catch (err: any) {
      console.warn('Auth attempt error:', err?.code || err?.message || err);
      const errStr = (err?.code || err?.message || String(err)).toLowerCase();
      if (errStr.includes('email-already-in-use')) {
        setIsEmailInUse(true);
      } else if (errStr.includes('invalid-credential') || errStr.includes('user-not-found') || errStr.includes('wrong-password')) {
        setIsInvalidCreds(true);
      }
      setErrorMsg(translateFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-[32px] max-w-sm w-full p-6 sm:p-8 shadow-xl border border-[#E5E5DE] relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-[#5B6B7A] hover:text-[#111C2D] rounded-full hover:bg-[#F7F8FB] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Branding Header */}
        <div className="text-center space-y-1.5 mb-5">
          <div className="w-12 h-12 bg-[#E8F3EA] text-[#0D631B] rounded-2xl flex items-center justify-center mx-auto border border-[#D4E8D9]">
            <Bike className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#111C2D] font-serif-heading tracking-tight">
            {mode === 'login' && 'Connexion Allô Dabou'}
            {mode === 'register' && (accountType === 'driver' ? 'Inscription Chauffeur VTC' : 'Créer un compte Client')}
            {mode === 'forgot' && 'Réinitialiser le mot de passe'}
          </h2>
          <p className="text-xs text-[#5B6B7A]">
            {mode === 'login' && 'Accédez à vos réservations et vos coordonnées'}
            {mode === 'register' && (accountType === 'driver' ? 'Validation obligatoire par l’administrateur Dabou' : 'Inscrivez-vous pour réserver vos trajets')}
            {mode === 'forgot' && 'Entrez votre e-mail pour recevoir un lien'}
          </p>
        </div>

        {/* Tab Toggle for Login/Register */}
        {mode !== 'forgot' && (
          <div className="flex bg-[#F7F8FB] p-1.5 rounded-2xl mb-4 text-xs font-bold border border-[#E4E9EE]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                mode === 'login' ? 'bg-white text-[#0D631B] shadow-xs' : 'text-[#5B6B7A] hover:text-[#111C2D]'
              }`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                mode === 'register' ? 'bg-white text-[#0D631B] shadow-xs' : 'text-[#5B6B7A] hover:text-[#111C2D]'
              }`}
            >
              S'inscrire
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <>
              {/* Account Type Selector */}
              <div>
                <label className="text-xs font-bold text-[#111C2D] block mb-1">Type de compte</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType('client')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      accountType === 'client'
                        ? 'bg-[#E8F3EA] text-[#0D631B] border-[#0D631B]'
                        : 'bg-[#F7F8FB] text-[#5B6B7A] border-[#E4E9EE]'
                    }`}
                  >
                    <span>👤 Client</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('driver')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      accountType === 'driver'
                        ? 'bg-amber-100 text-amber-900 border-amber-500'
                        : 'bg-[#F7F8FB] text-[#5B6B7A] border-[#E4E9EE]'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>🚖 Chauffeur</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#111C2D] block mb-1">Nom complet</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Yao Koffi"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F7F8FB] border border-[#E4E9EE] rounded-2xl text-xs font-medium outline-none focus:border-[#0D631B] text-[#111C2D]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#111C2D] block mb-1">Numéro de téléphone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 07 00 00 00 00"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F7F8FB] border border-[#E4E9EE] rounded-2xl text-xs font-medium outline-none focus:border-[#0D631B] text-[#111C2D]"
                  />
                </div>
              </div>

              {accountType === 'driver' && (
                <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200/80 space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-amber-900 block">Plaque d'Immatriculation Moto</label>
                      <button
                        type="button"
                        onClick={() => setVehicleNumber(generateLicensePlate())}
                        className="text-[10px] font-bold text-[#0D631B] bg-white border border-[#0D631B]/30 hover:bg-[#E8F3EA] px-2 py-0.5 rounded-lg flex items-center gap-1 transition"
                      >
                        <Sparkles className="w-3 h-3 text-[#0D631B]" />
                        <span>Générer plaque</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="Ex: DB-4829-CI01"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold outline-none focus:border-amber-600 text-[#111C2D]"
                    />
                  </div>
                  <p className="text-[10px] text-amber-800 leading-tight">
                    🔒 <span className="font-bold">Générateur automatique :</span> Vous pouvez générer une plaque conforme Allô Dabou ou saisir la vôtre.
                  </p>
                </div>
              )}
            </>
          )}

          <div>
            <label className="text-xs font-bold text-[#111C2D] block mb-1">Adresse e-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F7F8FB] border border-[#E4E9EE] rounded-2xl text-xs font-medium outline-none focus:border-[#0D631B] text-[#111C2D]"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#111C2D]">Mot de passe</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                    }}
                    className="text-[11px] text-[#0D631B] font-bold hover:underline cursor-pointer"
                  >
                    Oublié ?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F7F8FB] border border-[#E4E9EE] rounded-2xl text-xs font-medium outline-none focus:border-[#0D631B] text-[#111C2D]"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="space-y-2">
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-2xl border border-red-200">
                {errorMsg}
              </p>
              {isEmailInUse && mode === 'register' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setIsEmailInUse(false);
                  }}
                  className="w-full py-2 px-3 bg-[#E8F3EA] hover:bg-[#D4E8D9] text-[#0D631B] font-bold text-xs rounded-2xl border border-[#D4E8D9] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Se connecter avec cet e-mail</span>
                </button>
              )}
              {isInvalidCreds && mode === 'login' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg(null);
                      setIsInvalidCreds(false);
                    }}
                    className="flex-1 py-2 px-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-[11px] rounded-xl transition cursor-pointer text-center"
                  >
                    Créer un compte
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                      setIsInvalidCreds(false);
                    }}
                    className="flex-1 py-2 px-2 bg-[#E8F3EA] hover:bg-[#D4E8D9] text-[#0D631B] font-bold text-[11px] rounded-xl transition cursor-pointer text-center"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <p className="text-xs text-[#0D631B] bg-[#E8F3EA] p-3 rounded-2xl border border-[#D4E8D9] font-medium">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#0D631B] hover:bg-[#0A4E15] text-white font-extrabold text-xs rounded-full shadow transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              <span>Se connecter</span>
            ) : mode === 'register' ? (
              <span>S'inscrire {accountType === 'driver' ? 'comme Chauffeur' : ''}</span>
            ) : (
              <span>Envoyer le lien</span>
            )}
          </button>
        </form>

        {mode === 'forgot' && (
          <button
            onClick={() => setMode('login')}
            className="w-full text-center text-xs font-bold text-[#5B6B7A] hover:text-[#111C2D] mt-4 block cursor-pointer"
          >
            ← Retour à la connexion
          </button>
        )}
      </div>
    </div>
  );
};

