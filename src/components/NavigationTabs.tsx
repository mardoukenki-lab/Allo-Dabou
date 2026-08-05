import React from 'react';
import { Compass, Clock, User, Bike } from 'lucide-react';
import { triggerHaptic } from '../services/hapticService';

interface NavigationTabsProps {
  activeTab: 'booking' | 'history' | 'account' | 'driver';
  onChangeTab: (tab: 'booking' | 'history' | 'account' | 'driver') => void;
  pendingRidesCount?: number;
  driverPendingCount?: number;
  showDriverTab?: boolean;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onChangeTab,
  pendingRidesCount = 0,
  driverPendingCount = 0,
  showDriverTab = true,
}) => {
  const handleTabClick = (tab: 'booking' | 'history' | 'account' | 'driver') => {
    triggerHaptic('selection');
    onChangeTab(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E4E9EE] shadow-lg pb-safe">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around gap-1">
        {/* Booking Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('booking')}
          className="flex-1 min-h-[52px] flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer group"
        >
          <div
            className={`px-5 py-1.5 rounded-full transition-all duration-200 flex items-center justify-center ${
              activeTab === 'booking'
                ? 'bg-[#0D631B] text-white shadow-sm'
                : 'bg-transparent text-[#5B6B7A] group-hover:bg-[#F7F8FB]'
            }`}
          >
            <Compass className={`w-5 h-5 ${activeTab === 'booking' ? 'text-white' : 'text-[#5B6B7A]'}`} />
          </div>
          <span
            className={`text-[11px] font-bold tracking-tight transition-colors ${
              activeTab === 'booking' ? 'text-[#0D631B] font-extrabold' : 'text-[#5B6B7A]'
            }`}
          >
            Réserver
          </span>
        </button>

        {/* History Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('history')}
          className="flex-1 min-h-[52px] flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer group"
        >
          <div
            className={`px-5 py-1.5 rounded-full transition-all duration-200 flex items-center justify-center relative ${
              activeTab === 'history'
                ? 'bg-[#0D631B] text-white shadow-sm'
                : 'bg-transparent text-[#5B6B7A] group-hover:bg-[#F7F8FB]'
            }`}
          >
            <Clock className={`w-5 h-5 ${activeTab === 'history' ? 'text-white' : 'text-[#5B6B7A]'}`} />
            {pendingRidesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-[#111C2D] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {pendingRidesCount}
              </span>
            )}
          </div>
          <span
            className={`text-[11px] font-bold tracking-tight transition-colors ${
              activeTab === 'history' ? 'text-[#0D631B] font-extrabold' : 'text-[#5B6B7A]'
            }`}
          >
            Historique
          </span>
        </button>

        {/* Driver Dashboard Tab */}
        {showDriverTab && (
          <button
            type="button"
            onClick={() => handleTabClick('driver')}
            className="flex-1 min-h-[52px] flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer group"
          >
            <div
              className={`px-5 py-1.5 rounded-full transition-all duration-200 flex items-center justify-center relative ${
                activeTab === 'driver'
                  ? 'bg-amber-500 text-[#111C2D] shadow-sm'
                  : 'bg-amber-100/60 text-amber-900 group-hover:bg-amber-100'
              }`}
            >
              <Bike className={`w-5 h-5 ${activeTab === 'driver' ? 'text-[#111C2D]' : 'text-amber-900'}`} />
              {driverPendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                  {driverPendingCount}
                </span>
              )}
            </div>
            <span
              className={`text-[11px] font-bold tracking-tight transition-colors ${
                activeTab === 'driver' ? 'text-amber-900 font-extrabold' : 'text-amber-800'
              }`}
            >
              Chauffeur
            </span>
          </button>
        )}

        {/* Account Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('account')}
          className="flex-1 min-h-[52px] flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer group"
        >
          <div
            className={`px-5 py-1.5 rounded-full transition-all duration-200 flex items-center justify-center ${
              activeTab === 'account'
                ? 'bg-[#0D631B] text-white shadow-sm'
                : 'bg-transparent text-[#5B6B7A] group-hover:bg-[#F7F8FB]'
            }`}
          >
            <User className={`w-5 h-5 ${activeTab === 'account' ? 'text-white' : 'text-[#5B6B7A]'}`} />
          </div>
          <span
            className={`text-[11px] font-bold tracking-tight transition-colors ${
              activeTab === 'account' ? 'text-[#0D631B] font-extrabold' : 'text-[#5B6B7A]'
            }`}
          >
            Compte
          </span>
        </button>
      </div>
    </nav>
  );
};
