import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    // Provide fallbacks if missing, getting the origin to proxy correctly
    const apiTarget = env.VITE_API_URL || env.VITE_API_BASE_URL ? new URL(env.VITE_API_URL || env.VITE_API_BASE_URL).origin : 'http://localhost:5001';
    const socketTarget = env.VITE_SOCKET_URL ? new URL(env.VITE_SOCKET_URL).origin : 'http://localhost:5001';

    return {
        plugins: [react()],
        server: {
            port: parseInt(env.PORT || 3000),
            proxy: {
                '/api': apiTarget,
                '/socket.io': {
                    target: socketTarget,
                    ws: true
                }
            }
        }
    };
});
