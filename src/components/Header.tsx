import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bike, User, LogIn } from 'lucide-react';

interface HeaderProps {
  onOpenAuth: () => void;
  onNavigateTab: (tab: 'booking' | 'history' | 'account' | 'driver') => void;
  activeTab?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth, onNavigateTab, activeTab }) => {
  const { user, userProfile, isDriver } = useAuth();

  return (
    <header className="bg-white border-b border-[#E5E5DE] sticky top-0 z-30 shadow-xs">
      <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => onNavigateTab('booking')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 bg-[#0D631B] rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Bike className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold tracking-tight text-[#0D631B] font-serif-heading leading-none">
                Allô Dabou VTC
              </h1>
            </div>
            <p className="text-[11px] text-[#5B6B7A] font-medium leading-tight mt-0.5">
              Taxis-motos • Dabou
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Driver Mode Button */}
          {isDriver && (
            <button
              onClick={() => onNavigateTab('driver')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition border ${
                activeTab === 'driver'
                  ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Bike className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Chauffeur</span>
            </button>
          )}

          {user ? (
            <button
              onClick={() => onNavigateTab('account')}
              className="flex items-center gap-2 bg-[#F7F8FB] hover:bg-[#E8F3EA] text-[#111C2D] hover:text-[#0D631B] text-xs font-semibold px-3 py-1.5 rounded-xl transition border border-[#E4E9EE]"
            >
              <div className="w-6 h-6 rounded-full bg-[#E8F3EA] text-[#0D631B] flex items-center justify-center font-bold text-[10px]">
                {(userProfile?.displayName || user.email || 'A').charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate hidden xs:inline font-bold">
                {userProfile?.displayName || user.email?.split('@')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-[#0D631B] hover:bg-[#0A4E15] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Connexion</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

