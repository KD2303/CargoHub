// ============================================================================
// CargoHub — Smart Fare Engine
// Authoritative calculation logic for the platform pricing
// ============================================================================

import type { FareEstimateInput, FareBreakdown, VehicleType } from '../types';

export const VEHICLE_PRICING: Record<VehicleType, { baseFare: number; perKm: number }> = {
  MINI_PICKUP: { baseFare: 80, perKm: 12 },
  TATA_ACE: { baseFare: 120, perKm: 15 },
  MINI_TRUCK: { baseFare: 180, perKm: 20 },
  LARGE_TRUCK: { baseFare: 300, perKm: 30 },
  TEMPO_407: { baseFare: 180, perKm: 20 }, // Fallback
  PICKUP_TRUCK: { baseFare: 80, perKm: 12 }, // Fallback
};

export const SURGE_MULTIPLIERS = {
  Normal: 1.0,
  "Light Rain": 1.1,
  "Heavy Rain": 1.2,
  Festival: 1.25,
  "High Demand": 1.3,
  "Extreme Demand": 1.5,
};

export type SurgeCondition = keyof typeof SURGE_MULTIPLIERS;

const SMART_FARE_CONSTANTS = {
  HELPER_CHARGE: 300,
  GST_RATE: 0.18,
};

export function getWeightCharge(weightKg: number): number {
  if (weightKg <= 100) return 0;
  if (weightKg <= 300) return 50;
  if (weightKg <= 750) return 100;
  if (weightKg <= 1500) return 200;
  return 400; // Above 1500 KG
}

export function recommendVehicle(weightKg: number): VehicleType {
  if (weightKg <= 300) return 'MINI_PICKUP';
  if (weightKg <= 750) return 'TATA_ACE';
  if (weightKg <= 1500) return 'MINI_TRUCK';
  return 'LARGE_TRUCK';
}

/**
 * Calculate Haversine distance between two coordinates in km.
 */
function calculateDistanceSmart(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Main Smart Fare Calculation
 */
export function calculateSmartFare(
  input: FareEstimateInput & { surgeCondition?: SurgeCondition }
): FareBreakdown {
  const vehicle = VEHICLE_PRICING[input.vehicleType];

  // Distance Calculation
  let distanceKm = input.distanceKm;
  if (distanceKm === undefined) {
    const straightLineKm = calculateDistanceSmart(
      input.pickupLat,
      input.pickupLng,
      input.dropLat,
      input.dropLng
    );
    distanceKm = Math.round(straightLineKm * 1.3 * 10) / 10; // Road distance estimate
  }

  const base = vehicle.baseFare;
  const distanceCharge = Math.round(distanceKm * vehicle.perKm);
  const weightCharge = getWeightCharge(input.weight || 0);
  const helperCharge = (input.helpersRequested || 0) * SMART_FARE_CONSTANTS.HELPER_CHARGE;
  const tollCharge = 0; // Hardcoded to 0 for now as requested

  const rawSubtotal = base + distanceCharge + weightCharge + helperCharge + tollCharge;
  
  const condition = input.surgeCondition || "Normal";
  const surgeMultiplier = SURGE_MULTIPLIERS[condition as SurgeCondition] || 1.0;
  
  const subtotal = Math.round(rawSubtotal * surgeMultiplier);
  const gst = Math.round(subtotal * SMART_FARE_CONSTANTS.GST_RATE);
  const total = subtotal + gst;

  return {
    base,
    distanceCharge,
    distanceKm,
    loadSurcharge: 0, // Deprecated, kept for backward compatibility if needed temporarily
    weightCharge,
    helperCharge,
    tollCharge,
    surgeMultiplier,
    subtotal,
    gst,
    total,
  };
}

export function formatCurrencySmart(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
