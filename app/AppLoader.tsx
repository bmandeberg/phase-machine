'use client'

import dynamic from 'next/dynamic'

// The whole app is client-only: it relies on Web Audio (Tone.js), Web MIDI, and
// localStorage at module load. `ssr: false` keeps it out of the server bundle so
// none of those browser APIs are touched during SSR.
const App = dynamic(() => import('../src/App'), { ssr: false })

export default function AppLoader() {
  return (
    <div id="root">
      <App />
    </div>
  )
}
