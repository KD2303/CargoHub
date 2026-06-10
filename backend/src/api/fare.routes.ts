// ============================================================================
// Fare Routes — POST /fare/estimate
// ============================================================================

import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { FareEstimateSchema, calculateFare } from '@cargohub/shared';
import axios from 'axios';

const router = Router();

// Fare estimate — publicly accessible (no auth for landing page widget)
router.post('/estimate', validate(FareEstimateSchema), async (req, res) => {
  try {
    let distanceKm = 10; // Default fallback
    let durationMins = 30; // Default fallback

    // 1. Try to get real distance from OLA Maps
    if (process.env.OLA_MAPS_API_KEY) {
      try {
        const origin = `${req.body.pickupLat},${req.body.pickupLng}`;
        const destination = `${req.body.dropLat},${req.body.dropLng}`;
        const olaRes = await axios.get('https://api.olamaps.io/routing/v1/distanceMatrix', {
          params: {
            origins: origin,
            destinations: destination,
            api_key: process.env.OLA_MAPS_API_KEY
          }
        });
        
        if (olaRes.data?.rows?.[0]?.elements?.[0]?.status === 'OK') {
          const element = olaRes.data.rows[0].elements[0];
          // Ola Maps returns distance and duration directly as numbers
          distanceKm = (element.distance.value !== undefined ? element.distance.value : element.distance) / 1000;
          durationMins = (element.duration.value !== undefined ? element.duration.value : element.duration) / 60;
        }
      } catch (err) {
        console.error('OLA Maps API error:', err instanceof Error ? err.message : err);
      }
    }

    // 2. Try to get weather surcharge from OpenWeatherMap
    let isMonsoonSurcharge = false;
    if (process.env.OPENWEATHER_API_KEY) {
      try {
        const weatherRes = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: {
            lat: req.body.pickupLat,
            lon: req.body.pickupLng,
            appid: process.env.OPENWEATHER_API_KEY
          }
        });
        // Check if weather condition is Rain (code 5xx) or Thunderstorm (code 2xx)
        const weatherId = weatherRes.data?.weather?.[0]?.id;
        if (weatherId && (weatherId < 600)) {
          isMonsoonSurcharge = true;
        }
      } catch (err) {
        console.error('OpenWeatherMap API error:', err instanceof Error ? err.message : err);
      }
    }

    // Use shared calculateFare logic but override distance and apply surcharge
    const baseFare = calculateFare({
      pickupLat: req.body.pickupLat,
      pickupLng: req.body.pickupLng,
      dropLat: req.body.dropLat,
      dropLng: req.body.dropLng,
      vehicleType: req.body.vehicleType,
      loadType: req.body.loadType,
      helpersRequested: req.body.helpersRequested,
      weight: req.body.weight,
      distanceKm: distanceKm,
    });
    
    let total = baseFare.total;
    if (isMonsoonSurcharge) {
      total = Math.round(total * 1.15); // 15% surcharge
    }

    res.json({ 
      success: true, 
      data: {
        ...baseFare,
        durationMin: Math.round(durationMins),
        total: total,
        monsoonSurchargeApplied: isMonsoonSurcharge
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'FARE_CALCULATION_ERROR', message: 'Could not calculate fare estimate.' });
  }
});

export default router;
