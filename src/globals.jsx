import React from 'react'
import { v4 as uuid } from 'uuid'
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
import marimba from './assets/samples-marimba.svg'
import lightMarimba from './assets/samples-marimba-light.svg'
import darkMarimba from './assets/samples-marimba-dark.svg'
import piano from './assets/samples-piano.svg'
import lightPiano from './assets/samples-piano-light.svg'
import darkPiano from './assets/samples-piano-dark.svg'

import { rangeWrapper } from './math'

export const VIEWS = ['stacked', 'horizontal', 'clock']

export const SECTIONS = ['key', 'piano', 'sequencer']

export const CHANNEL_COLORS = ['#008dff', '#ff413e', '#33ff00', '#ff00ff', '#ff9700', '#a825f4', '#00C591', '#EDDB00']

export const THEMES = ['dark', 'light', 'contrast']

export const RATES = [
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

function themedIcon(icon, theme) {
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
    default:
      return null
  }
}

export function themedSwitch(component, theme, mute) {
  switch (component) {
    case 'offColor':
      switch (theme) {
        case 'light':
          return '#e6e6e6'
        case 'dark':
          return '#45454c'
        case 'contrast':
          return '#45454C'
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
        default:
          return '#33ff00'
      }
    default:
      return '#e6e6e6'
  }
}

export const SIGNAL_TYPES = ['sine', 'square', 'triangle', 'sawtooth']

export const INSTRUMENT_TYPES = {
  sine: (theme) => <img className="wave-icon" src={themedIcon('sine', theme)} alt="" />,
  square: (theme) => <img className="wave-icon" src={themedIcon('square', theme)} alt="" />,
  triangle: (theme) => <img className="wave-icon" src={themedIcon('triangle', theme)} alt="" />,
  sawtooth: (theme) => <img className="wave-icon" src={themedIcon('sawtooth', theme)} alt="" />,
  pulse: (theme) => <img className="wave-icon" src={themedIcon('pulse', theme)} alt="" />,
  pwm: () => (
    <span className="wave-title" style={{ marginRight: 0 }}>
      pwm
    </span>
  ),
  fmsine: (theme) => (
    <div>
      <span className="wave-title">fm</span>
      <img className="wave-icon" src={themedIcon('sine', theme)} alt="" />
    </div>
  ),
  fmsquare: (theme) => (
    <div>
      <span className="wave-title">fm</span>
      <img className="wave-icon" src={themedIcon('square', theme)} alt="" />
    </div>
  ),
  fmtriangle: (theme) => (
    <div>
      <span className="wave-title">fm</span>
      <img className="wave-icon" src={themedIcon('triangle', theme)} alt="" />
    </div>
  ),
  fmsawtooth: (theme) => (
    <div>
      <span className="wave-title">fm</span>
      <img className="wave-icon" src={themedIcon('sawtooth', theme)} alt="" />
    </div>
  ),
  amsine: (theme) => (
    <div>
      <span className="wave-title">am</span>
      <img className="wave-icon" src={themedIcon('sine', theme)} alt="" />
    </div>
  ),
  amsquare: (theme) => (
    <div>
      <span className="wave-title">am</span>
      <img className="wave-icon" src={themedIcon('square', theme)} alt="" />
    </div>
  ),
  amtriangle: (theme) => (
    <div>
      <span className="wave-title">am</span>
      <img className="wave-icon" src={themedIcon('triangle', theme)} alt="" />
    </div>
  ),
  amsawtooth: (theme) => (
    <div>
      <span className="wave-title">am</span>
      <img className="wave-icon" src={themedIcon('sawtooth', theme)} alt="" />
    </div>
  ),
  fatsine: (theme) => (
    <div>
      <span className="wave-title">fat</span>
      <img className="wave-icon" src={themedIcon('sine', theme)} alt="" />
    </div>
  ),
  fatsquare: (theme) => (
    <div>
      <span className="wave-title">fat</span>
      <img className="wave-icon" src={themedIcon('square', theme)} alt="" />
    </div>
  ),
  fattriangle: (theme) => (
    <div>
      <span className="wave-title">fat</span>
      <img className="wave-icon" src={themedIcon('triangle', theme)} alt="" />
    </div>
  ),
  fatsawtooth: (theme) => (
    <div>
      <span className="wave-title">fat</span>
      <img className="wave-icon" src={themedIcon('sawtooth', theme)} alt="" />
    </div>
  ),
  piano: (theme) => <img className="wave-icon" style={{ height: 20 }} src={themedIcon('piano', theme)} alt="" />,
  marimba: (theme) => <img className="wave-icon" style={{ height: 18 }} src={themedIcon('marimba', theme)} alt="" />,
  drums: (theme) => <img className="wave-icon" style={{ height: 20 }} src={themedIcon('drums', theme)} alt="" />,
}

export const ARP_MODES = {
  up: (length, i) => (i < length - 1 ? i + 1 : 0),
  'up/down': (length, i, descending) => {
    if ((i === 0 && descending.current) || (i === length - 1 && !descending.current)) {
      descending.current = !descending.current
    }
    return i + (descending.current ? -1 : 1)
  },
  down: (length, i) => (i > 0 ? i - 1 : length - 1),
  '+/-': (length, i, inc1, inc2, doInc2) => {
    const index = rangeWrapper(i + (doInc2.current ? inc2 : inc1), length)
    doInc2.current = !doInc2.current
    return index
  },
  random: (length) => Math.floor(Math.random() * length),
}

export function handleArpMode(mode, length, i, util, inc1, inc2) {
  let nextPitchIndex = 0
  switch (mode) {
    case 'up':
      nextPitchIndex = ARP_MODES['up'](length, i)
      break
    case 'up/down':
      nextPitchIndex = ARP_MODES['up/down'](length, i, util)
      break
    case 'down':
      nextPitchIndex = ARP_MODES['down'](length, i)
      break
    case '+/-':
      nextPitchIndex = ARP_MODES['+/-'](length, i, inc1, inc2, util)
      break
    case 'random':
      nextPitchIndex = ARP_MODES['random'](length)
      break
    default:
      console.log('UNRECOGNIZED ARP MODE')
  }
  return nextPitchIndex
}

export const KNOB_MAX = 1

export const SUSTAIN_MIN = 0.2

export const MAX_CHANNELS = 8

export const SAMPLER_INSTRUMENTS = ['drums', 'piano', 'marimba']

export const EFFECTS = ['none', 'chorus', 'distortion', 'delay', 'reverb', 'vibrato']

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

export const whiteKey = (i) => {
  i = i % 12
  if (i <= 4) {
    return i % 2 === 0
  } else {
    return i % 2 !== 0
  }
}

export const nextBlackKey = {
  near: (i) => {
    i = i % 12
    return i === 0 || i === 5
  },
  middle: (i) => {
    i = i % 12
    return i === 7
  },
  far: (i) => {
    i = i % 12
    return i === 2 || i === 9
  },
}
export const prevBlackKey = {
  near: (i) => {
    i = i % 12
    return i === 4 || i === 11
  },
  middle: (i) => {
    i = i % 12
    return i === 9
  },
  far: (i) => {
    i = i % 12
    return i === 2 || i === 7
  },
}

export const blackKeyLeft = (i) => {
  i = i % 12
  return i === 1 || i === 6
}

export const blackKeyRight = (i) => {
  i = i % 12
  return i === 3 || i === 10
}

export const MIDDLE_C = 36

export const OCTAVES = 8

export function constrain(n, min, max) {
  return Math.min(Math.max(n, min), max)
}

export const CHANNEL_HEIGHT = 97

export const MAX_SEQUENCE_LENGTH = 32

export const DEFAULT_TIME_DIVISION = '4n'

export const MAX_SWING_LENGTH = 6

export const PRESET_HOLD_TIME = 1000

export const PLAY_NOTE_BUFFER_TIME = 0.015

export function noteString(playingNote) {
  if (!playingNote && playingNote !== 0) {
    return null
  }
  const notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
  return notes[playingNote % 12] + (Math.floor(playingNote / 12) + 1)
}

export function convertMidiNumber(midiNumber) {
  return midiNumber - 24
}

export const BLANK_CHANNEL = (channelNum, color, rangeMode) => ({
  id: uuid(),
  color,
  channelNum,
  velocity: KNOB_MAX,
  key: [...Array(12)].map(() => false),
  keyRate: DEFAULT_TIME_DIVISION,
  keyArpMode: Object.keys(ARP_MODES)[0],
  keyArpInc1: 2,
  keyArpInc2: -1,
  keySustain: (KNOB_MAX - SUSTAIN_MIN) / 2 + SUSTAIN_MIN,
  keySwing: KNOB_MAX / 2,
  keySwingLength: 2,
  mute: false,
  solo: false,
  shiftAmt: 1,
  axis: 0,
  rangeStart: MIDDLE_C,
  rangeEnd: MIDDLE_C + 12,
  seqSteps: [...Array(MAX_SEQUENCE_LENGTH)].map(() => false),
  seqLength: MAX_SEQUENCE_LENGTH,
  seqRate: DEFAULT_TIME_DIVISION,
  seqArpMode: Object.keys(ARP_MODES)[0],
  seqArpInc1: 2,
  seqArpInc2: -1,
  seqSwing: KNOB_MAX / 2,
  seqSwingLength: 2,
  seqSustain: (KNOB_MAX - SUSTAIN_MIN) / 2 + SUSTAIN_MIN,
  legato: false,
  instrumentOn: true,
  instrumentType: 'triangle',
  rangeMode,
  keybdPitches: [],
  midiIn: false,
  midiHold: false,
  customMidiOutChannel: false,
  midiOutChannel: 1,
  instrumentParams: {
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
    samplerRelease: 0.1,
    effectType: EFFECTS[0],
    effectWet: 1,
    chorusDepth: 0.5,
    chorusDelayTime: 2.5,
    chorusFreq: 4,
    chorusSpread: 0,
    distortion: 1,
    delayTime: 0.25,
    delayFeedback: 0.5,
    reverbDecay: 1.5,
    reverbPreDelay: 0.01,
    vibratoDepth: 0.1,
    vibratoFreq: 5,
  },
})

export const DEFAULT_PRESET = {
  name: 'New Preset',
  id: uuid(),
  hotkey: null,
  placeholder: false,
  numChannels: 1,
  channelSync: false,
  channels: [BLANK_CHANNEL(0, CHANNEL_COLORS[0], true)],
}
