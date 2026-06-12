import { calculateSmartFare } from '../src/shared/src/utils/cargoFareEngine';

const input = {
  pickupLat: 26.199406,
  pickupLng: 78.149246,
  dropLat: 26.224334,
  dropLng: 78.173559,
  vehicleType: 'TATA_ACE' as any,
  loadType: 'FURNITURE' as any,
  helpersRequested: 0,
  weight: undefined,
  distanceKm: 10,
};

const baseFare = calculateSmartFare(input);
console.log("baseFare total is:", baseFare.total, baseFare);
