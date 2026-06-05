// Shared domain types for the phase-machine app. Derived from the runtime
// shapes in globals (BLANK_CHANNEL / DEFAULT_PRESET). Kept pragmatic — some
// string-y fields are typed as `string` rather than exhaustive unions for now.

import type { Dispatch, SetStateAction, MutableRefObject } from 'react'
import type * as Tone from 'tone'

export type Theme = 'dark' | 'light' | 'contrast'
export type View = 'horizontal' | 'stacked' | 'clock'
export type Section = 'key' | 'piano' | 'sequence'

// Shorthand for a React state setter (the second tuple element of useState).
export type Setter<T> = Dispatch<SetStateAction<T>>

// ---- Tone.js audio nodes used across the app ----
export type SynthInstrument = Tone.MonoSynth
export type SamplerInstrument = Tone.Sampler
export type Instrument = SynthInstrument | SamplerInstrument
export type ToneEffectNode = Tone.Chorus | Tone.Distortion | Tone.FeedbackDelay | Tone.Reverb | Tone.Vibrato
// Any node an instrument can be connected to (the gain node or an effect).
export type SignalDestination = Tone.Gain | ToneEffectNode

// Refs to those nodes. They start undefined, get assigned on init, and are
// nulled on dispose (see useInstruments cleanup), hence the `| null | undefined`.
export type SynthRef = MutableRefObject<SynthInstrument | null | undefined>
export type SamplerRef = MutableRefObject<SamplerInstrument | null | undefined>
export type InstrumentRef = MutableRefObject<Instrument | null | undefined>
export type ToneEffectRef = MutableRefObject<ToneEffectNode | null | undefined>
export type GainRef = MutableRefObject<Tone.Gain | null | undefined>

// The bundles useInstruments groups its refs into and hands to InstrumentModal.
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
export interface EffectRefs {
  chorusEffect: ToneEffectRef
  distortionEffect: ToneEffectRef
  delayEffect: ToneEffectRef
  reverbEffect: ToneEffectRef
  vibratoEffect: ToneEffectRef
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

export interface InstrumentParams {
  gain: number
  synthType: string
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
  effectType: string
  effectWet: number
  chorusDepth: number
  chorusDelayTime: number
  chorusFreq: number
  chorusSpread: number
  distortion: number
  syncDelayTime: boolean | string
  delayTime: number
  delayFeedback: number
  reverbDecay: number
  reverbPreDelay: number
  vibratoDepth: number
  vibratoFreq: number
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
