import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Important for GitHub Pages relative paths
  define: {
    // Allows process.env.API_KEY to be populated by build environment if set
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    // Fallback for other process.env usage to prevent crashes
    'process.env': {} 
  }
});
