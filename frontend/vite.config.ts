import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3000';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('/d3-')) {
                return 'vendor-d3';
              }
              if (id.includes('xlsx')) {
                return 'vendor-xlsx';
              }
              if (id.includes('recharts')) {
                return 'vendor-recharts';
              }
              return undefined;
            }

            return undefined;
          },
        },
      },
    },
    server: {
      host: true,
      port: 3001,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
  };
});
