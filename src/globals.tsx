import React from 'react'
import { v4 as uuid } from 'uuid'
import UAParser from 'ua-parser-js'
import sine from './assets/sine_wave.svg'
import lightSine from './assets/sine_wave_light.svg'
import darkSine from './assets/sine_wave_dark.svg'
import square from './assets/square_wave.svg'
import lightSquare from './assets/square_wave_light.svg'
import darkSquare from './assets/square_wave_dark.svg'
import triangle from './assets/triangle_wave.svg'
import lightTriangle from './assets/triangle_wave_light.svg'
import darkTriangle from './assets/triangle_wave_dark.svg'
import sawtooth from './assets/sawtooth_wave.svg'
import lightSawtooth from './assets/sawtooth_wave_light.svg'
import darkSawtooth from './assets/sawtooth_wave_dark.svg'
import pulse from './assets/pulse_wave.svg'
import lightPulse from './assets/pulse_wave_light.svg'
import darkPulse from './assets/pulse_wave_dark.svg'
import drums from './assets/samples-drums.svg'
import lightDrums from './assets/samples-drums-light.svg'
import darkDrums from './assets/samples-drums-dark.svg'
import drumMachine from './assets/samples-drum-machine.svg'
import lightDrumMachine from './assets/samples-drum-machine-light.svg'
import darkDrumMachine from './assets/samples-drum-machine-dark.svg'
import marimba from './assets/samples-marimba.svg'
import lightMarimba from './assets/samples-marimba-light.svg'
import darkMarimba from './assets/samples-marimba-dark.svg'
import piano from './assets/samples-piano.svg'
import lightPiano from './assets/samples-piano-light.svg'
import darkPiano from './assets/samples-piano-dark.svg'
import synth from './assets/samples-synth.svg'
import lightSynth from './assets/samples-synth-light.svg'
import darkSynth from './assets/samples-synth-dark.svg'
import bass from './assets/samples-bass.svg'
import lightBass from './assets/samples-bass-light.svg'
import darkBass from './assets/samples-bass-dark.svg'
import vibes from './assets/samples-vibes.svg'
import lightVibes from './assets/samples-vibes-light.svg'
import darkVibes from './assets/samples-vibes-dark.svg'
import harp from './assets/samples-harp.svg'
import lightHarp from './assets/samples-harp-light.svg'
import darkHarp from './assets/samples-harp-dark.svg'
import choral from './assets/samples-choral.svg'
import lightChoral from './assets/samples-choral-light.svg'
import darkChoral from './assets/samples-choral-dark.svg'
import rhythmic from './assets/samples-rhythmic.svg'
import lightRhythmic from './assets/samples-rhythmic-light.svg'
import darkRhythmic from './assets/samples-rhythmic-dark.svg'
import percussion from './assets/samples-percussion.svg'
import lightPercussion from './assets/samples-percussion-light.svg'
import darkPercussion from './assets/samples-percussion-dark.svg'
import hxc from './assets/samples-hxc.svg'
import lightHxc from './assets/samples-hxc-light.svg'
import darkHxc from './assets/samples-hxc-dark.svg'
import metal from './assets/samples-metal.svg'
import lightMetal from './assets/samples-metal-light.svg'
import darkMetal from './assets/samples-metal-dark.svg'
import pluck from './assets/samples-pluck.svg'
import lightPluck from './assets/samples-pluck-light.svg'
import darkPluck from './assets/samples-pluck-dark.svg'
import { rangeWrapper, secondsToRate } from './math'
import { Channel, Preset, EffectSlot, EffectSlots } from './types'

const uaParser = new UAParser()
export const BROWSER = uaParser.getBrowser()

export let ALT = false
const altOnEvent = new Event('altOn')
const altOffEvent = new Event('altOff')
document.addEventListener('keydown', (e) => {
  if (e.key === 'Alt') {
    ALT = true
    document.dispatchEvent(altOnEvent)
  } else if (e.key === 'Enter' && document.activeElement?.classList.contains('nowrap')) {
    e.preventDefault()
  }
})
document.addEventListener('keyup', (e) => {
  if (e.key === 'Alt') {
    ALT = false
    document.dispatchEvent(altOffEvent)
  }
})

export const CHORUS_ENABLED = !BROWSER.name?.includes('Safari')

export const VIEWS = ['horizontal', 'stacked', 'condensed', 'clock']

export const SECTIONS = ['key', 'piano', 'sequence']

// blue, purple, magenta, pink, dark-green, green, yellow, red
export const CHANNEL_COLORS = ['#00bdff', '#ab80ff', '#ff8de7', '#00db9c', '#fa48ff', '#00ff5b', '#edff00', '#ff5c5c']

// Settings theme picker. Values are the internal theme keys (unchanged); labels
// are what the user sees. 'light' is shown as "Toxic" and ordered last.
export const THEMES = [
  { value: 'dark', label: 'Dark' },
  { value: 'eclipse', label: 'Eclipse 🌑' },
  { value: 'aero', label: 'Aero 🐬' },
  { value: 'coquette', label: 'Coquette 🎀' },
  { value: 'contrast', label: 'Contrast' },
  { value: 'light', label: 'Toxic' },
]

export const RATES = [
  '4m',
  '2m',
  '1m',
  '1n',
  '1n.',
  '2n',
  '2n.',
  '2t',
  '4n',
  '4n.',
  '4t',
  '8n',
  '8n.',
  '8t',
  '16n',
  '16n.',
  '16t',
  '32n',
  '32n.',
  '32t',
  '64n',
  '64n.',
  '64t',
]

// RATES arranged for the grid-style rate dropdown: 3 columns (base · dotted · triplet),
// one note value per row, with the measures sharing the top row. The empty string is a
// gap cell inserted where the whole-note triplet would be (it doesn't exist), so every
// subsequent row stays aligned to its [base, dotted, triplet] columns.
export const RATE_GRID = RATES.flatMap((rate) => (rate === '1n.' ? [rate, ''] : [rate]))

// The note-rate a delay snaps to when sync is first switched on — a dotted eighth, a
// musical/neutral default. Also the fallback when upgrading a legacy boolean synced
// delay with no tempo to reverse-derive from. See upgradeSyncDelay / EffectSlotControls.
export const DEFAULT_SYNC_DELAY_RATE = '8n.'

// Max delay time (seconds) for the FeedbackDelay node's buffer / delayTime AudioParam.
// A tempo-synced delay derives its time from the global tempo, so at very low tempos the
// derived seconds can grow large (e.g. '8n.' at 1 BPM ≈ 45s). Tone's Param THROWS when a
// value exceeds its max, which crashed the app when typing a low tempo. Build delay nodes
// with this generous max and clamp synced seconds to it: covers normal musical tempos and
// caps (rather than crashes) at extreme lows. The manual delay-time knob tops out at 1s.
export const MAX_DELAY_TIME = 10

// Clock-division rates, relative to the global tempo's beat (quarter note). Stored as
// '/N' (÷N, N times slower) and '*N' (×N, N times faster); '*1' is unity (== 4n). Listed
// slowest → fastest. rateToSeconds() converts these to an interval. See math.ts.
export const CLOCK_RATES = [
  ...[9, 8, 7, 6, 5, 4, 3, 2].map((n) => ({ value: `/${n}`, label: `÷${n}` })),
  { value: '*1', label: '×1' },
  ...[2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ value: `*${n}`, label: `×${n}` })),
]

// Full option list for the key/sequence rate dropdown: the note-value grid, a full-width
// divider, then the clock-division grid (also 3 columns). { divider: true } renders as a
// section separator spanning the grid.
export const RATE_DROPDOWN_OPTIONS = [...RATE_GRID, { divider: true }, ...CLOCK_RATES]

function themedIcon(icon: string, theme: string) {
  // Eclipse is a dark theme; it reuses the dark (light-colored) icon assets.
  if (theme === 'eclipse') theme = 'dark'
  switch (icon) {
    case 'sine':
      switch (theme) {
        case 'light':
          return sine
        case 'dark':
          return lightSine
        case 'contrast':
          return darkSine
        default:
          return sine
      }
    case 'square':
      switch (theme) {
        case 'light':
          return square
        case 'dark':
          return lightSquare
        case 'contrast':
          return darkSquare
        default:
          return square
      }
    case 'triangle':
      switch (theme) {
        case 'light':
          return triangle
        case 'dark':
          return lightTriangle
        case 'contrast':
          return darkTriangle
        default:
          return triangle
      }
    case 'sawtooth':
      switch (theme) {
        case 'light':
          return sawtooth
        case 'dark':
          return lightSawtooth
        case 'contrast':
          return darkSawtooth
        default:
          return sawtooth
      }
    case 'pulse':
      switch (theme) {
        case 'light':
          return pulse
        case 'dark':
          return lightPulse
        case 'contrast':
          return darkPulse
        default:
          return pulse
      }
    case 'drums':
      switch (theme) {
        case 'light':
          return drums
        case 'dark':
          return lightDrums
        case 'contrast':
          return darkDrums
        default:
          return drums
      }
    case 'drum-machine':
      switch (theme) {
        case 'light':
          return drumMachine
        case 'dark':
          return lightDrumMachine
        case 'contrast':
          return darkDrumMachine
        default:
          return drumMachine
      }
    case 'marimba':
      switch (theme) {
        case 'light':
          return marimba
        case 'dark':
          return lightMarimba
        case 'contrast':
          return darkMarimba
        default:
          return marimba
      }
    case 'piano':
      switch (theme) {
        case 'light':
          return piano
        case 'dark':
          return lightPiano
        case 'contrast':
          return darkPiano
        default:
          return piano
      }
    case 'synth':
      switch (theme) {
        case 'light':
          return synth
        case 'dark':
          return lightSynth
        case 'contrast':
          return darkSynth
        default:
          return synth
      }
    case 'bass':
      switch (theme) {
        case 'light':
          return bass
        case 'dark':
          return lightBass
        case 'contrast':
          return darkBass
        default:
          return bass
      }
    case 'vibes':
      switch (theme) {
        case 'light':
          return vibes
        case 'dark':
          return lightVibes
        case 'contrast':
          return darkVibes
        default:
          return vibes
      }
    case 'harp':
      switch (theme) {
        case 'light':
          return harp
        case 'dark':
          return lightHarp
        case 'contrast':
          return darkHarp
        default:
          return harp
      }
    case 'choral':
      switch (theme) {
        case 'light':
          return choral
        case 'dark':
          return lightChoral
        case 'contrast':
          return darkChoral
        default:
          return choral
      }
    case 'rhythmic':
      switch (theme) {
        case 'light':
          return rhythmic
        case 'dark':
          return lightRhythmic
        case 'contrast':
          return darkRhythmic
        default:
          return rhythmic
      }
    case 'percussion':
      switch (theme) {
        case 'light':
          return percussion
        case 'dark':
          return lightPercussion
        case 'contrast':
          return darkPercussion
        default:
          return percussion
      }
    case 'hxc':
      switch (theme) {
        case 'light':
          return hxc
        case 'dark':
          return lightHxc
        case 'contrast':
          return darkHxc
        default:
          return hxc
      }
    case 'metal':
      switch (theme) {
        case 'light':
          return metal
        case 'dark':
          return lightMetal
        case 'contrast':
          return darkMetal
        default:
          return metal
      }
    case 'pluck':
      switch (theme) {
        case 'light':
          return pluck
        case 'dark':
          return lightPluck
        case 'contrast':
          return darkPluck
        default:
          return pluck
      }
    default:
      return null
  }
}

export function themedSwitch(component: string, theme: string, mute?: boolean) {
  switch (component) {
    case 'offColor':
      switch (theme) {
        case 'light':
          return '#e6e6e6'
        case 'dark':
          return '#45454c'
        case 'contrast':
          return '#45454C'
        case 'aero':
          return '#9fc3d2'
        case 'coquette':
          return '#ffc9e0'
        case 'eclipse':
          return '#2d323d'
        default:
          return '#e6e6e6'
      }
    case 'onColor':
      switch (theme) {
        case 'light':
          return '#e6e6e6'
        case 'dark':
          return '#45454c'
        case 'contrast':
          return '#45454C'
        case 'aero':
          return '#9fc3d2'
        case 'coquette':
          return '#ffc9e0'
        case 'eclipse':
          return '#2d323d'
        default:
          return '#e6e6e6'
      }
    case 'offHandleColor':
      switch (theme) {
        case 'light':
          return '#666666'
        case 'dark':
          return '#a0a0b4'
        case 'contrast':
          return mute ? '#aab1cc' : '#CCD0FF'
        case 'aero':
          return '#ffffff'
        case 'coquette':
          return '#ffffff'
        case 'eclipse':
          return mute ? '#5b6270' : '#c2c8d2'
        default:
          return '#666666'
      }
    case 'onHandleColor':
      switch (theme) {
        case 'light':
          return '#33ff00'
        case 'dark':
          return '#00c591'
        case 'contrast':
          return '#33ff00'
        case 'aero':
          return '#5fd06a'
        case 'coquette':
          return '#ff85be'
        case 'eclipse':
          return '#2c55b3'
        default:
          return '#33ff00'
      }
    default:
      return '#e6e6e6'
  }
}

export const SIGNAL_TYPES: Record<string, (theme: string) => React.JSX.Element> = {
  sine: (theme: string) => <img className="wave-icon" src={themedIcon('sine', theme) ?? ''} alt="" />,
  square: (theme: string) => <img className="wave-icon" src={themedIcon('square', theme) ?? ''} alt="" />,
  triangle: (theme: string) => <img className="wave-icon" src={themedIcon('triangle', theme) ?? ''} alt="" />,
  sawtooth: (theme: string) => <img className="wave-icon" src={themedIcon('sawtooth', theme) ?? ''} alt="" />,
}
export const SYNTH_TYPES: Record<string, (theme: string) => React.JSX.Element> = Object.assign({}, SIGNAL_TYPES, {
  pulse: (theme: string) => <img className="wave-icon" src={themedIcon('pulse', theme) ?? ''} alt="" />,
  pwm: () => (
    <span className="wave-title" style={{ marginRight: 0 }}>
      pwm
    </span>
  ),
})

export const INSTRUMENT_TYPES: Record<string, (theme: string) => React.JSX.Element> = {
  synth: (theme: string) => (
    <img className="wave-icon" style={{ height: 20 }} src={themedIcon('synth', theme) ?? ''} alt="" />
  ),
  bass: (theme: string) => (
    <img className="wave-icon" style={{ height: 28 }} src={themedIcon('bass', theme) ?? ''} alt="" />
  ),
  piano: (theme: string) => (
    <img className="wave-icon" style={{ height: 20 }} src={themedIcon('piano', theme) ?? ''} alt="" />
  ),
  marimba: (theme: string) => (
    <img className="wave-icon" style={{ height: 18 }} src={themedIcon('marimba', theme) ?? ''} alt="" />
  ),
  vibes: (theme: string) => (
    <img className="wave-icon" style={{ height: 20 }} src={themedIcon('vibes', theme) ?? ''} alt="" />
  ),
  harp: (theme: string) => (
    <img className="wave-icon" style={{ height: 20 }} src={themedIcon('harp', theme) ?? ''} alt="" />
  ),
  choral: (theme: string) => (
    <img className="wave-icon" style={{ height: 20 }} src={themedIcon('choral', theme) ?? ''} alt="" />
  ),
  drums: (theme: string) => (
    <img className="wave-icon" style={{ height: 20 }} src={themedIcon('drums', theme) ?? ''} alt="" />
  ),
  'drum-machine': (theme: string) => (
    <img className="wave-icon" style={{ height: 20 }} src={themedIcon('drum-machine', theme) ?? ''} alt="" />
  ),
  // Tempo-synced rhythmic-loop sampler (breaks, top loops, grooves) — vinyl
  // turntable glyph, themed like the other instrument icons.
  rhythmic: (theme: string) => (
    <img className="wave-icon" style={{ height: 20 }} src={themedIcon('rhythmic', theme) ?? ''} alt="" />
  ),
  // Second varispeed pack (Percussion Chops) — congas glyph.
  percussion: (theme: string) => (
    <img className="wave-icon" style={{ height: 20 }} src={themedIcon('percussion', theme) ?? ''} alt="" />
  ),
  // Hard-dance one-shot sampler (kicks/snares) — smiley glyph.
  hxc: (theme: string) => <img className="wave-icon" style={{ height: 20 }} src={themedIcon('hxc', theme) ?? ''} alt="" />,
  // Tone.MetalSynth — diamond-plate glyph.
  metal: (theme: string) => (
    <img className="wave-icon" style={{ height: 20 }} src={themedIcon('metal', theme) ?? ''} alt="" />
  ),
  // Tone.PluckSynth — lyre glyph.
  pluck: (theme: string) => (
    <img className="wave-icon" style={{ height: 22 }} src={themedIcon('pluck', theme) ?? ''} alt="" />
  ),
}

// Pitched samplers that can stack extra notes above the base note (a chord/interval
// voicing). The loop/drum samplers (drums, drum-machine, rhythmic, percussion, hxc) are
// excluded — stacking transposed slices wouldn't be musical.
export const STACKABLE_INSTRUMENTS = ['piano', 'bass', 'marimba', 'vibes', 'harp', 'choral']

// Semitone offsets stacked ABOVE the base note for each note-stack option. The base note
// always plays; these are the extra voices added on top.
export const NOTE_STACKS: Record<string, number[]> = {
  none: [],
  'major-triad': [4, 7], // major 3rd + perfect 5th
  'minor-triad': [3, 7], // minor 3rd + perfect 5th
  fifth: [7], // perfect 5th
  'major-7': [4, 7, 11], // major 3rd + 5th + major 7th
  octave: [12],
}

// Dropdown options for the sampler note-stack control (value → shown label). Each `value`
// must have a matching key in NOTE_STACKS above (an unmatched value falls back to no stack).
export const NOTE_STACK_OPTIONS = [
  { value: 'none', label: 'No Stack' },
  { value: 'major-triad', label: 'Major Triad' },
  { value: 'minor-triad', label: 'Minor Triad' },
  { value: 'fifth', label: 'Fifth' },
  { value: 'major-7', label: 'Major 7' },
  { value: 'octave', label: 'Octave Above' },
]

/* eslint-disable @typescript-eslint/no-explicit-any */
export const MOVEMENTS: Record<string, (...args: any[]) => number> = {
  up: (length: number, i: number | undefined) => (i === undefined ? 0 : i < length - 1 ? i + 1 : 0),
  'up/down': (length: number, i: number | undefined, descending: { current: boolean }) => {
    if (i === undefined) {
      return 0
    }
    if ((i === 0 && descending.current) || (i === length - 1 && !descending.current)) {
      descending.current = !descending.current
    }
    return i + (descending.current ? -1 : 1)
  },
  down: (length: number, i: number | undefined) => (i === undefined ? length - 1 : i > 0 ? i - 1 : length - 1),
  '+/-': (
    length: number,
    i: number | undefined,
    inc1: number,
    inc2: number,
    doInc2: { current: boolean }
  ) => {
    if (i === undefined) {
      return 0
    }
    const index = rangeWrapper(i + (doInc2.current ? inc2 : inc1), length)
    doInc2.current = !doInc2.current
    return index
  },
  random: (length: number) => Math.floor(Math.random() * length),
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function handleArpMode(
  mode: string,
  length: number,
  i: number | undefined,
  util: any,
  inc1?: number,
  inc2?: number
) {
  let nextPitchIndex = 0
  switch (mode) {
    case 'up':
      nextPitchIndex = MOVEMENTS['up'](length, i)
      break
    case 'up/down':
      nextPitchIndex = MOVEMENTS['up/down'](length, i, util)
      break
    case 'down':
      nextPitchIndex = MOVEMENTS['down'](length, i)
      break
    case '+/-':
      nextPitchIndex = MOVEMENTS['+/-'](length, i, inc1, inc2, util)
      break
    case 'random':
      nextPitchIndex = MOVEMENTS['random'](length)
      break
    default:
      console.log('UNRECOGNIZED MOVEMENT')
  }
  return nextPitchIndex
}

export const KNOB_MAX = 1

export const SUSTAIN_MIN = 0.2

export const MAX_CHANNELS = 8

export const EFFECTS = [
  'none',
  'chorus',
  'distortion',
  'delay',
  'reverb',
  'vibrato',
  'bitcrusher',
  'pitch',
  'phaser',
  'compressor',
  'multibandComp',
  'eq',
]

// Effects that have a native Tone `wet` (so a per-slot Amount knob makes sense).
// The processors — compressor / multibandComp / eq — operate on the full signal
// and have no dry/wet, so their Amount knob is hidden in the UI.
export const WET_EFFECTS = ['chorus', 'distortion', 'delay', 'reverb', 'vibrato', 'bitcrusher', 'pitch', 'phaser']

// A fresh, fully-populated effect slot. ALWAYS call this (never share a literal)
// so each channel/slot gets its own object — patchChannel relies on this to avoid
// aliasing one default array across every channel.
export const BLANK_EFFECT_SLOT = (): EffectSlot => ({
  type: 'none',
  wet: 1,
  chorusDepth: 0.5,
  chorusDelayTime: 2.5,
  chorusFreq: 4,
  chorusSpread: 0,
  distortion: 1,
  syncDelayTime: false,
  delayTime: 0.25,
  delayFeedback: 0.5,
  reverbDecay: 1.5,
  reverbPreDelay: 0.01,
  vibratoDepth: 0.1,
  vibratoFreq: 5,
  bits: 4,
  pitchShift: 0,
  pitchFeedback: 0,
  phaserFreq: 0.5,
  phaserOctaves: 3,
  phaserBaseFreq: 350,
  phaserQ: 10,
  compThreshold: -24,
  compRatio: 4,
  compAttack: 0.003,
  compRelease: 0.25,
  mbLowThreshold: -24,
  mbMidThreshold: -24,
  mbHighThreshold: -24,
  mbRatio: 4,
  mbAttack: 0.005,
  mbRelease: 0.1,
  mbLowFreq: 250,
  mbHighFreq: 2000,
  eqLowFreq: 200,
  eqLowGain: 0,
  eqMidFreq: 1000,
  eqMidGain: 0,
  eqMidQ: 1,
  eqHighFreq: 5000,
  eqHighGain: 0,
})

export const BLANK_EFFECT_SLOTS = (): EffectSlots => [BLANK_EFFECT_SLOT(), BLANK_EFFECT_SLOT(), BLANK_EFFECT_SLOT()]

// The legacy single-effect flat fields that map into slot 0 of the new model.
const LEGACY_EFFECT_FIELDS = [
  'chorusDepth',
  'chorusDelayTime',
  'chorusFreq',
  'chorusSpread',
  'distortion',
  'syncDelayTime',
  'delayTime',
  'delayFeedback',
  'reverbDecay',
  'reverbPreDelay',
  'vibratoDepth',
  'vibratoFreq',
]

// Build a channel's 3-slot `effects` array. Pure + idempotent:
//  • no `effects` yet (legacy preset) → migrate the old single effect into slot 0
//    (type=effectType, wet=effectWet, copy the per-effect params), slots 1-2 blank.
//  • already has `effects` → normalize to exactly 3 slots, backfilling any missing
//    per-slot params from BLANK_EFFECT_SLOT so partial/old slots stay valid.
// Always returns fresh slot objects (never shares references across channels).
// Pre-3-slot presets stored a tempo-synced delay as boolean `syncDelayTime: true`
// plus a baked `delayTime` in seconds; the current model stores the actual note-rate
// string instead. Recover that rate from the baked delayTime (at the preset's tempo)
// so the rate dropdown shows the right value and the delay tracks tempo again. With no
// tempo we can't reverse-derive, so fall back to a musical default.
function upgradeSyncDelay(slot: Record<string, unknown>, tempo?: number) {
  if (slot.syncDelayTime !== true) return
  const seconds = typeof slot.delayTime === 'number' ? slot.delayTime : 0.25
  slot.syncDelayTime = tempo ? secondsToRate(seconds, tempo, RATES) : DEFAULT_SYNC_DELAY_RATE
}

export function migrateEffectSlots(params: Record<string, unknown>, tempo?: number): EffectSlots {
  if (params.effects === undefined) {
    const slot0 = BLANK_EFFECT_SLOT() as unknown as Record<string, unknown>
    slot0.type = typeof params.effectType === 'string' ? params.effectType : 'none'
    if (typeof params.effectWet === 'number') slot0.wet = params.effectWet
    for (const k of LEGACY_EFFECT_FIELDS) {
      if (params[k] !== undefined) slot0[k] = params[k]
    }
    upgradeSyncDelay(slot0, tempo)
    return [slot0 as unknown as EffectSlot, BLANK_EFFECT_SLOT(), BLANK_EFFECT_SLOT()]
  }
  const arr = Array.isArray(params.effects) ? (params.effects as Record<string, unknown>[]) : []
  const slots: EffectSlot[] = []
  for (let i = 0; i < 3; i++) {
    const slot = { ...BLANK_EFFECT_SLOT(), ...(arr[i] || {}) } as unknown as Record<string, unknown>
    upgradeSyncDelay(slot, tempo)
    slots.push(slot as unknown as EffectSlot)
  }
  return slots as EffectSlots
}

export const BLANK_PITCH_CLASSES = () => [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
]

export const RANDOM_PITCH_CLASSES = () => [...Array(12)].map(() => Math.random() > 0.5)

export const whiteKey = (i: number) => {
  i = i % 12
  if (i <= 4) {
    return i % 2 === 0
  } else {
    return i % 2 !== 0
  }
}

export const nextBlackKey = {
  near: (i: number) => {
    i = i % 12
    return i === 0 || i === 5
  },
  middle: (i: number) => {
    i = i % 12
    return i === 7
  },
  far: (i: number) => {
    i = i % 12
    return i === 2 || i === 9
  },
}
export const prevBlackKey = {
  near: (i: number) => {
    i = i % 12
    return i === 4 || i === 11
  },
  middle: (i: number) => {
    i = i % 12
    return i === 9
  },
  far: (i: number) => {
    i = i % 12
    return i === 2 || i === 7
  },
}

export const blackKeyLeft = (i: number) => {
  i = i % 12
  return i === 1 || i === 6
}

export const blackKeyRight = (i: number) => {
  i = i % 12
  return i === 3 || i === 10
}

export const MIDDLE_C = 36

export const OCTAVES = 8

export function constrain(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

export const CHANNEL_HEIGHT = 97

export const MAX_SEQUENCE_LENGTH = 64

export const DEFAULT_TIME_DIVISION = '4n'

export const MAX_SWING_LENGTH = 6

export const PRESET_HOLD_TIME = 1000

export const PLAY_NOTE_BUFFER_TIME = 0.015

export function noteString(playingNote: number | null | undefined) {
  if (!playingNote && playingNote !== 0) {
    return null
  }
  const notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
  return notes[playingNote % 12] + (Math.floor(playingNote / 12) + 1)
}

export function convertMidiNumber(midiNumber: number) {
  return midiNumber - 24
}

// The 16 MIDI channels — webmidi's `channels` option takes this array for "all"
export const ALL_MIDI_CHANNELS = Array.from({ length: 16 }, (_, i) => i + 1)

// Normalize an output-channel set: unique and sorted. The set is the whole truth:
// a new channel starts at [channelNum + 1], and EMPTY means "no MIDI output" —
// senders must skip MIDI entirely rather than pass an empty channels array.
export function normalizeMidiOutChannels(midiOutChannels: number[]): number[] {
  return [...new Set(midiOutChannels)].sort((a, b) => a - b)
}

export const BLANK_CHANNEL = (channelNum: number, color: string, rangeMode: boolean): Channel => ({
  id: uuid(),
  color,
  channelNum,
  scribbler: '',
  velocity: KNOB_MAX,
  key: [...Array(12)].map(() => false),
  keyRate: DEFAULT_TIME_DIVISION,
  keyMovement: Object.keys(MOVEMENTS)[0],
  keyArpInc1: 2,
  keyArpInc2: -1,
  sustain: (KNOB_MAX - SUSTAIN_MIN) / 2 + SUSTAIN_MIN,
  keySwing: KNOB_MAX / 2,
  keySwingLength: 2,
  mute: false,
  solo: false,
  shiftAmt: 1,
  axis: 0,
  rangeStart: MIDDLE_C,
  rangeEnd: MIDDLE_C + 12,
  seqSteps: [...Array(MAX_SEQUENCE_LENGTH)].map(() => false),
  seqLength: 16,
  seqShiftAmt: 1,
  seqRate: DEFAULT_TIME_DIVISION,
  seqMovement: Object.keys(MOVEMENTS)[0],
  seqArpInc1: 2,
  seqArpInc2: -1,
  seqSwing: KNOB_MAX / 2,
  seqSwingLength: 2,
  hold: false,
  instrumentOn: true,
  instrumentType: 'synth',
  rangeMode,
  keybdPitches: [],
  midiIn: false,
  midiHold: false,
  customMidiInChannel: false,
  midiInChannel: 1,
  midiOutChannels: [channelNum + 1],
  instrumentParams: {
    gain: 1,
    pan: 0,
    synthType: 'triangle',
    poly: false,
    portamento: 0,
    modulationType: 'square',
    harmonicity: 1,
    fatSpread: 20,
    fatCount: 3,
    pulseWidth: 0.2,
    pwmFreq: 0.4,
    envAttack: 0.05,
    envDecay: 0.1,
    envSustain: 0.9,
    envRelease: 1,
    cutoff: 3000,
    resonance: 1,
    rolloff: -24,
    filterAttack: 0.05,
    filterDecay: 0.2,
    filterSustain: 0.5,
    filterRelease: 2,
    filterAmount: 3,
    samplerAttack: 0,
    samplerRelease: 1,
    samplerStack: 'none',
    metalHarmonicity: 5.1,
    metalModulationIndex: 32,
    metalResonance: 360,
    metalOctaves: 1.5,
    metalAttack: 0.001,
    metalDecay: 1.4,
    metalRelease: 0.2,
    pluckAttackNoise: 1,
    pluckDampening: 4000,
    pluckResonance: 0.7,
    pluckRelease: 1,
    effects: BLANK_EFFECT_SLOTS(),
  },
})

export const DEFAULT_PRESET: Preset = {
  name: 'New Preset',
  id: uuid(),
  hotkey: null,
  placeholder: false,
  numChannels: 1,
  channelSync: false,
  tempo: 120,
  channels: [BLANK_CHANNEL(0, CHANNEL_COLORS[0], true)],
}
