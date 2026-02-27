let io;

export const setIo = (socketIoInstance) => {
    io = socketIoInstance;
};

export const getIo = () => {
    return io;
};

export const emitFleetEvent = (event, data) => {
    if (io) {
        io.emit(event, data);
        console.log(`[Socket] Emitted event: ${event}`);
    } else {
        console.warn(`[Socket] Warning: Attempted to emit ${event} before io was initialized`);
    }
};

export const initFleetSockets = (socketIoInstance) => {
    setIo(socketIoInstance);

    socketIoInstance.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        socket.on('join:fleet', (fleetId) => {
            socket.join(`fleet:${fleetId}`);
            console.log(`[Socket] User joined fleet room: ${fleetId}`);
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });
};
