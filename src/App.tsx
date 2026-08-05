import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { InstallPwaBanner } from './components/InstallPwaBanner';
import { NotificationPermissionBanner } from './components/NotificationPermissionBanner';
import { InAppNotificationToast } from './components/InAppNotificationToast';
import { BookingScreen } from './components/BookingScreen';
import { ConfirmationScreen } from './components/ConfirmationScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { AccountScreen } from './components/AccountScreen';
import { DriverDashboardScreen } from './components/DriverDashboardScreen';
import { AuthModal } from './components/AuthModal';
import { LoginScreen } from './components/LoginScreen';
import { PricingCalculation, Ride, ServiceType } from './types';
import { subscribeUserRides, subscribeAllRides } from './services/rideService';
import { Bike, Loader2 } from 'lucide-react';

function MainApp() {
  const { user, loading, isDriver, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'booking' | 'confirm' | 'history' | 'account' | 'driver'>('booking');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [driverPendingCount, setDriverPendingCount] = useState<number>(0);

  // Selected booking state to pass to ConfirmationScreen
  const [selectedBooking, setSelectedBooking] = useState<{
    pickup: string;
    destination: string;
    pricing: PricingCalculation;
    serviceType?: ServiceType;
    packageDetails?: string;
    recipientPhone?: string;
    conciergeTask?: string;
  } | null>(null);

  // Subscribe to rides for pending count badge
  useEffect(() => {
    if (!user) {
      setPendingCount(0);
      return;
    }

    const unsub = subscribeUserRides(user.uid, (rides) => {
      const pending = rides.filter((r) => r.status === 'pending').length;
      setPendingCount(pending);
    });

    return () => unsub();
  }, [user]);

  // Subscribe to all rides for driver badge if driver/admin
  useEffect(() => {
    if (!user || (!isDriver && !isAdmin)) {
      setDriverPendingCount(0);
      return;
    }

    const unsub = subscribeAllRides((allRides) => {
      const pendingAll = allRides.filter((r) => r.status === 'pending').length;
      setDriverPendingCount(pendingAll);
    });

    return () => unsub();
  }, [user, isDriver, isAdmin]);

  // 1. Initial loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FB] flex flex-col justify-center items-center p-4">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#0D631B] text-white rounded-3xl flex items-center justify-center mx-auto shadow-md animate-pulse">
            <Bike className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-[#111C2D] font-serif-heading">Allô Dabou VTC</h1>
          <p className="text-xs text-[#5B6B7A] flex items-center justify-center gap-1.5 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0D631B]" />
            <span>Chargement en cours...</span>
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state: The first page MUST be the Login Screen
  if (!user) {
    return <LoginScreen />;
  }

  const handleContinueToConfirmation = (
    pickup: string,
    destination: string,
    pricing: PricingCalculation,
    serviceDetails?: {
      serviceType: ServiceType;
      packageDetails?: string;
      recipientPhone?: string;
      conciergeTask?: string;
    }
  ) => {
    setSelectedBooking({
      pickup,
      destination,
      pricing,
      serviceType: serviceDetails?.serviceType,
      packageDetails: serviceDetails?.packageDetails,
      recipientPhone: serviceDetails?.recipientPhone,
      conciergeTask: serviceDetails?.conciergeTask,
    });
    setActiveTab('confirm');
  };

  const handleRideBookedSuccess = (ride: Ride) => {
    // Keep confirmation screen showing receipt
  };

  return (
    <div className="min-h-screen bg-[#F7F8FB] text-[#111C2D] flex flex-col font-sans relative pb-20">
      {/* Floating In-App Live Notification Toast */}
      <InAppNotificationToast onNavigateTab={(tab) => setActiveTab(tab)} />

      {/* PWA Install Banner */}
      <InstallPwaBanner />

      {/* Main App Header */}
      <Header
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
        }}
        activeTab={activeTab}
      />

      {/* Notification and Lock Screen Sound Alert Banner */}
      <NotificationPermissionBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 pt-4 sm:pt-6 pb-24">
        {activeTab === 'booking' && (
          <BookingScreen
            onContinueToConfirmation={handleContinueToConfirmation}
          />
        )}

        {activeTab === 'confirm' && selectedBooking && (
          <ConfirmationScreen
            pickup={selectedBooking.pickup}
            destination={selectedBooking.destination}
            pricing={selectedBooking.pricing}
            serviceType={selectedBooking.serviceType}
            packageDetails={selectedBooking.packageDetails}
            recipientPhone={selectedBooking.recipientPhone}
            conciergeTask={selectedBooking.conciergeTask}
            onBack={() => setActiveTab('booking')}
            onRideBookedSuccess={handleRideBookedSuccess}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onViewHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'history' && (
          <HistoryScreen
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onNewBookingClick={() => setActiveTab('booking')}
          />
        )}

        {activeTab === 'driver' && (
          <DriverDashboardScreen
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'account' && (
          <AccountScreen
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Mobile Touch Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab === 'confirm' ? 'booking' : activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
        }}
        pendingRidesCount={pendingCount}
        driverPendingCount={driverPendingCount}
        showDriverTab={isDriver || isAdmin}
      />

      {/* Auth Modal for Login/Signup */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
