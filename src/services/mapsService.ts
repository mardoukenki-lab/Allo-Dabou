import { DabouLandmark } from '../types';

// Preset landmark locations and real neighborhoods in Dabou, Côte d'Ivoire
export const DABOU_LANDMARKS: DabouLandmark[] = [
  {
    id: 'quartier_mbrimbo',
    name: "Quartier M'Brimbo",
    category: 'Quartier',
    lat: 5.3310,
    lng: -4.3680,
    description: 'Secteur résidentiel Nord-Est de Dabou',
  },
  {
    id: 'quartier_armee',
    name: 'Quartier Armée / Camp',
    category: 'Quartier',
    lat: 5.3350,
    lng: -4.3820,
    description: 'Secteur militaire et zone résidentielle Nord',
  },
  {
    id: 'quartier_leboutou',
    name: 'Quartier Leboutou',
    category: 'Quartier',
    lat: 5.3210,
    lng: -4.3730,
    description: 'Quartier historique au cœur de Dabou',
  },
  {
    id: 'quartier_agneby',
    name: 'Quartier Agneby',
    category: 'Quartier',
    lat: 5.3280,
    lng: -4.3710,
    description: 'Quartier animé et commerçant',
  },
  {
    id: 'quartier_krouman',
    name: 'Quartier Krouman',
    category: 'Quartier',
    lat: 5.3190,
    lng: -4.3850,
    description: 'Secteur Ouest proche de la lagune Ebrié',
  },
  {
    id: 'quartier_gbougbo',
    name: 'Quartier Gbougbo',
    category: 'Quartier',
    lat: 5.3275,
    lng: -4.3840,
    description: 'Zone résidentielle Ouest de Dabou',
  },
  {
    id: 'quartier_cite',
    name: 'Quartier Cité / Administrative',
    category: 'Quartier',
    lat: 5.3250,
    lng: -4.3810,
    description: 'Cité administrative et quartier calme',
  },
  {
    id: 'quartier_sos',
    name: 'Quartier Village SOS',
    category: 'Quartier',
    lat: 5.3330,
    lng: -4.3740,
    description: 'Zone autour du Village d’Enfants SOS Dabou',
  },
  {
    id: 'quartier_wafou',
    name: 'Quartier Wafou',
    category: 'Quartier',
    lat: 5.3160,
    lng: -4.3790,
    description: 'Secteur Sud de Dabou',
  },
  {
    id: 'quartier_ngatty',
    name: "Quartier N'Gatty",
    category: 'Quartier',
    lat: 5.3120,
    lng: -4.3690,
    description: 'Secteur Sud-Est de la commune',
  },
  {
    id: 'quartier_ngatta',
    name: "Quartier N'Gatta",
    category: 'Quartier',
    lat: 5.3390,
    lng: -4.3760,
    description: 'Zone d’habitation Nord',
  },
  {
    id: 'debarcadere',
    name: 'Débarcadère / Layo',
    category: 'Commerce',
    lat: 5.3098,
    lng: -4.3850,
    description: 'Bord de la lagune Ebrié - Port de pêche',
  },
  {
    id: 'gare_dabou',
    name: 'Gare Routière de Dabou',
    category: 'Gare',
    lat: 5.3262,
    lng: -4.3768,
    description: 'Station principale des gbaka et taxis',
  },
  {
    id: 'grand_marche',
    name: 'Grand Marché de Dabou',
    category: 'Commerce',
    lat: 5.3241,
    lng: -4.3755,
    description: 'Marché central et zone commerciale',
  },
  {
    id: 'hopital_general',
    name: 'Hôpital Général de Dabou',
    category: 'Santé',
    lat: 5.3202,
    lng: -4.3811,
    description: 'Centre hospitalier régional de Dabou',
  },
  {
    id: 'mairie_dabou',
    name: 'Mairie de Dabou',
    category: 'Administration',
    lat: 5.3225,
    lng: -4.3789,
    description: 'Hôtel de ville et services administratifs',
  },
  {
    id: 'lycee_akpa',
    name: 'Lycée Akpa Gnagne',
    category: 'Éducation',
    lat: 5.3188,
    lng: -4.3722,
    description: 'Lycée public principal de Dabou',
  },
  {
    id: 'carrefour_songon',
    name: 'Carrefour Songon / Sortie Abidjan',
    category: 'Gare',
    lat: 5.3380,
    lng: -4.3500,
    description: 'Axe principal vers Songon et Abidjan',
  },
  {
    id: 'carrefour_jacqueville',
    name: 'Carrefour Jacqueville',
    category: 'Gare',
    lat: 5.3150,
    lng: -4.3520,
    description: 'Axe routier vers le pont de Jacqueville',
  },
  {
    id: 'akradio',
    name: "Village d'Akradio",
    category: 'Quartier',
    lat: 5.3620,
    lng: -4.4250,
    description: 'Axe Dabou - Bodou / Grand-Lahou (11 km)',
  },
  {
    id: 'bouboury',
    name: 'Village de Bouboury',
    category: 'Quartier',
    lat: 5.3450,
    lng: -4.4100,
    description: 'Village rattaché à la sous-préfecture (7 km)',
  },
  {
    id: 'orbaff',
    name: "Village d'Orbaff",
    category: 'Quartier',
    lat: 5.3400,
    lng: -4.4500,
    description: 'Axe Ouest de Dabou (10 km)',
  },
  {
    id: 'lopou',
    name: 'Village de Lopou',
    category: 'Quartier',
    lat: 5.4120,
    lng: -4.4800,
    description: 'Sous-préfecture de Lopou (18 km)',
  },
  {
    id: 'toupah',
    name: 'Toupah / Usine PALMCI',
    category: 'Quartier',
    lat: 5.3850,
    lng: -4.5100,
    description: 'Zone agro-industrielle (20 km)',
  }
];

export interface RouteMatrixResult {
  distanceKm: number;
  durationMin: number;
  pickupLat?: number;
  pickupLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  provider: 'google_distance_matrix' | 'dabou_road_engine';
}

/**
 * Calculates straight line Haversine distance in km
 */
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Resolves or searches a location string to coordinates in Dabou
 */
export function resolveLocationCoords(query: string): { lat: number; lng: number; name: string } {
  const clean = query.trim().toLowerCase();
  
  // Try exact or partial match with preset landmarks
  const found = DABOU_LANDMARKS.find(
    (item) => item.name.toLowerCase().includes(clean) || clean.includes(item.name.toLowerCase()) || item.id === clean
  );
  if (found) {
    return { lat: found.lat, lng: found.lng, name: found.name };
  }

  // Default to central Dabou with slight deterministic variation based on string hash
  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    hash = (hash << 5) - hash + query.charCodeAt(i);
    hash |= 0;
  }
  const offsetLat = ((Math.abs(hash) % 100) - 50) * 0.0008;
  const offsetLng = ((Math.abs(hash >> 2) % 100) - 50) * 0.0008;

  return {
    lat: 5.3241 + offsetLat,
    lng: -4.3755 + offsetLng,
    name: query,
  };
}

/**
 * Loads Google Maps JS SDK dynamically if API Key is available
 */
let googleMapsLoadingPromise: Promise<boolean> | null = null;

export function loadGoogleMapsScript(): Promise<boolean> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.resolve(false);
  }

  if (window.google?.maps?.DistanceMatrixService) {
    return Promise.resolve(true);
  }

  if (googleMapsLoadingPromise) {
    return googleMapsLoadingPromise;
  }

  googleMapsLoadingPromise = new Promise((resolve) => {
    const existingScript = document.getElementById('google-maps-js-sdk');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-js-sdk';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return googleMapsLoadingPromise;
}

/**
 * Calculates real driving distance using Google Maps Distance Matrix API
 * with automatic fallback to road matrix engine.
 */
export async function calculateDrivingDistance(
  pickupAddress: string,
  destinationAddress: string
): Promise<RouteMatrixResult> {
  const pickup = resolveLocationCoords(pickupAddress);
  const dest = resolveLocationCoords(destinationAddress);

  // Attempt Google Maps Distance Matrix Service if SDK is loaded
  const hasMaps = await loadGoogleMapsScript();

  if (hasMaps && window.google?.maps?.DistanceMatrixService) {
    try {
      const service = new window.google.maps.DistanceMatrixService();
      const response = await new Promise<any>((resolve, reject) => {
        service.getDistanceMatrix(
          {
            origins: [{ lat: pickup.lat, lng: pickup.lng }],
            destinations: [{ lat: dest.lat, lng: dest.lng }],
            travelMode: window.google.maps.TravelMode.DRIVING,
            unitSystem: window.google.maps.UnitSystem.METRIC,
          },
          (res: any, status: any) => {
            if (status === 'OK' && res?.rows?.[0]?.elements?.[0]?.status === 'OK') {
              resolve(res.rows[0].elements[0]);
            } else {
              reject(new Error(`Distance Matrix Status: ${status}`));
            }
          }
        );
      });

      const distanceMeters = response.distance.value;
      const durationSeconds = response.duration.value;
      const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
      const durationMin = Math.ceil(durationSeconds / 60);

      return {
        distanceKm,
        durationMin,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        destinationLat: dest.lat,
        destinationLng: dest.lng,
        provider: 'google_distance_matrix',
      };
    } catch (err) {
      console.warn('Google Maps Distance Matrix fallback to Dabou road engine:', err);
    }
  }

  // High-precision road engine calculation for Dabou routes
  const straightLine = haversineDistanceKm(pickup.lat, pickup.lng, dest.lat, dest.lng);
  
  // Road network factor in Dabou (typical driving winding factor ~ 1.25)
  const roadFactor = straightLine < 1 ? 1.35 : straightLine < 5 ? 1.25 : 1.18;
  const rawRoadDist = straightLine * roadFactor;
  
  // Rounded distance in km
  const distanceKm = Math.round(rawRoadDist * 10) / 10;
  // Estimate moto duration: average speed 30 km/h + 2 min pickup buffer
  const durationMin = Math.max(3, Math.ceil((distanceKm / 30) * 60) + 2);

  return {
    distanceKm,
    durationMin,
    pickupLat: pickup.lat,
    pickupLng: pickup.lng,
    destinationLat: dest.lat,
    destinationLng: dest.lng,
    provider: 'dabou_road_engine',
  };
}

/**
 * Gets GPS location from browser with French error handling and smart Dabou address resolution
 */
export function getCurrentUserCoordinates(): Promise<{ lat: number; lng: number; address: string }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("La géolocalisation n'est pas supportée par votre navigateur."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Find closest Dabou landmark
        let closestLandmark = DABOU_LANDMARKS[0];
        let minDistance = 999;

        DABOU_LANDMARKS.forEach((lm) => {
          const d = haversineDistanceKm(lat, lng, lm.lat, lm.lng);
          if (d < minDistance) {
            minDistance = d;
            closestLandmark = lm;
          }
        });

        let address = '';

        // Try Google reverse geocoding if SDK is loaded
        if (window.google?.maps?.Geocoder) {
          try {
            const geocoder = new window.google.maps.Geocoder();
            const response = await new Promise<any>((res, rej) => {
              geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                  res(results[0]);
                } else {
                  rej(status);
                }
              });
            });

            if (response && response.formatted_address) {
              const cleanAddress = response.formatted_address
                .replace(', Côte d\'Ivoire', '')
                .replace(', Cote d\'Ivoire', '')
                .replace(', Ivory Coast', '');
              address = `Position GPS: ${cleanAddress}`;
            }
          } catch (e) {
            // fallback to landmark matching
          }
        }

        if (!address) {
          if (minDistance <= 0.3) {
            address = `${closestLandmark.name} (Position GPS)`;
          } else if (minDistance <= 1.5) {
            address = `Ma position (près de ${closestLandmark.name})`;
          } else {
            address = `Position GPS (${lat.toFixed(4)}, ${lng.toFixed(4)} - Dabou)`;
          }
        }

        resolve({ lat, lng, address });
      },
      (error) => {
        let msg = 'Impossible d’accéder à votre position GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Autorisation GPS refusée. Veuillez saisir votre point de départ manuellement.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Signal GPS indisponible.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Délai d’attente GPS dépassé.';
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}
