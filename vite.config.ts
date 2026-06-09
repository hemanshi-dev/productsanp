import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production' || command === 'build'
  
  return {
    plugins: [react()],
    base: '/react_project/productsnap',
    optimizeDeps: {
      include: ['lenis'],
    },
    // Proxy only in development mode
    ...(!isProduction && {
      server: {
        proxy: {
          '/api': {
            target: 'https://productsnap.shuchiai.com',
            changeOrigin: true,
            secure: true,
            rewrite: (path) => path.replace(/^\/api/, '/api'),
          },
        },
      },
    }),
  }
})

