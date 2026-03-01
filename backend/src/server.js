import './config/env.js';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Socket initialization
import { initFleetSockets } from './sockets/fleet.socket.js';
initFleetSockets(io);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 FleetFlow System is LIVE!`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`💻 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`==================================================\n`);
});
