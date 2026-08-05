import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Ride, RideStatus, ServiceType, UserProfile } from '../types';

const RIDES_COLLECTION = 'rides';
const USERS_COLLECTION = 'users';

/**
 * Subscribes to all user profiles in real-time (For Admin driver approval)
 */
export function subscribeAllUsers(
  onUsersUpdated: (users: UserProfile[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = collection(db, USERS_COLLECTION);

  return onSnapshot(
    q,
    (snapshot) => {
      const users: UserProfile[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          uid: d.id,
          email: data.email || '',
          displayName: data.displayName || '',
          phone: data.phone || '',
          role: data.role || 'client',
          isApprovedDriver: data.isApprovedDriver,
          approved: data.approved,
          vehicleNumber: data.vehicleNumber || '',
          requestedDriverAt: data.requestedDriverAt?.toDate ? data.requestedDriverAt.toDate() : undefined,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        };
      });

      onUsersUpdated(users);
    },
    (err) => {
      console.error('Error fetching all users for admin:', err);
      if (onError) onError(err);
    }
  );
}

export interface CreateRideInput {
  userId: string;
  userEmail: string;
  userName?: string;
  userPhone?: string;
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  destinationAddress: string;
  destinationLat?: number;
  destinationLng?: number;
  distanceKm: number;
  durationMin: number;
  priceFcfa: number;
  notes?: string;
  serviceType?: ServiceType;
  packageDetails?: string;
  recipientPhone?: string;
  conciergeTask?: string;
}

/**
 * Creates a new ride booking in Firestore
 */
export async function createRide(input: CreateRideInput): Promise<Ride> {
  const rideData = {
    userId: input.userId,
    userEmail: input.userEmail,
    userName: input.userName || '',
    userPhone: input.userPhone || '',
    pickupAddress: input.pickupAddress,
    pickupLat: input.pickupLat || 0,
    pickupLng: input.pickupLng || 0,
    destinationAddress: input.destinationAddress,
    destinationLat: input.destinationLat || 0,
    destinationLng: input.destinationLng || 0,
    distanceKm: input.distanceKm,
    durationMin: input.durationMin,
    priceFcfa: input.priceFcfa,
    notes: input.notes || '',
    serviceType: input.serviceType || 'vtc',
    packageDetails: input.packageDetails || '',
    recipientPhone: input.recipientPhone || '',
    conciergeTask: input.conciergeTask || '',
    status: 'pending' as RideStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, RIDES_COLLECTION), rideData);

  return {
    id: docRef.id,
    ...rideData,
    createdAt: new Date(),
  };
}

/**
 * Subscribes to real-time rides for a specific user
 */
export function subscribeUserRides(
  userId: string,
  onRidesUpdated: (rides: Ride[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(
    collection(db, RIDES_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const rides: Ride[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId,
          userEmail: data.userEmail,
          userName: data.userName,
          userPhone: data.userPhone,
          pickupAddress: data.pickupAddress,
          pickupLat: data.pickupLat,
          pickupLng: data.pickupLng,
          destinationAddress: data.destinationAddress,
          destinationLat: data.destinationLat,
          destinationLng: data.destinationLng,
          distanceKm: data.distanceKm,
          durationMin: data.durationMin,
          priceFcfa: data.priceFcfa,
          status: data.status || 'pending',
          notes: data.notes,
          serviceType: data.serviceType || 'vtc',
          packageDetails: data.packageDetails,
          recipientPhone: data.recipientPhone,
          conciergeTask: data.conciergeTask,
          driverId: data.driverId,
          driverName: data.driverName,
          driverPhone: data.driverPhone,
          driverVehiclePlate: data.driverVehiclePlate || '',
          rating: data.rating,
          ratingComment: data.ratingComment,
          ratedAt: data.ratedAt?.toDate ? data.ratedAt.toDate() : undefined,
          acceptedAt: data.acceptedAt?.toDate ? data.acceptedAt.toDate() : undefined,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        };
      });

      // Sort client-side by createdAt descending
      rides.sort((a, b) => {
        const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return timeB - timeA;
      });

      onRidesUpdated(rides);
    },
    (err) => {
      console.error('Error fetching user rides:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribes to ALL rides in real-time (for Drivers / Admin Dashboard)
 */
export function subscribeAllRides(
  onRidesUpdated: (rides: Ride[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = collection(db, RIDES_COLLECTION);

  return onSnapshot(
    q,
    (snapshot) => {
      const rides: Ride[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId,
          userEmail: data.userEmail,
          userName: data.userName,
          userPhone: data.userPhone,
          pickupAddress: data.pickupAddress,
          pickupLat: data.pickupLat,
          pickupLng: data.pickupLng,
          destinationAddress: data.destinationAddress,
          destinationLat: data.destinationLat,
          destinationLng: data.destinationLng,
          distanceKm: data.distanceKm,
          durationMin: data.durationMin,
          priceFcfa: data.priceFcfa,
          status: data.status || 'pending',
          notes: data.notes,
          serviceType: data.serviceType || 'vtc',
          packageDetails: data.packageDetails,
          recipientPhone: data.recipientPhone,
          conciergeTask: data.conciergeTask,
          driverId: data.driverId,
          driverName: data.driverName,
          driverPhone: data.driverPhone,
          driverVehiclePlate: data.driverVehiclePlate || '',
          rating: data.rating,
          ratingComment: data.ratingComment,
          ratedAt: data.ratedAt?.toDate ? data.ratedAt.toDate() : undefined,
          acceptedAt: data.acceptedAt?.toDate ? data.acceptedAt.toDate() : undefined,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        };
      });

      // Sort client-side by createdAt descending
      rides.sort((a, b) => {
        const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return timeB - timeA;
      });

      onRidesUpdated(rides);
    },
    (err) => {
      console.error('Error fetching all rides for driver:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Accepts a ride as Driver
 */
export async function acceptRideByDriver(
  rideId: string,
  driverInfo: { driverId: string; driverName: string; driverPhone: string; driverVehiclePlate?: string }
): Promise<void> {
  const rideRef = doc(db, RIDES_COLLECTION, rideId);
  await updateDoc(rideRef, {
    status: 'confirmed',
    driverId: driverInfo.driverId,
    driverName: driverInfo.driverName,
    driverPhone: driverInfo.driverPhone,
    driverVehiclePlate: driverInfo.driverVehiclePlate || '',
    acceptedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Updates ride status by Driver (e.g. completed, cancelled)
 */
export async function updateRideStatusByDriver(
  rideId: string,
  status: RideStatus
): Promise<void> {
  const rideRef = doc(db, RIDES_COLLECTION, rideId);
  await updateDoc(rideRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Cancels a ride if it is still pending
 */
export async function cancelRide(rideId: string, userId: string): Promise<void> {
  const rideRef = doc(db, RIDES_COLLECTION, rideId);
  const snap = await getDoc(rideRef);
  
  if (!snap.exists()) {
    throw new Error('Course non trouvée.');
  }

  const rideData = snap.data();
  if (rideData.userId !== userId) {
    throw new Error('Vous n’avez pas la permission de modifier cette course.');
  }

  if (rideData.status !== 'pending') {
    throw new Error('Seules les courses en attente peuvent être annulées.');
  }

  await updateDoc(rideRef, {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Submits a 1-5 star rating for a completed ride and updates the driver's rating average in Firestore
 */
export async function submitRideRating(
  rideId: string,
  rating: number,
  ratingComment?: string
): Promise<void> {
  if (rating < 1 || rating > 5) {
    throw new Error('La note doit être comprise entre 1 et 5 étoiles.');
  }

  const rideRef = doc(db, RIDES_COLLECTION, rideId);
  const snap = await getDoc(rideRef);

  if (!snap.exists()) {
    throw new Error('Course non trouvée.');
  }

  const rideData = snap.data();
  if (rideData.rating) {
    throw new Error('Cette course a déjà été évaluée.');
  }

  // 1. Save rating on the ride document
  await updateDoc(rideRef, {
    rating,
    ratingComment: ratingComment?.trim() || '',
    ratedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 2. If driver is assigned, calculate and update driver's rating average in Firestore 'users' collection
  if (rideData.driverId) {
    const driverRef = doc(db, 'users', rideData.driverId);
    const driverSnap = await getDoc(driverRef);

    if (driverSnap.exists()) {
      const driverData = driverSnap.data();
      const currentCount = Number(driverData.ratingCount || 0);
      const currentSum = Number(driverData.totalRatingSum || 0);

      const newCount = currentCount + 1;
      const newSum = currentSum + rating;
      const newAverage = Math.round((newSum / newCount) * 10) / 10;

      await updateDoc(driverRef, {
        ratingAverage: newAverage,
        ratingCount: newCount,
        totalRatingSum: newSum,
        updatedAt: serverTimestamp(),
      });
    }
  }
}
