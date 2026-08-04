import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Loader2, Bike, KeyRound, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'register' | 'forgot';

export const LoginScreen: React.FC = () => {
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
        if (accountType === 'driver' && !vehicleNumber.trim()) {
          setErrorMsg('Veuillez indiquer la plaque ou le numéro d’engin/moto.');
          setLoading(false);
          return;
        }

        await register(email, password, name, phone, accountType, vehicleNumber);
        
        if (accountType === 'driver' && email.trim().toLowerCase() !== 'mardoukenki@gmail.com') {
          setSuccessMsg('Compte chauffeur créé avec succès ! Votre compte sera validé par l’administrateur Dabou.');
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
    <div className="min-h-screen bg-[#F7F8FB] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-xl border border-[#E5E5DE] space-y-5 my-auto">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#0D631B] text-white rounded-3xl flex items-center justify-center mx-auto shadow-md border-2 border-emerald-400">
            <Bike className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#111C2D] font-serif-heading tracking-tight">
              Allô Dabou VTC
            </h1>
            <p className="text-xs font-semibold text-[#0D631B] uppercase tracking-wider mt-0.5">
              Service de Transport & Moto-Taxi Rapide à Dabou
            </p>
          </div>
          <p className="text-xs text-[#5B6B7A] pt-1">
            {mode === 'login' && 'Connectez-vous pour accéder à l’application et commander vos trajets.'}
            {mode === 'register' && (accountType === 'driver' ? 'Inscription Chauffeur VTC (validation admin requise).' : 'Inscrivez-vous pour réserver vos courses.')}
            {mode === 'forgot' && 'Entrez votre adresse e-mail pour réinitialiser votre mot de passe.'}
          </p>
        </div>

        {/* Tab Selector Login / Register */}
        {mode !== 'forgot' && (
          <div className="flex bg-[#F7F8FB] p-1.5 rounded-2xl text-xs font-bold border border-[#E4E9EE]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
                mode === 'login' ? 'bg-white text-[#0D631B] shadow-xs font-black' : 'text-[#5B6B7A] hover:text-[#111C2D]'
              }`}
            >
              Se Connecter
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
                mode === 'register' ? 'bg-white text-[#0D631B] shadow-xs font-black' : 'text-[#5B6B7A] hover:text-[#111C2D]'
              }`}
            >
              S'inscrire
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              {/* Account Type Selector */}
              <div>
                <label className="text-xs font-bold text-[#111C2D] block mb-1">Je suis un :</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType('client')}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      accountType === 'client'
                        ? 'bg-[#E8F3EA] text-[#0D631B] border-[#0D631B]'
                        : 'bg-[#F7F8FB] text-[#5B6B7A] border-[#E4E9EE]'
                    }`}
                  >
                    <span>👤 Passager Client</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('driver')}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      accountType === 'driver'
                        ? 'bg-amber-100 text-amber-900 border-amber-500'
                        : 'bg-[#F7F8FB] text-[#5B6B7A] border-[#E4E9EE]'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>🚖 Chauffeur Moto</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#111C2D] block mb-1">Nom complet</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5B6B7A] absolute left-3.5 top-3" />
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
                <label className="text-xs font-bold text-[#111C2D] block mb-1">Numéro de Téléphone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#5B6B7A] absolute left-3.5 top-3" />
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
                <div className="bg-amber-50/90 p-3.5 rounded-2xl border border-amber-200 space-y-2">
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">Plaque / Numéro Engin Moto</label>
                    <input
                      type="text"
                      required
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="Ex: Moto TVS - 4522 DB 01"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-medium outline-none focus:border-amber-600 text-[#111C2D]"
                    />
                  </div>
                  <p className="text-[10px] text-amber-800 leading-tight flex items-start gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span><span className="font-bold">Validation obligatoire:</span> L'administration Dabou validera votre profil chauffeur avant activation.</span>
                  </p>
                </div>
              )}
            </>
          )}

          <div>
            <label className="text-xs font-bold text-[#111C2D] block mb-1">Adresse E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5B6B7A] absolute left-3.5 top-3" />
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
                    className="text-[11px] font-bold text-[#0D631B] hover:underline cursor-pointer"
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5B6B7A] absolute left-3.5 top-3" />
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

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium space-y-2">
              <p className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
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
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#0D631B] hover:bg-[#0A4E15] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
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
            type="button"
            onClick={() => setMode('login')}
            className="w-full text-center text-xs text-[#5B6B7A] hover:text-[#111C2D] font-bold cursor-pointer"
          >
            ← Retour à la connexion
          </button>
        )}
      </div>

      <p className="text-[11px] text-[#5B6B7A] font-medium text-center mt-4">
        © Allô Dabou VTC — Application officielle de Transport à Dabou
      </p>
    </div>
  );
};
