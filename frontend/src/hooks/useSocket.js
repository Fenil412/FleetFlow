import { useEffect } from 'react';
import socket from '../sockets/socket';

export const useSocket = (event, callback) => {
    useEffect(() => {
        if (!event || !callback) return;

        socket.on(event, callback);
        console.log(`[Socket] Listening to: ${event}`);

        return () => {
            socket.off(event, callback);
            console.log(`[Socket] Stopped listening to: ${event}`);
        };
    }, [event, callback]);

    return {
        emit: (event, data) => socket.emit(event, data),
        socket
    };
};
