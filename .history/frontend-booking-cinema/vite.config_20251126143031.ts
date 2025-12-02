import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 80, // đổi cổng nếu muốn
    allowedHosts: ['bookingticker.net'], // thêm host bạn muốn
  },
  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'gsap'
    ],
    force: true, // ⚡ ép Vite rebuild deps mỗi lần
  },
})
