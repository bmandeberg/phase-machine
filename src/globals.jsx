import React from 'react'
import sine from './assets/sine_wave.svg'
import square from './assets/square_wave.svg'
import triangle from './assets/triangle_wave.svg'
import sawtooth from './assets/sawtooth_wave.svg'
import pulse from './assets/pulse_wave.svg'

import { rangeWrapper } from './math'

export const VIEWS = ['stacked', 'horizontal', 'clock']

export const SECTIONS = ['key', 'piano', 'sequencer']

export const CHANNEL_COLORS = ['#008dff', '#ff413e', '#33ff00', '#ff00ff', '#ff9700', '#a825f4']

export const DEFAULT_SETTINGS = {
  showStepNumbers: false,
  separateMIDIChannels: true,
}

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
  '128n',
  '128n.',
  '128t',
  '256n',
  '256n.',
  '256t',
  '0',
]

export const INSTRUMENT_TYPES = [
  {
    name: <img className="wave-icon" src={sine} alt="" />,
    value: 'sine',
  },
  {
    name: <img className="wave-icon" src={square} alt="" />,
    value: 'square',
  },
  {
    name: <img className="wave-icon" src={triangle} alt="" />,
    value: 'triangle',
  },
  {
    name: <img className="wave-icon" src={sawtooth} alt="" />,
    value: 'sawtooth',
  },
  {
    name: <img className="wave-icon" src={pulse} alt="" />,
    value: 'pulse',
  },
  {
    name: (
      <span className="wave-title" style={{ marginTop: 2, marginRight: 0 }}>
        pwm
      </span>
    ),
    value: 'pwm',
  },
  {
    name: (
      <div>
        <span className="wave-title">fm</span>
        <img className="wave-icon" src={sine} alt="" />
      </div>
    ),
    value: 'fmsine',
  },
  {
    name: (
      <div>
        <span className="wave-title">fm</span>
        <img className="wave-icon" src={square} alt="" />
      </div>
    ),
    value: 'fmsquare',
  },
  {
    name: (
      <div>
        <span className="wave-title">fm</span>
        <img className="wave-icon" src={triangle} alt="" />
      </div>
    ),
    value: 'fmtriangle',
  },
  {
    name: (
      <div>
        <span className="wave-title">fm</span>
        <img className="wave-icon" src={sawtooth} alt="" />
      </div>
    ),
    value: 'fmsawtooth',
  },
  {
    name: (
      <div>
        <span className="wave-title">am</span>
        <img className="wave-icon" src={sine} alt="" />
      </div>
    ),
    value: 'amsine',
  },
  {
    name: (
      <div>
        <span className="wave-title">am</span>
        <img className="wave-icon" src={square} alt="" />
      </div>
    ),
    value: 'amsquare',
  },
  {
    name: (
      <div>
        <span className="wave-title">am</span>
        <img className="wave-icon" src={triangle} alt="" />
      </div>
    ),
    value: 'amtriangle',
  },
  {
    name: (
      <div>
        <span className="wave-title">am</span>
        <img className="wave-icon" src={sawtooth} alt="" />
      </div>
    ),
    value: 'amsawtooth',
  },
  {
    name: (
      <div>
        <span className="wave-title">fat</span>
        <img className="wave-icon" src={sine} alt="" />
      </div>
    ),
    value: 'fatsine',
  },
  {
    name: (
      <div>
        <span className="wave-title">fat</span>
        <img className="wave-icon" src={square} alt="" />
      </div>
    ),
    value: 'fatsquare',
  },
  {
    name: (
      <div>
        <span className="wave-title">fat</span>
        <img className="wave-icon" src={triangle} alt="" />
      </div>
    ),
    value: 'fattriangle',
  },
  {
    name: (
      <div>
        <span className="wave-title">fat</span>
        <img className="wave-icon" src={sawtooth} alt="" />
      </div>
    ),
    value: 'fatsawtooth',
  },
]

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

export function noteString(playingNote) {
  if (!playingNote) {
    return null
  }
  const notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
  return notes[playingNote % 12] + (Math.floor(playingNote / 12) + 1)
}

export const BLANK_PRESET = {
  name: 'blank',
  hotkey: null,
  tempo: 120,
  numChannels: 1,
  view: 'stacked',
  channelSync: false,
  numChannelsSoloed: 0,
  channels: [
    {
      velocity: KNOB_MAX,
      key: [false, true, false, false, true, false, true, false, false, true, false, false],
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
      seqSteps: [...Array(MAX_SEQUENCE_LENGTH)].map(() => Math.random() > 0.35),
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
      instrumentType: INSTRUMENT_TYPES.find((i) => i.value === 'sawtooth'),
    },
  ],
}
