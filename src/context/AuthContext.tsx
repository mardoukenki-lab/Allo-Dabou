import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';
import { generateLicensePlate } from '../lib/plateGenerator';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isDriver: boolean;
  isApprovedDriver: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, phone: string, requestedRole?: 'client' | 'driver', vehicleNumber?: string) => Promise<void>;
  requestDriverRole: (vehicleNumber?: string) => Promise<void>;
  approveDriverByAdmin: (driverUid: string, approve: boolean) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (displayName: string, phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch profile document from Firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setUserProfile({
              uid: currentUser.uid,
              ...snap.data(),
            } as UserProfile);
          } else {
            // Create default profile if missing
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Client Dabou',
              phone: '',
            };
            await setDoc(userRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
            });
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
  };

  const register = async (
    email: string, 
    pass: string, 
    name: string, 
    phone: string, 
    requestedRole: 'client' | 'driver' = 'client',
    vehicleNumber?: string
  ) => {
    const cleanEmail = email.trim();
    const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: name.trim() });
      
      const isSystemAdmin = cleanEmail.toLowerCase() === 'mardoukenki@gmail.com';
      const role = isSystemAdmin 
        ? 'admin' 
        : requestedRole === 'driver' 
        ? 'driver' 
        : 'client';

      const isApprovedDriver = isSystemAdmin || (requestedRole === 'driver' ? false : undefined);
      const approved = isSystemAdmin || (requestedRole === 'driver' ? false : undefined);

      let finalVehicleNumber = vehicleNumber?.trim() || '';
      if ((role === 'driver' || requestedRole === 'driver') && !finalVehicleNumber) {
        finalVehicleNumber = generateLicensePlate();
      }

      const newProfile: UserProfile = {
        uid: res.user.uid,
        email: cleanEmail,
        displayName: name.trim(),
        phone: phone.trim(),
        role,
        isApprovedDriver,
        approved,
        vehicleNumber: finalVehicleNumber,
      };

      await setDoc(doc(db, 'users', res.user.uid), {
        ...newProfile,
        createdAt: serverTimestamp(),
      });
      setUserProfile(newProfile);
    }
  };

  const requestDriverRole = async (vehicleNumber?: string) => {
    if (!user) return;
    const finalPlate = vehicleNumber?.trim() || generateLicensePlate();
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      role: 'driver',
      isApprovedDriver: false,
      approved: false,
      vehicleNumber: finalPlate,
      requestedDriverAt: serverTimestamp(),
    });
    setUserProfile((prev) => (prev ? {
      ...prev,
      role: 'driver',
      isApprovedDriver: false,
      approved: false,
      vehicleNumber: finalPlate,
    } : null));
  };

  const approveDriverByAdmin = async (driverUid: string, approve: boolean) => {
    const targetRef = doc(db, 'users', driverUid);
    if (approve) {
      await updateDoc(targetRef, {
        role: 'driver',
        isApprovedDriver: true,
        approved: true,
      });
    } else {
      await updateDoc(targetRef, {
        role: 'client',
        isApprovedDriver: false,
        approved: false,
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const updateProfileData = async (displayName: string, phone: string) => {
    if (!user) return;
    await updateProfile(user, { displayName: displayName.trim() });
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      displayName: displayName.trim(),
      phone: phone.trim(),
    });
    setUserProfile((prev) => (prev ? { ...prev, displayName: displayName.trim(), phone: phone.trim() } : null));
  };

  const isAdmin = user?.email?.toLowerCase() === 'mardoukenki@gmail.com';
  
  // A driver is someone registered as driver or admin, BUT non-admins must be approved by admin
  const isDriver = isAdmin || userProfile?.role === 'driver' || userProfile?.role === 'driver_pending' || userProfile?.role === 'admin';
  const isApprovedDriver = isAdmin || ((userProfile?.role === 'driver' || userProfile?.role === 'driver_pending') && (userProfile?.isApprovedDriver === true || userProfile?.approved === true));

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin,
        isDriver,
        isApprovedDriver,
        login,
        register,
        requestDriverRole,
        approveDriverByAdmin,
        logout,
        resetPassword,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
