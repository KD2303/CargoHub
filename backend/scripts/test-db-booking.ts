import { db } from '../src/config/database';
import { bookingService } from '../src/services/booking.service';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const input = {
      pickupLat: 26.199406,
      pickupLng: 78.149246,
      pickupAddress: "Test Pickup",
      dropLat: 26.224334,
      dropLng: 78.173559,
      dropAddress: "Test Drop",
      vehicleType: 'TATA_ACE' as any,
      loadType: 'FURNITURE' as any,
      helpersRequested: 0,
      weight: undefined,
    };

    const ioMock = { to: () => ({ emit: () => {} }) };
    const { booking, fareBreakdown } = await bookingService.createBooking("fake_user_uid", input, ioMock);
    console.log("Created booking locally:", booking);
  } catch (err: any) {
    console.error("Caught error:", err.message);
    if (err.details) console.error("Details:", err.details);
    if (err.hint) console.error("Hint:", err.hint);
  }
}

test();
