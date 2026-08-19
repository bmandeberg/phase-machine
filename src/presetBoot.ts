// Pre-mount preset bootstrap. AppLoader awaits initPresetStorage() before it
// mounts <App/>, because two things must happen ahead of App's synchronous
// module-load init (which reads localStorage in useState initializers) and both
// need async decompression (presetCode.ts):
//
//  1. Seeding the factory presets into localStorage on a first visit.
//  2. Loading a ?preset= share link — decoded, migrated, and validated here,
//     then written to the same localStorage keys ('activePatch' / 'activePreset')
//     the app already boots from: as a clean selection when the receiver's
//     library already holds an identical preset, otherwise as an unsaved patch.
//     The param is stripped from the URL so a later refresh doesn't clobber edits.
//
// This module's static imports must stay SSR-safe (AppLoader server-renders):
// presetCode and dialog are pure; everything browser-bound is loaded dynamically
// inside the boot call below.

import { decodePreset, decodePresetText } from './presetCode'
import { alertDialog } from './dialog'
import type { Preset } from './types'

const SHARE_PARAM = 'preset'

// The canonical share-link shape — built here so the writer (the preset bar's
// share button) and the reader below can't drift apart.
export function presetShareUrl(encoded: string): string {
  return `${window.location.origin}${window.location.pathname}?${SHARE_PARAM}=${encoded}`
}

export async function initPresetStorage() {
  // load a shared preset from the URL
  const params = new URLSearchParams(window.location.search)
  const encoded = params.get(SHARE_PARAM)
  let sharedLoaded = false
  if (encoded !== null) {
    sharedLoaded = await loadSharedPreset(encoded)
    if (!sharedLoaded) {
      alertDialog('This preset link is invalid — loading your last session instead.')
    }
    params.delete(SHARE_PARAM)
    const query = params.toString()
    window.history.replaceState(null, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash)
  }

  // seed the factory presets on first visit
  if (!window.localStorage.getItem('presets')) {
    try {
      // dynamic import so the ~29KB blob is only ever fetched on this branch —
      // repeat visitors (who have a 'presets' key) never download it
      const { DEFAULT_PRESETS_COMPRESSED } = await import('./defaultPresets')
      const presetsJson = await decodePresetText(DEFAULT_PRESETS_COMPRESSED)
      window.localStorage.setItem('presets', presetsJson)
      // start a brand-new visitor on the first factory preset — unless they
      // arrived via a share link, in which case the shared patch takes the stage
      if (!sharedLoaded) {
        const presets: Preset[] = JSON.parse(presetsJson)
        if (Array.isArray(presets) && presets.length) {
          window.localStorage.setItem('activePreset', presets[0].id)
        }
      }
    } catch {
      // no DecompressionStream (or corrupt data): boot with an empty library
      // rather than crashing App's JSON.parse(localStorage.presets)
      window.localStorage.setItem('presets', '[]')
    }
  }
}

// Decode → migrate → validate a share link's payload, then land it as the active
// patch with a fresh identity (so saving it creates a new preset, and hotkeys
// stay personal). The schema helpers arrive via dynamic import: they pull in
// globals.tsx, which registers document listeners at module scope — not SSR-safe
// and firmly app-chunk territory — so they must only load inside this
// browser-only call, keeping AppLoader's static import graph server-renderable.
async function loadSharedPreset(encoded: string): Promise<boolean> {
  try {
    const shared = (await decodePreset(encoded)) as Preset
    // .length is load-bearing: validPreset accepts an empty channels array
    if (!Array.isArray(shared.channels) || !shared.channels.length) return false
    const [{ patchPresetAndChannels, validPreset }, { deepEqual }, { v4: uuid }] = await Promise.all([
      import('./preset'),
      import('./hooks/useHistory'),
      import('uuid'),
    ])
    patchPresetAndChannels(shared)
    // if the receiver's library already holds this exact preset (same name and
    // content — e.g. an unedited factory preset), select it like a normal preset
    // pick instead of landing a redundant unsaved copy
    const presets: Preset[] = JSON.parse(window.localStorage.getItem('presets') || '[]')
    const match = Array.isArray(presets) && presets.find((p) => deepEqual(stripIdentity(p), stripIdentity(shared)))
    if (match) {
      window.localStorage.setItem('activePatch', JSON.stringify(match))
      window.localStorage.setItem('activePreset', match.id)
      return true
    }
    Object.assign(shared, { id: uuid(), hotkey: null, placeholder: true })
    if (!validPreset(shared)) return false
    window.localStorage.setItem('activePatch', JSON.stringify(shared))
    window.localStorage.removeItem('activePreset')
    return true
  } catch {
    return false
  }
}

// Preset identity is personal to each library (a received patch gets a fresh id,
// hotkeys belong to the receiver), so content matching ignores those fields.
function stripIdentity(preset: Preset): Partial<Preset> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, hotkey, placeholder, ...content } = preset
  return content
}
