import React from 'react';
import { Compass, Clock, User, Bike } from 'lucide-react';

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
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#E5E5DE] shadow-sm sm:relative sm:border-t-0 sm:shadow-none sm:bg-transparent sm:pt-4">
      <div className="max-w-lg mx-auto px-2 py-2 sm:px-0 flex items-center justify-around sm:gap-2 sm:justify-center">
        {/* Booking Tab */}
        <button
          onClick={() => onChangeTab('booking')}
          className={`flex-1 sm:flex-initial flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-3 py-2 rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'booking'
              ? 'bg-[#E8F3EA] text-[#0D631B] border border-[#D4E8D9]'
              : 'text-[#5B6B7A] hover:text-[#111C2D] hover:bg-[#F7F8FB]'
          }`}
        >
          <Compass className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'booking' ? 'text-[#0D631B]' : 'text-[#5B6B7A]'}`} />
          <span>Réserver</span>
        </button>

        {/* History Tab */}
        <button
          onClick={() => onChangeTab('history')}
          className={`flex-1 sm:flex-initial flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-3 py-2 rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition relative ${
            activeTab === 'history'
              ? 'bg-[#E8F3EA] text-[#0D631B] border border-[#D4E8D9]'
              : 'text-[#5B6B7A] hover:text-[#111C2D] hover:bg-[#F7F8FB]'
          }`}
        >
          <div className="relative">
            <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'history' ? 'text-[#0D631B]' : 'text-[#5B6B7A]'}`} />
            {pendingRidesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#0D631B] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {pendingRidesCount}
              </span>
            )}
          </div>
          <span>Historique</span>
        </button>

        {/* Driver Dashboard Tab */}
        {showDriverTab && (
          <button
            onClick={() => onChangeTab('driver')}
            className={`flex-1 sm:flex-initial flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-3 py-2 rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition relative ${
              activeTab === 'driver'
                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
                : 'text-[#0D631B] bg-[#E8F3EA]/70 hover:bg-[#E8F3EA] border border-[#D4E8D9]'
            }`}
          >
            <div className="relative">
              <Bike className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'driver' ? 'text-amber-900' : 'text-[#0D631B]'}`} />
              {driverPendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white animate-bounce">
                  {driverPendingCount}
                </span>
              )}
            </div>
            <span>Chauffeur</span>
          </button>
        )}

        {/* Account Tab */}
        <button
          onClick={() => onChangeTab('account')}
          className={`flex-1 sm:flex-initial flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-3 py-2 rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'account'
              ? 'bg-[#E8F3EA] text-[#0D631B] border border-[#D4E8D9]'
              : 'text-[#5B6B7A] hover:text-[#111C2D] hover:bg-[#F7F8FB]'
          }`}
        >
          <User className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'account' ? 'text-[#0D631B]' : 'text-[#5B6B7A]'}`} />
          <span>Compte</span>
        </button>
      </div>
    </div>
  );
};

