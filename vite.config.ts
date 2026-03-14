import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'import.meta.env.VITE_INNGEST_EVENT_KEY': JSON.stringify(env.VITE_INNGEST_EVENT_KEY),
      'process.env.STREAM_API_KEY': JSON.stringify(env.STREAM_API_KEY),
      'process.env.STREAM_SECRET_KEY': JSON.stringify(env.STREAM_SECRET_KEY),
      'import.meta.env.VITE_NEXT_PUBLIC_STREAM_API_KEY': JSON.stringify(env.NEXT_PUBLIC_STREAM_API_KEY),
    },
    resolve: {
      alias: {
        '@': '.',
      },
    },
   
  };
});
