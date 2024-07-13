import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

export default defineConfig({
  plugins: [
    reactRefresh(),
    replace({
      'process.env': JSON.stringify({
        ...dotenv.config().parsed,
      }),
    }),
  ],
});
