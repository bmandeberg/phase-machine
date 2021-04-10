import { rangeWrapper } from './math'

export const VIEWS = ['stacked', 'horizontal', 'clock']

export const SECTIONS = ['key', 'piano', 'sequencer']

export const CHANNEL_COLORS = ['#008dff', '#ff413e', '#33ff00', '#ff00ff']

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
  const notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
  return notes[playingNote % 12] + (Math.floor(playingNote / 12) + 1)
}
