import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

export default defineConfig(async ({ mode }) => {
  // Carrega .env / .env.local desta pasta (artifacts/viewcoin-app).
  // Fora do Replit não há PORT/BASE_PATH pré-definidos no ambiente, então
  // usamos valores padrão sensatos para rodar localmente sem configuração.
  const env = loadEnv(mode, import.meta.dirname, '');

  const rawPort = env.PORT ?? process.env.PORT ?? '5173';
  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  const basePath = env.BASE_PATH ?? process.env.BASE_PATH ?? '/';

  // Porta onde o @workspace/api-server está rodando (ver artifacts/api-server/.env)
  const rawApiPort = env.API_PORT ?? process.env.API_PORT ?? '8080';
  const apiPort = Number(rawApiPort);

  if (Number.isNaN(apiPort) || apiPort <= 0) {
    throw new Error(`Invalid API_PORT value: "${rawApiPort}"`);
  }

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      runtimeErrorOverlay(),
      ...(process.env.NODE_ENV !== 'production' &&
      process.env.REPL_ID !== undefined
        ? [
            await import('@replit/vite-plugin-cartographer').then((m) =>
              m.cartographer({
                root: path.resolve(import.meta.dirname, '..'),
              }),
            ),
            await import('@replit/vite-plugin-dev-banner').then((m) =>
              m.devBanner(),
            ),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
        '@assets': path.resolve(
          import.meta.dirname,
          '..',
          '..',
          'attached_assets',
        ),
      },
      dedupe: ['react', 'react-dom'],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, 'dist/public'),
      emptyOutDir: true,
    },
    server: {
      port,
      strictPort: true,
      host: '0.0.0.0',
      allowedHosts: true,
      fs: {
        strict: true,
      },
      // Fora do Replit, o frontend (Vite) e o @workspace/api-server rodam
      // como processos separados em portas diferentes. Sem este proxy, as
      // chamadas para /api/* feitas pelo frontend cairiam no próprio Vite
      // (404) em vez de chegar ao backend.
      proxy: {
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port,
      host: '0.0.0.0',
      allowedHosts: true,
      proxy: {
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
  };
});
