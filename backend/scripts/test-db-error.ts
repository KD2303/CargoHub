import { db } from '../src/config/database';
import { v4 as uuid } from 'uuid';

async function run() {
  try {
    const booking = {
      id: uuid(),
      bookingRef: `FA-TEST123`,
      userId: 'test_firebase_uid_does_not_exist',
      pickupLat: 19.0,
      pickupLng: 72.0,
      pickupAddress: "Test",
      dropLat: 19.1,
      dropLng: 72.1,
      dropAddress: "Test2",
      vehicleType: 'TATA_ACE',
      loadType: 'BOXES_CARTONS',
      helpersRequested: 0,
      fareEstimate: 500,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("Trying to insert...");
    await db.bookings.create(booking as any);
    console.log("Inserted successfully");
  } catch (err: any) {
    console.error("Caught error:", err.message);
    if (err.details) console.error("Details:", err.details);
    if (err.hint) console.error("Hint:", err.hint);
    if (err.code) console.error("Code:", err.code);
  }
}
run();
