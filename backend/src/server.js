import './config/env.js';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            const allowedOrigins = [
                "http://localhost:5173",
                "http://localhost:3000",
                "https://fleet-flow-amber.vercel.app"
            ];

            if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== "*") {
                const envOrigin = process.env.CORS_ORIGIN.trim();
                const formattedOrigin = envOrigin.startsWith("http") ? envOrigin : `https://${envOrigin}`;
                allowedOrigins.push(formattedOrigin);
            }

            if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST"],
        credentials: true
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
