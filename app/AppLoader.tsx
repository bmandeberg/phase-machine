'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { initPresetStorage } from '../src/presetBoot'

// The whole app is client-only: it relies on Web Audio (Tone.js), Web MIDI, and
// localStorage at module load. `ssr: false` keeps it out of the server bundle so
// none of those browser APIs are touched during SSR.
const App = dynamic(() => import('../src/App'), { ssr: false })

export default function AppLoader() {
  // App's module-load init reads presets synchronously from localStorage, so the
  // async preset bootstrap (factory-preset seeding, ?preset= share links — both
  // need decompression) must finish before the App chunk is even imported.
  // Rendering <App/> is what triggers the dynamic import, so gate on it.
  const [presetsReady, setPresetsReady] = useState(false)
  useEffect(() => {
    initPresetStorage().finally(() => setPresetsReady(true))
  }, [])

  return <div id="root">{presetsReady && <App />}</div>
}
