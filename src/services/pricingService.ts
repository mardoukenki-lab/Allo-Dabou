import { PricingCalculation, ServiceType } from '../types';

export const BASE_DISTANCE_KM = 4.0;
export const BASE_PRICE_FCFA = 500;
export const BASE_CONCIERGE_PRICE_FCFA = 700;
export const EXTRA_KM_RATE_FCFA = 150;
export const MAX_SERVICE_DISTANCE_KM = 50.0;
export const MIN_SERVICE_DISTANCE_KM = 0.1;

/**
 * Calculates the exact official fare for Allô Dabou VTC.
 * 
 * Rules:
 * - VTC / Delivery: Base price 500 FCFA <= 4 km
 * - Concierge: Base price 700 FCFA <= 4 km
 * - Above 4 km: Base + 150 FCFA per additional km
 * - Round up to nearest multiple of 25 FCFA
 */
export function calculateRidePrice(
  distanceKm: number, 
  durationMin: number = 10,
  serviceType: ServiceType = 'vtc'
): PricingCalculation {
  const basePrice = serviceType === 'concierge' ? BASE_CONCIERGE_PRICE_FCFA : BASE_PRICE_FCFA;
  // Round distance to 1 decimal place
  const roundedDist = Math.round(distanceKm * 10) / 10;

  // Validation checks
  if (roundedDist < MIN_SERVICE_DISTANCE_KM) {
    return {
      distanceKm: roundedDist,
      durationMin,
      basePriceFcfa: basePrice,
      extraDistanceKm: 0,
      extraKmRateFcfa: EXTRA_KM_RATE_FCFA,
      extraKmPriceFcfa: 0,
      rawTotalPriceFcfa: 0,
      finalPriceFcfa: 0,
      formattedPrice: '0 FCFA',
      isWithinBaseZone: true,
      isValid: false,
      errorMessage: 'Le point de départ et la destination sont identiques ou trop proches.',
      serviceType,
    };
  }

  if (roundedDist > MAX_SERVICE_DISTANCE_KM) {
    return {
      distanceKm: roundedDist,
      durationMin,
      basePriceFcfa: basePrice,
      extraDistanceKm: roundedDist - BASE_DISTANCE_KM,
      extraKmRateFcfa: EXTRA_KM_RATE_FCFA,
      extraKmPriceFcfa: 0,
      rawTotalPriceFcfa: 0,
      finalPriceFcfa: 0,
      formattedPrice: 'Hors zone',
      isWithinBaseZone: false,
      isValid: false,
      errorMessage: `La distance (${roundedDist} km) dépasse notre zone de service couverte à Dabou (maximum 50 km).`,
      serviceType,
    };
  }

  const isWithinBaseZone = roundedDist <= BASE_DISTANCE_KM;
  const extraDistanceKm = isWithinBaseZone ? 0 : Math.round((roundedDist - BASE_DISTANCE_KM) * 10) / 10;
  const extraKmPriceFcfa = extraDistanceKm * EXTRA_KM_RATE_FCFA;
  
  const rawTotalPriceFcfa = basePrice + extraKmPriceFcfa;
  
  // Round up to nearest multiple of 25 FCFA
  const finalPriceFcfa = Math.ceil(rawTotalPriceFcfa / 25) * 25;

  return {
    distanceKm: roundedDist,
    durationMin: Math.max(2, Math.round(durationMin)),
    basePriceFcfa: basePrice,
    extraDistanceKm,
    extraKmRateFcfa: EXTRA_KM_RATE_FCFA,
    extraKmPriceFcfa,
    rawTotalPriceFcfa,
    finalPriceFcfa,
    formattedPrice: formatFcfa(finalPriceFcfa),
    isWithinBaseZone,
    isValid: true,
    warningMessage: roundedDist > 25 ? 'Course long trajet hors du centre-ville de Dabou.' : undefined,
    serviceType,
  };
}

/**
 * Format numbers as FCFA currency string (e.g. 1 400 FCFA)
 */
export function formatFcfa(amount: number): string {
  return `${amount.toLocaleString('fr-FR').replace(/\s/g, ' ')} FCFA`;
}
