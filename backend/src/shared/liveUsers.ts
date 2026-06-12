export interface LiveSession {
  uid: string;
  role: string;
  email?: string;
  name?: string;
  startTime: number;
  lastPulse: number;
}

export const liveUsers = {
  USER: new Map<string, LiveSession>(),
  DRIVER: new Map<string, LiveSession>(),
  ADMIN: new Map<string, LiveSession>()
};
