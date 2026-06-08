// Shared domain types for the phase-machine app. Derived from the runtime
// shapes in globals (BLANK_CHANNEL / DEFAULT_PRESET). Kept pragmatic — some
// string-y fields are typed as `string` rather than exhaustive unions for now.

import type { Dispatch, SetStateAction, MutableRefObject } from 'react'
import type * as Tone from 'tone'

export type Theme = 'dark' | 'light' | 'contrast' | 'aero'
export type View = 'horizontal' | 'stacked' | 'condensed' | 'clock'
export type Section = 'key' | 'piano' | 'sequence'

// Shorthand for a React state setter (the second tuple element of useState).
export type Setter<T> = Dispatch<SetStateAction<T>>

// ---- Tone.js audio nodes used across the app ----
// The synth is a MonoSynth in mono mode and a PolySynth wrapping MonoSynth
// voices in poly mode (see InstrumentParams.poly / useInstruments).
export type SynthInstrument = Tone.MonoSynth | Tone.PolySynth<Tone.MonoSynth>
export type SamplerInstrument = Tone.Sampler
export type Instrument = SynthInstrument | SamplerInstrument

// Refs to those nodes. They start undefined, get assigned on init, and are
// nulled on dispose (see useInstruments cleanup), hence the `| null | undefined`.
// (Effect nodes are owned by the SlotNode handles in useInstruments, not typed here.)
export type SynthRef = MutableRefObject<SynthInstrument | null | undefined>
export type SamplerRef = MutableRefObject<SamplerInstrument | null | undefined>
export type InstrumentRef = MutableRefObject<Instrument | null | undefined>
export type GainRef = MutableRefObject<Tone.Gain | null | undefined>
export type PannerRef = MutableRefObject<Tone.Panner | null | undefined>

// The bundle useInstruments groups its instrument refs into and hands to InstrumentModal.
export interface InstrumentRefs {
  synthInstrument: SynthRef
  pianoInstrument: SamplerRef
  marimbaInstrument: SamplerRef
  bassInstrument: SamplerRef
  vibesInstrument: SamplerRef
  harpInstrument: SamplerRef
  choralInstrument: SamplerRef
  drumsInstrument: SamplerRef
  drumMachineInstrument: SamplerRef
}

// ---- MIDI ----
// The WebMidi library only publicly exports `WebMidi` itself, so we describe
// the bits of an input device and note event that the app actually reads.
export interface MidiInputLike {
  name: string
}
export interface MidiNoteEvent {
  note: { number: number; attack?: number; release?: number }
  message?: { data?: number[] }
  port?: { name: string }
}
export type MidiOutRef = MutableRefObject<string | null | undefined>
export type MidiInRef = MutableRefObject<MidiInputLike | null | undefined>

// The set of effects a slot can host. 'none' = passthrough.
export type EffectType =
  | 'none'
  | 'chorus'
  | 'distortion'
  | 'delay'
  | 'reverb'
  | 'vibrato'
  | 'bitcrusher'
  | 'pitch'
  | 'phaser'
  | 'compressor'
  | 'multibandComp'
  | 'eq'

// One effect slot. Each slot carries EVERY effect's params so switching a slot's
// type away and back keeps its settings "warm" (the live Tone node is created on
// demand; the params persist in state). `wet` is the per-slot Amount (only the
// effects with a native Tone `wet` use it; the processors — comp/eq — ignore it).
export interface EffectSlot {
  type: EffectType
  wet: number
  // chorus
  chorusDepth: number
  chorusDelayTime: number
  chorusFreq: number
  chorusSpread: number
  // distortion
  distortion: number
  // delay (syncDelayTime: false = free seconds, string note-rate = tempo-synced)
  syncDelayTime: boolean | string
  delayTime: number
  delayFeedback: number
  // reverb
  reverbDecay: number
  reverbPreDelay: number
  // vibrato
  vibratoDepth: number
  vibratoFreq: number
  // bitcrusher
  bits: number
  // pitch shift (semitones, plus feedback for cascading repitch)
  pitchShift: number
  pitchFeedback: number
  // phaser
  phaserFreq: number
  phaserOctaves: number
  phaserBaseFreq: number
  phaserQ: number
  // compressor
  compThreshold: number
  compRatio: number
  compAttack: number
  compRelease: number
  // multiband compressor
  mbLowThreshold: number
  mbMidThreshold: number
  mbHighThreshold: number
  mbRatio: number
  mbAttack: number
  mbRelease: number
  mbLowFreq: number
  mbHighFreq: number
  // parametric EQ: low-shelf · mid peak · high-shelf
  eqLowFreq: number
  eqLowGain: number
  eqMidFreq: number
  eqMidGain: number
  eqMidQ: number
  eqHighFreq: number
  eqHighGain: number
}

export type EffectSlots = [EffectSlot, EffectSlot, EffectSlot]

export interface InstrumentParams {
  gain: number
  // stereo pan for the whole channel, -1 (left) .. 1 (right), 0 = center.
  pan: number
  synthType: string
  // false = monophonic MonoSynth, true = polyphonic PolySynth (synth audio only).
  poly: boolean
  portamento: number
  modulationType: string
  harmonicity: number
  fatSpread: number
  fatCount: number
  pulseWidth: number
  pwmFreq: number
  envAttack: number
  envDecay: number
  envSustain: number
  envRelease: number
  cutoff: number
  resonance: number
  rolloff: number
  filterAttack: number
  filterDecay: number
  filterSustain: number
  filterRelease: number
  filterAmount: number
  samplerAttack: number
  samplerRelease: number
  // 3 serial effect slots (instruments -> effects[0] -> [1] -> [2] -> gain).
  // Legacy presets used flat effect fields here; patchChannel migrates them into
  // effects[0] (see migrateEffectSlots), so effects[] is the sole source of truth.
  effects: EffectSlots
}

export interface Channel {
  id: string
  color: string
  channelNum: number
  scribbler: string
  velocity: number
  key: boolean[]
  keyRate: string
  keyMovement: string
  keyArpInc1: number
  keyArpInc2: number
  sustain: number
  keySwing: number
  keySwingLength: number
  mute: boolean
  solo: boolean
  shiftAmt: number
  axis: number
  rangeStart: number
  rangeEnd: number
  seqSteps: boolean[]
  seqLength: number
  seqShiftAmt: number
  seqRate: string
  seqMovement: string
  seqArpInc1: number
  seqArpInc2: number
  seqSwing: number
  seqSwingLength: number
  hold: boolean
  instrumentOn: boolean
  instrumentType: string
  rangeMode: boolean
  keybdPitches: number[]
  midiIn: boolean | string
  midiHold: boolean
  customMidiOutChannel: boolean
  midiOutChannel: number
  instrumentParams: InstrumentParams
}

export interface Preset {
  name: string
  id: string
  hotkey: number | string | null
  placeholder: boolean
  numChannels: number
  channelSync: boolean
  tempo: number
  channels: Channel[]
}
