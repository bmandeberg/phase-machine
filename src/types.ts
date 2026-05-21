// Shared domain types for the phase-machine app. Derived from the runtime
// shapes in globals (BLANK_CHANNEL / DEFAULT_PRESET). Kept pragmatic — some
// string-y fields are typed as `string` rather than exhaustive unions for now.

export type Theme = 'dark' | 'light' | 'contrast'
export type View = 'horizontal' | 'stacked' | 'clock'
export type Section = 'key' | 'piano' | 'sequence'

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
