import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SOCKET_URL = __DEV__
  ? Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000'
  : 'https://api.cargohub.com';

let socket: Socket | null = null;

export const initSocket = async (): Promise<Socket> => {
  if (socket?.connected) return socket;

  const token = await AsyncStorage.getItem('@cargohub_driver_token');
  
  socket = io(SOCKET_URL, {
    auth: {
      token,
      mockUid: await AsyncStorage.getItem('@cargohub_mock_uid') || undefined
    },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
