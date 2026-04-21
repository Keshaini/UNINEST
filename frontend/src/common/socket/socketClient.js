import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/complaints';
const SOCKET_ENV_URL = import.meta.env.VITE_SOCKET_URL || '';

const resolveSocketBaseUrl = () => {
  if (SOCKET_ENV_URL) return SOCKET_ENV_URL;
  if (API_BASE_URL.startsWith('http')) {
    try {
      return new URL(API_BASE_URL).origin;
    } catch (error) {
      return 'http://localhost:5000';
    }
  }
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:5000';
};

const SOCKET_BASE_URL = resolveSocketBaseUrl();

let socketInstance;

export const getSocketClient = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_BASE_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socketInstance;
};
