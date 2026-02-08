import path from 'path'
import react from '@vitejs/plugin-react'

import { defineConfig } from 'vite'
import viteTsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteTsconfigPaths(), react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  optimizeDeps: {
    include: ['react-datepicker', 'date-fns'],
  },
  server: {
    port: 3000,
    strictPort: false, // ถ้า 3000 ถูกใช้จะใช้พอร์ตถัดไป (เช่น 3001)
  },
})
