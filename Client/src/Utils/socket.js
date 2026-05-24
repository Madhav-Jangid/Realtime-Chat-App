import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_BACKEND_URL, {
  autoConnect: false,
  transports: ['websocket']
});

export function connectSocket(token) {
  if (!token) return;
  socket.auth = { token };
  if (!socket.connected) socket.connect();
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect();
}

export { socket };
