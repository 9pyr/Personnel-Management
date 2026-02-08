import react from '@vitejs/plugin-react'

import { defineConfig } from 'vite'
import viteTsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteTsconfigPaths(), react()],
  server: {
    port: 3000,
    strictPort: true, // ถ้า 3000 ถูกใช้จะ error แทนข้ามไป 3001 — ใช้พอร์ตเดียวเพื่อให้ CORS ตรงกับ backend
  },
})
