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
import { rangeWrapper } from './math'

const uaParser = new UAParser()
export const BROWSER = uaParser.getBrowser()
const device = uaParser.getDevice()
if (device.type === 'mobile' || BROWSER.name.includes('Mobile')) {
  alert('🗣 sounds can only play if your device is not on silent')
}

export let ALT = false
const altOnEvent = new Event('altOn')
const altOffEvent = new Event('altOff')
document.addEventListener('keydown', (e) => {
  if (e.key === 'Alt') {
    ALT = true
    document.dispatchEvent(altOnEvent)
  } else if (e.key === 'Enter' && document.activeElement.classList.contains('nowrap')) {
    e.preventDefault()
  }
})
document.addEventListener('keyup', (e) => {
  if (e.key === 'Alt') {
    ALT = false
    document.dispatchEvent(altOffEvent)
  }
})

export const CHORUS_ENABLED = !BROWSER.name.includes('Safari')

export const VIEWS = ['horizontal', 'stacked', 'clock']

export const SECTIONS = ['key', 'piano', 'sequence']

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

export const SIGNAL_TYPES = {
  sine: (theme) => <img className="wave-icon" src={themedIcon('sine', theme)} alt="" />,
  square: (theme) => <img className="wave-icon" src={themedIcon('square', theme)} alt="" />,
  triangle: (theme) => <img className="wave-icon" src={themedIcon('triangle', theme)} alt="" />,
  sawtooth: (theme) => <img className="wave-icon" src={themedIcon('sawtooth', theme)} alt="" />,
}
export const SYNTH_TYPES = Object.assign({}, SIGNAL_TYPES, {
  pulse: (theme) => <img className="wave-icon" src={themedIcon('pulse', theme)} alt="" />,
  pwm: () => (
    <span className="wave-title" style={{ marginRight: 0 }}>
      pwm
    </span>
  ),
})

export const INSTRUMENT_TYPES = {
  synth: (theme) => <img className="wave-icon" style={{ height: 20 }} src={themedIcon('synth', theme)} alt="" />,
  bass: (theme) => <img className="wave-icon" style={{ height: 28 }} src={themedIcon('bass', theme)} alt="" />,
  piano: (theme) => <img className="wave-icon" style={{ height: 20 }} src={themedIcon('piano', theme)} alt="" />,
  marimba: (theme) => <img className="wave-icon" style={{ height: 18 }} src={themedIcon('marimba', theme)} alt="" />,
  vibes: (theme) => <img className="wave-icon" style={{ height: 20 }} src={themedIcon('vibes', theme)} alt="" />,
  harp: (theme) => <img className="wave-icon" style={{ height: 20 }} src={themedIcon('harp', theme)} alt="" />,
  choral: (theme) => <img className="wave-icon" style={{ height: 20 }} src={themedIcon('choral', theme)} alt="" />,
  drums: (theme) => <img className="wave-icon" style={{ height: 20 }} src={themedIcon('drums', theme)} alt="" />,
  'drum-machine': (theme) => (
    <img className="wave-icon" style={{ height: 20 }} src={themedIcon('drum-machine', theme)} alt="" />
  ),
}

export const MOVEMENTS = {
  up: (length, i) => (i === undefined ? 0 : i < length - 1 ? i + 1 : 0),
  'up/down': (length, i, descending) => {
    if (i === undefined) {
      return 0
    }
    if ((i === 0 && descending.current) || (i === length - 1 && !descending.current)) {
      descending.current = !descending.current
    }
    return i + (descending.current ? -1 : 1)
  },
  down: (length, i) => (i === undefined ? length - 1 : i > 0 ? i - 1 : length - 1),
  '+/-': (length, i, inc1, inc2, doInc2) => {
    if (i === undefined) {
      return 0
    }
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

export const MAX_SEQUENCE_LENGTH = 64

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
  customMidiOutChannel: false,
  midiOutChannel: 1,
  instrumentParams: {
    gain: 1,
    synthType: 'triangle',
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
    effectType: EFFECTS[0],
    effectWet: 1,
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
  },
})

export const DEFAULT_PRESET = {
  name: 'New Preset',
  id: uuid(),
  hotkey: null,
  placeholder: false,
  numChannels: 1,
  channelSync: false,
  tempo: 120,
  channels: [BLANK_CHANNEL(0, CHANNEL_COLORS[0], true)],
}

export const DEFAULT_PRESETS =
  '[{"name":"Example: Duet","id":"1d64d73d-d60f-43b7-8758-3de41acee704","hotkey":null,"placeholder":false,"numChannels":2,"channelSync":false,"channels":[{"id":"267851dd-6e1b-46ba-a32a-9e247d0ce91d","color":"#008dff","scribbler":"harp","channelNum":0,"velocity":1,"key":[true,false,true,false,false,false,true,false,false,true,false,true],"keyRate":"4n","keyMovement":"+/-","keyArpInc1":7,"keyArpInc2":-3,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":5,"rangeStart":21,"rangeEnd":46,"seqSteps":[true,true,false,true,true,false,true,true,false,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":12,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.316328125,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"harp","rangeMode":true,"keybdPitches":[21,23,24,26,30,33,35,36,38,42,45],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"portamento":0.0668359375,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":272.3073909436541,"resonance":4.9677734375,"rolloff":-24,"filterAttack":0.28153645833333335,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.1619270833333334,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.08196182250976564,"vibratoDepth":0.1,"vibratoFreq":5,"syncDelayTime":false,"synthType":"fatsawtooth","gain":1}},{"id":"c66c3a67-70d2-4499-9c61-490852c00243","color":"#ff413e","scribbler":"piano","channelNum":1,"velocity":1,"key":[true,false,true,false,false,false,true,false,false,true,false,true],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":5,"rangeStart":30,"rangeEnd":55,"seqSteps":[true,false,false,true,false,false,true,true,false,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":12,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.6473307291666667,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"piano","rangeMode":true,"keybdPitches":[30,33,35,36,38,42,45,47,48,50,54],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.03951822916666666,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":779.9457544766001,"resonance":1.2255859374999987,"rolloff":-24,"filterAttack":0.06291666666666669,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"vibrato","effectWet":0.24494791666666668,"chorusDepth":0.06975381086654674,"chorusDelayTime":4.102691406249999,"chorusFreq":4.694105866969629,"chorusSpread":0,"distortion":1,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"syncDelayTime":false,"synthType":"triangle","gain":1}}],"tempo":120},{"name":"Example: Basic","id":"00560e30-6e92-4b96-addc-a8d4d933fc10","hotkey":null,"placeholder":false,"numChannels":1,"channelSync":false,"channels":[{"id":"3449e18c-ca7b-4460-a58f-22efa2d587c8","color":"#008dff","scribbler":"mallet","channelNum":0,"velocity":1,"key":[true,false,true,false,false,false,true,false,false,true,false,true],"keyRate":"4n","keyMovement":"+/-","keyArpInc1":7,"keyArpInc2":-3,"sustain":0.4919583333333332,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":33,"rangeEnd":58,"seqSteps":[true,true,false,true,true,false,true,true,false,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":12,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"marimba","rangeMode":true,"keybdPitches":[33,35,36,38,42,45,47,48,50,54,57],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1.1199999999999999,"cutoff":1605.5456940339009,"resonance":0,"rolloff":-24,"filterAttack":0.11970052083333334,"filterDecay":0.18154947916666667,"filterSustain":0.5,"filterRelease":2.584375,"filterAmount":1,"samplerAttack":0,"samplerRelease":0.6724306233723958,"effectType":"none","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"syncDelayTime":false,"synthType":"triangle","gain":0.7452430216471353}}],"tempo":120},{"name":"Example: 🎸 E7","id":"4f9d4867-fb1a-4b68-96cb-937688f4d0bc","hotkey":null,"placeholder":false,"numChannels":8,"channelSync":false,"channels":[{"id":"22b90e24-352a-45de-8ba2-ff078c262c31","color":"#33ff00","scribbler":"steady","channelNum":0,"velocity":1,"key":[false,false,true,false,true,false,false,false,false,false,false,true],"keyRate":"8n","keyMovement":"+/-","keyArpInc1":-3,"keyArpInc2":2,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":16,"rangeEnd":31,"seqSteps":[false,false,true,false,false,false,true,false,true,false,false,false,false,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":32,"seqRate":"2n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"harp","rangeMode":true,"keybdPitches":[16,23,26,28],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"gain":1,"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":1639.0261548465467,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"none","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"481afde5-9585-46d2-916e-3fd089013618","color":"#008dff","scribbler":"duet low","channelNum":1,"velocity":1,"key":[false,false,false,false,true,false,true,false,false,true,false,true],"keyRate":"2n.","keyMovement":"+/-","keyArpInc1":3,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":16,"rangeEnd":40,"seqSteps":[true,false,true,false,false,false,false,false,false,false,true,true,false,false,false,false,false,true,false,false,false,true,false,false,false,false,false,false,true,true,false,false],"seqLength":32,"seqRate":"2n","seqMovement":"up/down","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"harp","rangeMode":true,"keybdPitches":[16,18,21,23,28,30,33,35],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"gain":1,"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":2549.7669884041275,"resonance":2.1181640625000004,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"none","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"23690839-ff19-4fb5-965f-5f4350384d02","color":"#ff413e","scribbler":"duet hi","channelNum":2,"velocity":1,"key":[false,false,true,false,true,false,true,false,true,true,false,false],"keyRate":"4n","keyMovement":"+/-","keyArpInc1":3,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":28,"rangeEnd":52,"seqSteps":[true,false,false,false,false,false,true,false,false,false,false,false,true,false,true,false,false,false,true,false,false,false,true,true,false,false,false,false,false,true,false,false],"seqLength":32,"seqRate":"4n.","seqMovement":"up/down","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"harp","rangeMode":true,"keybdPitches":[28,30,32,33,38,40,42,44,45,50],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"gain":0.79890625,"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":1517.2866675740545,"resonance":2.9253906249999995,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"none","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"05bc40b2-69e1-4512-8f41-ea661b7137b8","color":"#EDDB00","scribbler":"dotted","channelNum":3,"velocity":1,"key":[false,false,false,false,true,false,true,false,true,true,false,true],"keyRate":"8n.","keyMovement":"+/-","keyArpInc1":-2,"keyArpInc2":1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":21,"rangeEnd":36,"seqSteps":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,false,false,true,false,false,true,true,false,false,false],"seqLength":32,"seqRate":"2n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"harp","rangeMode":true,"keybdPitches":[21,23,28,30,32,33,35],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"gain":1,"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":1639.0261548465467,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"none","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"02f7b004-3dfb-482f-8b87-9b365868d79a","color":"#00C591","scribbler":"7 + 9","channelNum":4,"velocity":1,"key":[false,false,true,false,false,false,true,false,false,false,false,false],"keyRate":"8n.","keyMovement":"+/-","keyArpInc1":-2,"keyArpInc2":1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":45,"rangeEnd":60,"seqSteps":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,true,false,false,false,false],"seqLength":32,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"harp","rangeMode":true,"keybdPitches":[50,54],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"gain":1,"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":1639.0261548465467,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"none","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"bdf152d2-721b-4401-93b0-58de7b85746e","color":"#ff9700","scribbler":"splat 1","channelNum":5,"velocity":1,"key":[false,false,true,false,true,false,true,false,true,true,false,true],"keyRate":"32n","keyMovement":"+/-","keyArpInc1":5,"keyArpInc2":-7,"sustain":0.9478020833333335,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":56,"rangeEnd":75,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":32,"seqRate":"4n","seqMovement":"random","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"piano","rangeMode":true,"keybdPitches":[56,57,59,62,64,66,68,69,71,74],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"gain":0.854765625,"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.5146223958333332,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":3.1922916666666667,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"a1b21a56-8dc2-4284-a088-848d23219ec9","color":"#a825f4","scribbler":"splat 2","channelNum":6,"velocity":1,"key":[false,false,true,false,false,false,true,false,true,true,false,false],"keyRate":"16t","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.9478020833333335,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":64,"rangeEnd":90,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":32,"seqRate":"4n","seqMovement":"random","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"piano","rangeMode":true,"keybdPitches":[66,68,69,74,78,80,81,86],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"gain":0.6749609375000002,"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.5458072916666669,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":3.281614583333333,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"d6fa6ec7-1908-42a6-8f47-c55972b942c9","color":"#ff00ff","scribbler":"Low E","channelNum":7,"velocity":1,"key":[false,false,false,false,true,false,false,false,false,false,false,false],"keyRate":"4n","keyMovement":"+/-","keyArpInc1":5,"keyArpInc2":-2,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":4,"rangeEnd":5,"seqSteps":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false],"seqLength":32,"seqRate":"4n","seqMovement":"up/down","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"bass","rangeMode":false,"keybdPitches":[4],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"gain":1,"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":1517.2866675740545,"resonance":2.9253906249999995,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.6639713541666666,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5}}],"tempo":157},{"name":"Example: 🚶🏻‍♂️ Strolling","id":"d72a1b5b-73c2-47e4-a606-2df597ca9669","hotkey":null,"placeholder":false,"numChannels":8,"channelSync":false,"channels":[{"id":"9f592f20-3aef-4be7-b8b0-1ecf10ad1f1a","color":"#008dff","scribbler":"Hihat","channelNum":0,"velocity":0.4409722222222222,"key":[false,false,false,false,false,false,false,false,false,true,false,false],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":9,"rangeEnd":10,"seqSteps":[false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":2,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[9],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":0.16727864583333335,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.4418359375,"delayFeedback":0,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"gain":0.7662152099609375}},{"id":"516b9b90-7dea-4c57-a094-6d316837ce7c","color":"#33ff00","scribbler":"Kick","channelNum":1,"velocity":1,"key":[false,true,false,false,false,false,false,false,false,false,false,false],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":1,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":1,"rangeEnd":2,"seqSteps":[true,false,false,false,false,false,false,true,false,false,false,true,false,false,false,false,false,false,true,false,true,false,false,false,false,false,false,false,false,false,false,false],"seqLength":26,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.6688671875000001,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[1],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.12888020833333336,"chorusDepth":1,"chorusDelayTime":6.203453125,"chorusFreq":1.4832396018692204,"chorusSpread":38.93203125,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":0.5825520833333333,"reverbPreDelay":0,"vibratoDepth":0.1,"vibratoFreq":5,"gain":0.6863539123535156}},{"id":"e5f83779-a063-4231-bf2d-8bbd4104533e","color":"#ff413e","scribbler":"snare/hat","channelNum":2,"velocity":1,"key":[false,false,false,false,false,true,false,false,false,false,false,true],"keyRate":"4n","keyMovement":"down","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":5,"rangeEnd":12,"seqSteps":[false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,true,false],"seqLength":32,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.7072135416666667,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[11,5],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":0.07832031250000004,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.28518229166666664,"delayFeedback":0.21890625000000002,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"gain":0.7708853149414062}},{"id":"eadb04ca-ae06-4c52-8029-73826f5e2504","color":"#ff00ff","scribbler":"bass","channelNum":3,"velocity":1,"key":[false,true,false,true,false,true,true,false,true,false,false,true],"keyRate":"2n","keyMovement":"+/-","keyArpInc1":3,"keyArpInc2":-1,"sustain":0.39571191406250006,"keySwing":0.6634635416666667,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":11,"rangeStart":6,"rangeEnd":26,"seqSteps":[true,false,false,false,false,false,false,true,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":18,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.7343880208333334,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"bass","rangeMode":true,"keybdPitches":[6,8,11,13,15,17,18,20,23,25],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":0.7687288411458333,"effectType":"chorus","effectWet":0.39156229654947894,"chorusDepth":0.30180533651894864,"chorusDelayTime":0.8252265625,"chorusFreq":1.0682531886159814,"chorusSpread":94.55859375000001,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"gain":0.7317533365885415}},{"id":"0b4feec9-e837-48e8-8327-483fbbde24fb","color":"#ff9700","scribbler":"Vibes lo","channelNum":4,"velocity":0.6448567708333333,"key":[false,true,false,true,false,true,true,false,true,false,false,true],"keyRate":"8n","keyMovement":"+/-","keyArpInc1":4,"keyArpInc2":-1,"sustain":1,"keySwing":0.6648307291666666,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":11,"rangeStart":24,"rangeEnd":48,"seqSteps":[false,false,false,false,false,false,true,true,false,false,false,true,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":18,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.6977734375,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"vibes","rangeMode":true,"keybdPitches":[25,27,29,30,32,35,37,39,41,42,44,47],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.2982552083333333,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":3.18796875,"reverbPreDelay":0.14455078125,"vibratoDepth":0.10884114583333335,"vibratoFreq":5.509441758082442,"gain":0.877326405843099}},{"id":"6aab6ca3-568f-4f27-a997-a18f89320bf4","color":"#00C591","scribbler":"vibes hi","channelNum":5,"velocity":0.5987413194444444,"key":[false,true,false,true,false,true,true,false,true,false,false,true],"keyRate":"2n","keyMovement":"up/down","keyArpInc1":2,"keyArpInc2":-1,"sustain":1,"keySwing":0.6634635416666667,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":11,"rangeStart":34,"rangeEnd":56,"seqSteps":[true,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":22,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.6865104166666667,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"vibes","rangeMode":true,"keybdPitches":[35,37,39,41,42,44,47,49,51,53,54],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.5003645833333336,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":2.6050520833333333,"reverbPreDelay":0.08614583333333334,"vibratoDepth":0.2452734375,"vibratoFreq":1.0035336510548096,"gain":0.8725694783528646}},{"id":"23ea6dfc-738d-4d88-ab11-6576170301f8","color":"#EDDB00","scribbler":"Marimba","channelNum":6,"velocity":0.5951249864366319,"key":[false,true,false,true,false,true,true,false,true,false,false,true],"keyRate":"2n","keyMovement":"+/-","keyArpInc1":5,"keyArpInc2":-2,"sustain":0.5062500000000001,"keySwing":0.6630598958333334,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":11,"rangeStart":58,"rangeEnd":74,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,false,true,false,false,false,false,false],"seqLength":32,"seqRate":"8n.","seqMovement":"up/down","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.707265625,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"marimba","rangeMode":true,"keybdPitches":[59,61,63,65,66,68,71,73],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"amsquare","portamento":0.04109375,"modulationType":"sawtooth","harmonicity":0,"fatSpread":16.449609375,"fatCount":2,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.007434895833333344,"envDecay":0.9509765625,"envSustain":0.8373697916666666,"envRelease":3.902708333333333,"cutoff":699.7974462208238,"resonance":2.8822265624999988,"rolloff":-48,"filterAttack":0,"filterDecay":0.42570312499999996,"filterSustain":0.5161718750000001,"filterRelease":2.3348958333333334,"filterAmount":1.682291666666667,"samplerAttack":0.07052388509114582,"samplerRelease":1,"effectType":"delay","effectWet":0.42286458333333327,"chorusDepth":0.08309040346707743,"chorusDelayTime":0.7471328125000003,"chorusFreq":1.4851229187392283,"chorusSpread":81.92812500000001,"distortion":2.5123046875000004,"syncDelayTime":false,"delayTime":0.8934635416666666,"delayFeedback":0.6244791666666666,"reverbDecay":4,"reverbPreDelay":0.08001302083333334,"vibratoDepth":0.1,"vibratoFreq":5,"gain":0.8883158365885417}},{"id":"2a5d46b3-9b45-45a9-9034-ebc55bf0d9df","color":"#a825f4","scribbler":"Melodica","channelNum":7,"velocity":0.32259114583333337,"key":[false,true,false,true,false,true,true,false,true,false,false,true],"keyRate":"4n.","keyMovement":"random","keyArpInc1":4,"keyArpInc2":-1,"sustain":1,"keySwing":0.6770182291666665,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":11,"rangeStart":42,"rangeEnd":51,"seqSteps":[false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,true,true,false,false,false,true,false,false,false,false],"seqLength":31,"seqRate":"2t","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.7639713541666666,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[42,44,47,49],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"fatsquare","portamento":0,"modulationType":"sine","harmonicity":1,"fatSpread":33.58984375,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.3289713541666667,"envDecay":0.334765625,"envSustain":1,"envRelease":0.9683333333333337,"cutoff":1255.3564780579138,"resonance":0.5089843750000004,"rolloff":-24,"filterAttack":0,"filterDecay":0.28122395833333336,"filterSustain":1,"filterRelease":4,"filterAmount":1.7586458333333335,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":0.5760937500000001,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.32283854166666665,"delayFeedback":0.7098828125,"reverbDecay":2.7863541666666665,"reverbPreDelay":0.09192057291666667,"vibratoDepth":0.1,"vibratoFreq":5,"gain":0.8532984924316406}}],"tempo":135},{"name":"Example: 😎 Jazz","id":"7549b689-b681-4b2e-8b86-0247c1d8030b","hotkey":null,"placeholder":false,"numChannels":8,"channelSync":false,"channels":[{"id":"ec7b9ee1-1910-4fcf-8459-7057e68c5c43","color":"#008dff","scribbler":"hi-hat","channelNum":0,"velocity":0.479420731707317,"key":[false,false,false,false,false,false,false,false,false,true,false,false],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":9,"rangeEnd":10,"seqSteps":[false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":2,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[9],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":0.1846354166666667,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.3415234375,"delayFeedback":0,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"gain":1}},{"id":"31eae4ea-0343-410a-acc9-f5d175febc3b","color":"#EDDB00","scribbler":"Rimshot","channelNum":1,"velocity":0.4423589939024389,"key":[false,false,true,false,false,false,false,false,false,false,false,false],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":2,"rangeEnd":3,"seqSteps":[false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":8,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[2],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.40302083333333344,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.3415234375,"delayFeedback":0,"reverbDecay":1.5,"reverbPreDelay":0.07111328125,"vibratoDepth":0.1,"vibratoFreq":5,"gain":1}},{"id":"fe0e5041-1f4d-4233-916a-7e2bf97160d7","color":"#ff413e","scribbler":"ride","channelNum":2,"velocity":0.479420731707317,"key":[true,false,false,false,false,false,false,false,false,false,false,false],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":24,"rangeEnd":25,"seqSteps":[true,false,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":4,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.6881901041666667,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[24],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.5255989583333334,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":2.53140625,"reverbPreDelay":0,"vibratoDepth":0.1,"vibratoFreq":5,"gain":1}},{"id":"b70e1c5b-2057-495f-884a-03a4450f228b","color":"#00C591","scribbler":"Drums","channelNum":3,"velocity":0.6098513719512192,"key":[true,true,false,true,false,true,true,true,false,false,false,true],"keyRate":"8n","keyMovement":"random","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.6662760416666667,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":0,"rangeEnd":16,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":13,"seqRate":"8n","seqMovement":"random","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.7126432291666667,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[0,11,12,13,15,5,6,7],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.6336328125,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":3.5733333333333333,"reverbPreDelay":0,"vibratoDepth":0.1,"vibratoFreq":5,"gain":1}},{"id":"460fb99f-cf47-484c-84fa-b4ed4af39cc0","color":"#33ff00","scribbler":"bass","channelNum":4,"velocity":0.5971798780487808,"key":[true,false,true,false,true,true,false,true,true,false,true,true],"keyRate":"4n","keyMovement":"+/-","keyArpInc1":7,"keyArpInc2":3,"sustain":0.28347916666666667,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":0,"rangeEnd":26,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":2,"seqRate":"4n","seqMovement":"up/down","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.6878125,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"bass","rangeMode":true,"keybdPitches":[0,2,4,5,7,8,10,11,12,14,16,17,19,20,22,23,24],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":0.5230205281575522,"effectType":"none","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"gain":1}},{"id":"c5b2b49b-bc91-43e1-8721-c94589c5d00d","color":"#ff00ff","scribbler":"piano","channelNum":5,"velocity":0.6391006097560972,"key":[true,false,true,false,true,true,false,true,true,false,true,true],"keyRate":"8n","keyMovement":"+/-","keyArpInc1":-7,"keyArpInc2":3,"sustain":0.28347916666666667,"keySwing":0.7093229166666667,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":18,"rangeEnd":53,"seqSteps":[false,true,false,false,false,false,false,false,false,false,false,true,true,false,true,true,false,false,false,false,false,false,false,true,true,false,true,false,false,false,true,false],"seqLength":32,"seqRate":"8n","seqMovement":"up/down","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.6779296875,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"piano","rangeMode":true,"keybdPitches":[19,20,22,23,24,26,28,29,31,32,34,35,36,38,40,41,43,44,46,47,48,50,52],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":0.029427083333333326,"effectType":"reverb","effectWet":0.31921874999999994,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":2.649010416666667,"reverbPreDelay":0.18725260416666667,"vibratoDepth":0.1,"vibratoFreq":5,"gain":1}},{"id":"e3654938-6128-49bd-826c-83cb1a4d1f67","color":"#ff9700","scribbler":"vibes","channelNum":6,"velocity":0.548685213414634,"key":[true,false,true,false,true,true,false,true,true,false,true,true],"keyRate":"2n.","keyMovement":"+/-","keyArpInc1":-1,"keyArpInc2":8,"sustain":1,"keySwing":0.9284505208333331,"keySwingLength":3,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":53,"rangeEnd":71,"seqSteps":[false,false,false,true,true,false,true,false,false,true,false,false,true,false,false,true,false,false,true,true,false,false,false,false,false,false,false,false,false,true,true,true],"seqLength":32,"seqRate":"1m","seqMovement":"up/down","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"vibes","rangeMode":true,"keybdPitches":[53,55,56,58,59,60,62,64,65,67,68,70],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"chorus","effectWet":1,"chorusDepth":0.15526835305009887,"chorusDelayTime":6.9078203125,"chorusFreq":1.018132973074793,"chorusSpread":180,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.6656640625,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.4430729166666666,"vibratoFreq":3.103310808543857,"gain":1}},{"id":"941fd373-b23d-4cdb-aa88-c7543ab9bdf1","color":"#a825f4","scribbler":"harp sweep","channelNum":7,"velocity":0.2135099085365852,"key":[true,false,true,false,true,true,false,true,true,false,true,true],"keyRate":"32n","keyMovement":"down","keyArpInc1":3,"keyArpInc2":7,"sustain":1,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":14,"rangeEnd":85,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":32,"seqRate":"1m","seqMovement":"up/down","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"harp","rangeMode":true,"keybdPitches":[14,16,17,19,20,22,23,24,26,28,29,31,32,34,35,36,38,40,41,43,44,46,47,48,50,52,53,55,56,58,59,60,62,64,65,67,68,70,71,72,74,76,77,79,80,82,83,84],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0.090234375,"samplerRelease":1,"effectType":"delay","effectWet":0.3863020833333335,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.3010677083333333,"delayFeedback":0.7575260416666667,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.17166666666666663,"vibratoFreq":3.103310808543857,"gain":1}}],"tempo":117},{"name":"Example: 👽 House","id":"45aefcd1-5ed3-447f-9c37-c48d97c0b050","hotkey":null,"placeholder":false,"numChannels":8,"channelSync":false,"channels":[{"id":"d71423e3-5137-47c5-ab8e-f15c82faed95","color":"#008dff","scribbler":"kick","channelNum":0,"velocity":0.8005907012195123,"key":[false,false,false,false,true,false,false,false,false,false,false,false],"keyRate":"8n","keyMovement":"down","keyArpInc1":-1,"keyArpInc2":2,"sustain":0.5906354166666667,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":40,"rangeEnd":41,"seqSteps":[true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,true],"seqLength":32,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drum-machine","rangeMode":false,"keybdPitches":[40],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":0,"effectType":"distortion","effectWet":0.23195312499999998,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.3838020833333333,"delayFeedback":0.11864583333333334,"reverbDecay":3.2395312499999998,"reverbPreDelay":0.23819010416666667,"vibratoDepth":0.9375781249999999,"vibratoFreq":12.856352337016906,"gain":0.6806380208333336}},{"id":"bcf6c48a-27ea-4831-bbaa-06e19cf7d625","color":"#EDDB00","scribbler":"hi-hat","channelNum":1,"velocity":0.47599085365853716,"key":[false,false,false,false,false,false,false,false,false,false,true,true],"keyRate":"1m","keyMovement":"up","keyArpInc1":-1,"keyArpInc2":2,"sustain":0.5906354166666667,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":46,"rangeEnd":48,"seqSteps":[false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":2,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drum-machine","rangeMode":false,"keybdPitches":[46,47],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":0,"effectType":"delay","effectWet":0.18359374999999997,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":true,"delayTime":0.375,"delayFeedback":0.581875,"reverbDecay":3.2395312499999998,"reverbPreDelay":0.23819010416666667,"vibratoDepth":0.9375781249999999,"vibratoFreq":12.856352337016906,"gain":0.6040625}},{"id":"b9b6203b-218e-4455-84ec-0d98a61c65e5","color":"#33ff00","scribbler":"percussion","channelNum":2,"velocity":0.5768864329268298,"key":[true,false,false,false,false,false,false,false,true,false,false,true],"keyRate":"1m","keyMovement":"down","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.5906354166666667,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":20,"rangeEnd":61,"seqSteps":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false],"seqLength":32,"seqRate":"16n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drum-machine","rangeMode":false,"keybdPitches":[20,32,47,60],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":0,"effectType":"reverb","effectWet":0.3517838541666667,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":true,"delayTime":0.375,"delayFeedback":0.13713541666666668,"reverbDecay":3.2395312499999998,"reverbPreDelay":0.23819010416666667,"vibratoDepth":0.9375781249999999,"vibratoFreq":12.856352337016906,"gain":0.6587890625000001}},{"id":"f009b973-8842-447e-a399-1cda8328ef0b","color":"#ff9700","scribbler":"bass","channelNum":3,"velocity":0.44226371951219523,"key":[false,true,false,true,true,false,true,false,true,false,true,true],"keyRate":"4n","keyMovement":"+/-","keyArpInc1":4,"keyArpInc2":-1,"sustain":0.5906354166666667,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":20,"rangeEnd":33,"seqSteps":[false,false,false,false,false,false,false,false,true,false,false,false,true,false,false,false,true,false,true,false,false,false,false,false,true,false,false,false,true,false,false,false],"seqLength":32,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[20,22,23,25,27,28,30,32],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"fmsquare","portamento":0.0675390625,"modulationType":"square","harmonicity":1,"fatSpread":36.8984375,"fatCount":3,"pulseWidth":0.2,"pwmFreq":1.11605078125,"envAttack":0.0689453125,"envDecay":0.43845052083333336,"envSustain":0.17725260416666672,"envRelease":0.38218750000000007,"cutoff":110.36114912746253,"resonance":0.5083984374999999,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":0.8315625,"filterAmount":3,"samplerAttack":0,"samplerRelease":0,"effectType":"delay","effectWet":0.6828645833333334,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":180,"distortion":1,"syncDelayTime":true,"delayTime":0.375,"delayFeedback":0.5700390625,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.9375781249999999,"vibratoFreq":12.856352337016906,"gain":1}},{"id":"b0767957-6222-43b7-be9e-6214cc756e9a","color":"#00C591","scribbler":"stab","channelNum":4,"velocity":0.44388338414634126,"key":[false,false,false,true,false,false,false,false,true,false,false,false],"keyRate":"4n","keyMovement":"up","keyArpInc1":4,"keyArpInc2":-1,"sustain":0.5906354166666667,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":20,"rangeEnd":28,"seqSteps":[true,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":32,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"synth","rangeMode":false,"keybdPitches":[20,27],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"fmsquare","portamento":0.0675390625,"modulationType":"square","harmonicity":1,"fatSpread":36.8984375,"fatCount":3,"pulseWidth":0.2,"pwmFreq":1.11605078125,"envAttack":0.0689453125,"envDecay":0.43845052083333336,"envSustain":0.17725260416666672,"envRelease":0.38218750000000007,"cutoff":5000,"resonance":0.5083984374999999,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":0.8315625,"filterAmount":3,"samplerAttack":0,"samplerRelease":0,"effectType":"delay","effectWet":0.6828645833333334,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":180,"distortion":1,"syncDelayTime":true,"delayTime":0.375,"delayFeedback":0.6102083333333334,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.9375781249999999,"vibratoFreq":12.856352337016906,"gain":1}},{"id":"fcb08502-da5e-4b98-b8a5-55c03ba97216","color":"#ff413e","scribbler":"chord 1","channelNum":5,"velocity":1,"key":[false,true,false,true,true,false,true,false,true,false,true,true],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":3,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":-3,"axis":0,"rangeStart":38,"rangeEnd":50,"seqSteps":[false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":2,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[39,40,42,44,46,47,49],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"fmtriangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.35282552083333335,"envDecay":0.055546875,"envSustain":0.01808593749999994,"envRelease":0.7162499999999997,"cutoff":205.31879124363573,"resonance":3.340820312500001,"rolloff":-24,"filterAttack":0.05841145833333333,"filterDecay":0.40903645833333335,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.8684375,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":2.0952083333333333,"reverbPreDelay":0.08643880208333332,"vibratoDepth":0.1,"vibratoFreq":5,"gain":1}},{"id":"d39f4983-2638-46ab-8b95-209be9ff5269","color":"#a825f4","scribbler":"chord 2","channelNum":6,"velocity":1,"key":[false,true,false,true,true,false,true,false,true,false,true,true],"keyRate":"4n","keyMovement":"+/-","keyArpInc1":5,"keyArpInc2":-3,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":-3,"axis":0,"rangeStart":38,"rangeEnd":50,"seqSteps":[false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":2,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[39,40,42,44,46,47,49],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"fmtriangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.35282552083333335,"envDecay":0.055546875,"envSustain":0.01808593749999994,"envRelease":0.7162499999999997,"cutoff":203.25692495885627,"resonance":3.340820312500001,"rolloff":-24,"filterAttack":0.05841145833333333,"filterDecay":0.40903645833333335,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.8717057291666667,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":2.0952083333333333,"reverbPreDelay":0.08643880208333332,"vibratoDepth":0.1,"vibratoFreq":5,"gain":1}},{"id":"51c4c21b-c2c4-4556-a803-8ad4147b216d","color":"#ff00ff","scribbler":"flutter","channelNum":7,"velocity":0.22075076219512185,"key":[false,true,false,true,true,false,true,false,true,false,true,true],"keyRate":"16n","keyMovement":"+/-","keyArpInc1":1,"keyArpInc2":4,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":-3,"axis":0,"rangeStart":48,"rangeEnd":72,"seqSteps":[false,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":4,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[49,51,52,54,56,58,59,61,63,64,66,68,70,71],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"fmsquare","portamento":0.024218750000000004,"modulationType":"triangle","harmonicity":1.4925,"fatSpread":20,"fatCount":4,"pulseWidth":-0.42546875,"pwmFreq":0.4,"envAttack":0.1396484375,"envDecay":0.09746093749999998,"envSustain":0.3041666666666666,"envRelease":2.7975,"cutoff":614.5727131386784,"resonance":3.7390625,"rolloff":-12,"filterAttack":0.06511718749999999,"filterDecay":0.051588541666666654,"filterSustain":0,"filterRelease":1.0520833333333335,"filterAmount":2.1681250000000007,"samplerAttack":0.034830729166666664,"samplerRelease":0,"effectType":"delay","effectWet":0.7988671875000001,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.30276041666666664,"reverbDecay":2.0952083333333333,"reverbPreDelay":0.08643880208333332,"vibratoDepth":0.1,"vibratoFreq":5,"gain":0.47813802083333345}}],"tempo":120},{"name":"Example: 🫧 Leola’s chimes","id":"a2c3d2ef-dbe3-43a8-8236-5e7c1c2e24e3","hotkey":null,"placeholder":false,"numChannels":7,"channelSync":false,"channels":[{"id":"a90252e4-9183-4795-a36c-b80a5af3dbeb","color":"#ff9700","scribbler":"skins","channelNum":0,"velocity":1,"key":[false,true,true,false,false,false,false,true,false,true,false,false],"keyRate":"4t","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":-1,"axis":8,"rangeStart":43,"rangeEnd":51,"seqSteps":[false,true,true,true,false,false,false,true,true,true,true,false,true,true,true,true,true,false,false,true,true,true,true,false,false,false,false,false,false,false,false,false],"seqLength":23,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"vibes","rangeMode":false,"keybdPitches":[43,45,49,50],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"gain":0.16108072916666666,"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":0.14641927083333334,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":0,"syncDelayTime":true,"delayTime":0.4411764705882353,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"48036e47-2771-4cea-8744-58e9a1f2cec7","color":"#ff00ff","scribbler":"season 1","channelNum":1,"velocity":1,"key":[false,true,true,false,false,false,false,true,false,true,false,false],"keyRate":"4t","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":-1,"axis":8,"rangeStart":43,"rangeEnd":51,"seqSteps":[false,true,true,true,false,false,false,true,true,true,true,false,true,true,true,true,true,false,false,true,true,true,true,false,false,false,false,false,false,false,false,false],"seqLength":23,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"synth","rangeMode":false,"keybdPitches":[43,45,49,50],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"gain":0.14885416666666668,"synthType":"amsine","portamento":0.13069010416666668,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":105.56524514888193,"resonance":2.0369140625,"rolloff":-24,"filterAttack":0.11980468750000003,"filterDecay":0.2,"filterSustain":0.8539322916666667,"filterRelease":3.2152083333333334,"filterAmount":3.06765625,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.8210546875,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":0,"syncDelayTime":true,"delayTime":0.4411764705882353,"delayFeedback":0.5,"reverbDecay":3.2847916666666666,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"ea84658d-b57e-41e8-9ab9-bb2c453dda02","color":"#008dff","scribbler":"Cassie","channelNum":2,"velocity":1,"key":[false,false,true,false,false,false,false,false,false,false,false,true],"keyRate":"4t","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":-1,"axis":8,"rangeStart":23,"rangeEnd":51,"seqSteps":[true,true,true,true,false,false,true,true,true,true,true,true,true,true,true,true,true,false,false,false,true,true,true,false,false,false,false,false,false,false,false,false],"seqLength":23,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"vibes","rangeMode":false,"keybdPitches":[23,26,47,50],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"gain":0.1281510416666667,"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":0.3092317708333333,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":0,"syncDelayTime":true,"delayTime":0.4411764705882353,"delayFeedback":0.19838541666666668,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"6606d72e-35c0-4406-a227-f3f8d2311b05","color":"#a825f4","scribbler":"Sid","channelNum":3,"velocity":1,"key":[false,false,true,false,false,false,false,false,false,false,false,true],"keyRate":"4t","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":-1,"axis":8,"rangeStart":23,"rangeEnd":51,"seqSteps":[true,true,true,true,false,false,true,true,true,true,true,true,true,true,true,true,true,false,false,false,true,true,true,false,false,false,false,false,false,false,false,false],"seqLength":23,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"synth","rangeMode":false,"keybdPitches":[23,26,47,50],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"gain":0.0974088541666667,"synthType":"sine","portamento":0.10532552083333335,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":83.89836181735325,"resonance":2.8607421875,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.11623697916666667,"filterSustain":0.9439062500000001,"filterRelease":2.596197916666666,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.8831510416666667,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":0,"syncDelayTime":true,"delayTime":0.4411764705882353,"delayFeedback":0.5,"reverbDecay":2.96984375,"reverbPreDelay":0,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"7b5514a7-6754-49ed-a016-c471b9d35499","color":"#ff413e","scribbler":"michelle","channelNum":4,"velocity":1,"key":[false,false,false,false,true,false,true,false,false,false,false,false],"keyRate":"4t","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":-1,"axis":8,"rangeStart":52,"rangeEnd":67,"seqSteps":[true,true,true,false,true,true,true,false,false,false,false,true,true,true,false,false,false,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":23,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"vibes","rangeMode":false,"keybdPitches":[52,54,64,66],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"gain":0.16108072916666666,"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":0.14942708333333332,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":0,"syncDelayTime":true,"delayTime":0.4411764705882353,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"ea1e3070-e90e-4cf2-afae-8d87270f0186","color":"#00C591","scribbler":"Tony","channelNum":5,"velocity":1,"key":[false,false,false,false,true,false,true,false,false,false,false,false],"keyRate":"4t","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":-1,"axis":8,"rangeStart":52,"rangeEnd":67,"seqSteps":[false,false,false,false,false,false,false,false,false,false,false,true,true,true,false,false,false,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":23,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"synth","rangeMode":false,"keybdPitches":[52,54,64,66],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"gain":0.11674479166666664,"synthType":"sine","portamento":0.08796874999999998,"modulationType":"sawtooth","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":163.06744447811383,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.8054036458333333,"filterRelease":2.647291666666667,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":0,"syncDelayTime":true,"delayTime":0.4411764705882353,"delayFeedback":0.5,"reverbDecay":4,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"751737ba-0ca6-4a1b-96b1-18598363ff83","color":"#33ff00","scribbler":"wee","channelNum":6,"velocity":1,"key":[false,false,true,false,false,false,false,false,false,false,false,true],"keyRate":"4t","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":-1,"axis":8,"rangeStart":14,"rangeEnd":48,"seqSteps":[true,true,true,false,true,true,true,false,false,false,false,true,true,true,false,false,false,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":23,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"synth","rangeMode":false,"keybdPitches":[14,23,38,47],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"gain":0.2780338541666666,"synthType":"sine","portamento":0.5093229166666666,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":4,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":0.21498697916666668,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":0,"syncDelayTime":true,"delayTime":0.22058823529411764,"delayFeedback":0.6299479166666668,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5}}],"tempo":136},{"name":"Example: 🪁 Rising","id":"35704f58-c478-4c89-8e19-4bb24d0b1d22","hotkey":null,"placeholder":false,"numChannels":8,"channelSync":false,"channels":[{"id":"cefe887f-b4e8-4aa0-a8c2-42d10f76af13","color":"#008dff","scribbler":"Blue","channelNum":0,"velocity":0.4835069444444444,"key":[false,true,true,false,true,false,true,false,true,true,false,true],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":5,"axis":1,"rangeStart":36,"rangeEnd":48,"seqSteps":[false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":2,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[37,38,40,42,44,45,47],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":269.53473659822055,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":1.2615625000000001,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":true,"delayTime":0.39999999999999997,"delayFeedback":0.22687499999999997,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"gain":0.8524479166666666}},{"id":"36e9740f-0152-43e8-80d6-49ced39b3c21","color":"#ff413e","scribbler":"red","channelNum":1,"velocity":0.47927517361111116,"key":[false,true,true,false,true,false,true,false,true,true,false,true],"keyRate":"4t","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":5,"axis":1,"rangeStart":24,"rangeEnd":48,"seqSteps":[false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":4,"seqRate":"2n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[25,26,28,30,32,33,35,37,38,40,42,44,45,47],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":269.53473659822055,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":1.2615625000000001,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":true,"delayTime":0.15,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"gain":0.8629685974121093}},{"id":"198d348b-0712-4470-a077-f6bc668f5481","color":"#33ff00","scribbler":"green","channelNum":2,"velocity":0.47927517361111116,"key":[false,true,true,false,true,false,true,false,true,true,false,true],"keyRate":"8t","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":5,"axis":1,"rangeStart":24,"rangeEnd":60,"seqSteps":[false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":6,"seqRate":"2n.","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[25,26,28,30,32,33,35,37,38,40,42,44,45,47,49,50,52,54,56,57,59],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":269.53473659822055,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":1.2615625000000001,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":true,"delayTime":0.049999999999999996,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"gain":0.8580033365885418}},{"id":"5bdbc6be-b847-43f3-b4eb-9b46bc0e6722","color":"#ff00ff","scribbler":"pink","channelNum":3,"velocity":0.47927517361111116,"key":[false,true,true,false,true,false,true,false,true,true,false,true],"keyRate":"16n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":5,"axis":1,"rangeStart":35,"rangeEnd":70,"seqSteps":[false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":8,"seqRate":"1n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[35,37,38,40,42,44,45,47,49,50,52,54,56,57,59,61,62,64,66,68,69],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":269.53473659822055,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":1.2615625000000001,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":true,"delayTime":0.6,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"gain":0.8396353658040364}},{"id":"2ff1a570-4f10-4899-b680-72bf28ac1005","color":"#ff9700","scribbler":"gold","channelNum":4,"velocity":0.47927517361111116,"key":[false,true,true,false,true,false,true,false,true,true,false,true],"keyRate":"16t","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":5,"axis":1,"rangeStart":17,"rangeEnd":65,"seqSteps":[false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":12,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[18,20,21,23,25,26,28,30,32,33,35,37,38,40,42,44,45,47,49,50,52,54,56,57,59,61,62,64],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":269.53473659822055,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":1.2615625000000001,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":true,"delayTime":0.09999999999999999,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"gain":0.8668747965494792}},{"id":"39039002-b293-4b23-9b51-83f6c6979622","color":"#a825f4","scribbler":"purple","channelNum":5,"velocity":0.47927517361111116,"key":[false,true,true,false,true,false,true,false,true,true,false,true],"keyRate":"32n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":5,"axis":1,"rangeStart":17,"rangeEnd":41,"seqSteps":[false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":12,"seqRate":"8t","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[18,20,21,23,25,26,28,30,32,33,35,37,38,40],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":269.53473659822055,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":1.2615625000000001,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":true,"delayTime":0.22499999999999998,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"gain":0.8270485432942709}},{"id":"e75764ac-b829-45a9-bb44-b4052c63040a","color":"#00C591","scribbler":"teal","channelNum":6,"velocity":0.3344184027777778,"key":[false,true,true,false,true,false,true,false,true,true,false,true],"keyRate":"32n.","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":5,"axis":1,"rangeStart":55,"rangeEnd":70,"seqSteps":[false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":10,"seqRate":"2t","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[56,57,59,61,62,64,66,68,69],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":456.101630985771,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":1.2615625000000001,"samplerAttack":0,"samplerRelease":1,"effectType":"none","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"gain":0.8903469340006511}},{"id":"84927d95-2a42-4773-a325-9c4d2deeadcc","color":"#EDDB00","scribbler":"yellow","channelNum":7,"velocity":0.3344184027777778,"key":[false,true,true,false,true,false,true,false,true,true,false,true],"keyRate":"32t","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":5,"axis":1,"rangeStart":39,"rangeEnd":59,"seqSteps":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false],"seqLength":24,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[40,42,44,45,47,49,50,52,54,56,57],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":456.101630985771,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":1.2615625000000001,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":true,"delayTime":0.11249999999999999,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"gain":0.8450519307454427}}],"tempo":100},{"name":"Example: 👄 Voices","id":"712d8f52-ce34-4a86-af0f-8fbdbe86c414","hotkey":null,"placeholder":false,"numChannels":4,"channelSync":false,"channels":[{"id":"9b81bfbf-3a84-48fa-b7cd-5b4b4ece43f0","color":"#008dff","scribbler":"low","channelNum":0,"velocity":0.7123666158536587,"key":[true,false,false,true,false,true,false,false,true,true,true,false],"keyRate":"2n","keyMovement":"random","keyArpInc1":6,"keyArpInc2":-2,"sustain":1,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":2,"rangeEnd":20,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":5,"seqRate":"1m","seqMovement":"random","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"choral","rangeMode":true,"keybdPitches":[3,5,8,9,10,12,15,17],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"distortion","effectWet":0.14925781250000003,"chorusDepth":0.4447129814807687,"chorusDelayTime":2.5,"chorusFreq":1,"chorusSpread":131.184375,"distortion":0.359765625,"syncDelayTime":false,"delayTime":0.3383458646616541,"delayFeedback":0.8349609375000001,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"gain":0.7024739583333333}},{"id":"e1dd6bac-62cb-4c44-8d21-b59bf48dcff9","color":"#ff413e","scribbler":"wobbly","channelNum":1,"velocity":0.49752286585365874,"key":[true,false,false,true,false,true,false,false,true,true,true,false],"keyRate":"2n","keyMovement":"random","keyArpInc1":6,"keyArpInc2":-2,"sustain":1,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":20,"rangeEnd":39,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":5,"seqRate":"1m","seqMovement":"random","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"choral","rangeMode":true,"keybdPitches":[20,21,22,24,27,29,32,33,34,36],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0.3030598958333333,"samplerRelease":1,"effectType":"vibrato","effectWet":0.8949479166666666,"chorusDepth":1,"chorusDelayTime":0.1,"chorusFreq":1.02151372879297,"chorusSpread":180,"distortion":1,"syncDelayTime":false,"delayTime":0.3383458646616541,"delayFeedback":0.8358463541666667,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.9503515625,"vibratoFreq":1,"gain":0.7069270833333333}},{"id":"3dd2ad3a-aec6-4751-96ec-40a5412a027a","color":"#33ff00","scribbler":"mid","channelNum":2,"velocity":0.49752286585365874,"key":[true,false,false,true,false,true,false,false,true,true,true,false],"keyRate":"2n","keyMovement":"random","keyArpInc1":6,"keyArpInc2":-2,"sustain":1,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":39,"rangeEnd":54,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":5,"seqRate":"1m","seqMovement":"random","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"choral","rangeMode":true,"keybdPitches":[39,41,44,45,46,48,51,53],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":0.9073307291666666,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.2536583646616541,"delayFeedback":0.71125,"reverbDecay":1.5,"reverbPreDelay":0.32076171875000004,"vibratoDepth":0.1,"vibratoFreq":5,"gain":0.6892057291666667}},{"id":"d1f1829f-aec1-4001-b14b-79ec729f7698","color":"#ff00ff","scribbler":"high","channelNum":3,"velocity":0.49752286585365874,"key":[true,false,false,true,false,true,false,false,true,true,true,false],"keyRate":"2n","keyMovement":"random","keyArpInc1":6,"keyArpInc2":-2,"sustain":1,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":54,"rangeEnd":86,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":5,"seqRate":"1m","seqMovement":"random","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"choral","rangeMode":true,"keybdPitches":[56,57,58,60,63,65,68,69,70,72,75,77,80,81,82,84],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.7857291666666666,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.3383458646616541,"delayFeedback":0.8358463541666667,"reverbDecay":3.539895833333333,"reverbPreDelay":0.1842252604166667,"vibratoDepth":0.1,"vibratoFreq":5,"gain":0.6316796874999999}}],"tempo":120},{"name":"Example: 🌬 Wind","id":"3b1ab7de-b47d-412b-a59b-e1a4eb8aa30a","hotkey":null,"placeholder":false,"numChannels":4,"channelSync":false,"channels":[{"id":"cefe887f-b4e8-4aa0-a8c2-42d10f76af13","color":"#008dff","scribbler":"one","channelNum":0,"velocity":0.45760981241861975,"key":[true,false,false,false,false,false,false,false,false,false,false,false],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.6570831807454427,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":5,"axis":1,"rangeStart":60,"rangeEnd":61,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":16,"seqRate":"8t","seqMovement":"random","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.7203818766276042,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"vibes","rangeMode":false,"keybdPitches":[60],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":269.53473659822055,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":1.2615625000000001,"samplerAttack":0.10482635498046874,"samplerRelease":1,"effectType":"delay","effectWet":0.8408509318033853,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.2767884318033854,"delayFeedback":0.2927257283528646,"reverbDecay":4,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"gain":1}},{"id":"36e9740f-0152-43e8-80d6-49ced39b3c21","color":"#ff413e","scribbler":"two","channelNum":1,"velocity":0.47927517361111116,"key":[false,false,true,false,false,false,false,false,false,true,false,false],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.3580034383138021,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":5,"axis":1,"rangeStart":50,"rangeEnd":58,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":16,"seqRate":"8n.","seqMovement":"random","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.7277256266276042,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"vibes","rangeMode":false,"keybdPitches":[50,57],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":269.53473659822055,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":1.2615625000000001,"samplerAttack":0.20295125325520832,"samplerRelease":1,"effectType":"delay","effectWet":0.7065456136067708,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.5729861450195312,"delayFeedback":0.283836669921875,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"gain":1}},{"id":"198d348b-0712-4470-a077-f6bc668f5481","color":"#33ff00","scribbler":"three","channelNum":2,"velocity":0.47927517361111116,"key":[true,false,false,false,false,true,false,false,false,false,false,false],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.6081249999999999,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":5,"axis":1,"rangeStart":48,"rangeEnd":54,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":16,"seqRate":"16n.","seqMovement":"random","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.7138368733723958,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"vibes","rangeMode":false,"keybdPitches":[48,53],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":269.53473659822055,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":1.2615625000000001,"samplerAttack":0.22439239501953123,"samplerRelease":1,"effectType":"delay","effectWet":0.6594444783528646,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.5444270833333333,"delayFeedback":0.37491302490234374,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"gain":1}},{"id":"5bdbc6be-b847-43f3-b4eb-9b46bc0e6722","color":"#ff00ff","scribbler":"four","channelNum":3,"velocity":0.47927517361111116,"key":[false,false,false,true,false,false,false,true,false,false,false,false],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.37463531494140623,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":5,"axis":1,"rangeStart":51,"rangeEnd":56,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":16,"seqRate":"16n.","seqMovement":"random","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.7409720865885416,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"vibes","rangeMode":false,"keybdPitches":[51,55],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":269.53473659822055,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":1.2615625000000001,"samplerAttack":0.1338715616861979,"samplerRelease":1,"effectType":"delay","effectWet":0.6178471883138021,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.18460062662760418,"delayFeedback":0.34800323486328133,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"gain":1}}],"tempo":80}]'