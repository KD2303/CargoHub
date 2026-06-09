import { db } from '../config/database';

export const driverService = {
  async getDriverByFirebaseUid(uid: string) {
    return await db.drivers.findByFirebaseUid(uid);
  },

  async updateLocation(uid: string, lat: number, lng: number) {
    // In a real app we would update the Redis geospatial index here too
    return await db.drivers.update(uid, { currentLat: lat, currentLng: lng });
  }
};
