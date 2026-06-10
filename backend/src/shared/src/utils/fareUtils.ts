// ============================================================================
// CargoHub — Fare Calculation Engine
// Runs client-side for instant estimates, server-side for authoritative pricing
// ============================================================================

import type { FareBreakdown, FareEstimateInput } from '../types';
import { VEHICLE_CONFIG, LOAD_CONFIG, FARE_CONSTANTS } from '../constants';

/**
 * Calculate Haversine distance between two coordinates in km.
 */
export function calculateDistance(
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
 * Calculate full fare breakdown for a booking.
 * 
 * Formula:
 *   base = vehicle base fare
 *   distanceCharge = distance_km * vehicle per_km_rate
 *   loadSurcharge = (base + distanceCharge) * load_surcharge_percent / 100
 *   helperCharge = helpers * HELPER_CHARGE_PER_PERSON
 *   weightSurcharge = max(0, weight - 50) * 1 (1 rupee per additional kg)
 *   subtotal = (base + distanceCharge + loadSurcharge + helperCharge + weightSurcharge) * surgeMultiplier
 *   gst = subtotal * GST_RATE
 *   total = subtotal + gst
 */
export function calculateFare(
  input: FareEstimateInput,
  surgeMultiplier: number = 1.0
): FareBreakdown {
  const vehicle = VEHICLE_CONFIG[input.vehicleType];
  const load = LOAD_CONFIG[input.loadType];

  // Distance in km (Use provided override or calculate Haversine)
  let distanceKm = input.distanceKm;
  if (distanceKm === undefined) {
    const straightLineKm = calculateDistance(
      input.pickupLat,
      input.pickupLng,
      input.dropLat,
      input.dropLng
    );
    distanceKm = Math.round(straightLineKm * 1.3 * 10) / 10; // Road distance estimate
  }

  // Components
  const base = vehicle.baseFare;
  const distanceCharge = Math.round(distanceKm * vehicle.perKmRate);
  const loadSurcharge = Math.round((base + distanceCharge) * (load.surchargePercent / 100));
  const helperCharge = input.helpersRequested * FARE_CONSTANTS.HELPER_CHARGE_PER_PERSON;

  // Weight Surcharge (1 rupee per kg above 50kg)
  let weightSurcharge = 0;
  if (input.weight && input.weight > 50) {
    weightSurcharge = Math.round((input.weight - 50) * 1);
  }

  // Apply surge
  const rawSubtotal = base + distanceCharge + loadSurcharge + helperCharge + weightSurcharge;
  const subtotal = Math.round(rawSubtotal * surgeMultiplier);

  // GST
  const gst = Math.round(subtotal * FARE_CONSTANTS.GST_RATE);

  // Total (minimum fare check)
  const total = Math.max(subtotal + gst, FARE_CONSTANTS.MIN_FARE);

  return {
    base,
    distanceCharge,
    distanceKm,
    loadSurcharge,
    helperCharge,
    weightSurcharge,
    surgeMultiplier,
    subtotal,
    gst,
    total,
  };
}

/**
 * Format a fare amount in INR.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
