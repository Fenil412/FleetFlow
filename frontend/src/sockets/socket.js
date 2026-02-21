import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || '';
const socket = io(socketUrl, {
    autoConnect: false,
});

export const connectSocket = (token) => {
    socket.auth = { token };
    socket.connect();
};

export const disconnectSocket = () => {
    socket.disconnect();
};

export default socket;
