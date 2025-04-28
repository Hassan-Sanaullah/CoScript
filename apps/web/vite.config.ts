import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0', // Binds the server to all network interfaces
        port: 4000, // You can change the port if needed
        strictPort: true, // Ensures Vite will not change the port if 3000 is in use
    },
});
