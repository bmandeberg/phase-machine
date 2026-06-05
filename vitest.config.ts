import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // plugin-react transforms JSX/TSX with the automatic runtime regardless of the
  // project tsconfig's jsx:'preserve' (which Next.js requires but esbuild can't
  // consume), so modules containing JSX (e.g. globals.tsx) parse under Vitest.
  plugins: [react()],
  test: {
    // jsdom gives us window/localStorage/document, which globals.tsx (and the
    // modules under test that import it) touch at module-load time.
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    globals: true,
  },
})
