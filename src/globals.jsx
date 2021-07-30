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
document.addEventListener('keydown', (e) => {
  if (e.key === 'Alt') {
    ALT = true
  }
})
document.addEventListener('keyup', (e) => {
  if (e.key === 'Alt') {
    ALT = false
  }
})

export const CHORUS_ENABLED = !BROWSER.name.includes('Safari')

export const VIEWS = ['stacked', 'horizontal', 'clock']

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
      i = 0
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
  channels: [BLANK_CHANNEL(0, CHANNEL_COLORS[0], true)],
}

export const DEFAULT_PRESETS =
  '[{"name":"Example: Basic","id":"814d282f-d16c-45ed-a76e-a8986a75ea4b","hotkey":null,"placeholder":false,"numChannels":1,"channelSync":false,"channels":[{"id":"3449e18c-ca7b-4460-a58f-22efa2d587c8","color":"#008dff","channelNum":0,"velocity":1,"key":[true,false,true,false,false,false,true,false,false,true,false,true],"keyRate":"4n","keyMovement":"+/-","keyArpInc1":7,"keyArpInc2":-3,"sustain":0.4919583333333332,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":33,"rangeEnd":58,"seqSteps":[true,true,false,true,true,false,true,true,false,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":12,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[33,35,36,38,42,45,47,48,50,54,57],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1.1199999999999999,"cutoff":1605.5456940339009,"resonance":0,"rolloff":-24,"filterAttack":0.11970052083333334,"filterDecay":0.18154947916666667,"filterSustain":0.5,"filterRelease":2.584375,"filterAmount":3.3965104166666666,"samplerAttack":0,"samplerRelease":1,"effectType":"none","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"syncDelayTime":false,"synthType":"triangle"}}]},{"name":"Example: 2 Channels","id":"2c1a4f17-9292-4922-aef4-d9fa0d64432d","hotkey":null,"placeholder":false,"numChannels":2,"channelSync":false,"channels":[{"id":"267851dd-6e1b-46ba-a32a-9e247d0ce91d","color":"#008dff","channelNum":0,"velocity":1,"key":[true,false,true,false,false,false,true,false,false,true,false,true],"keyRate":"4n","keyMovement":"+/-","keyArpInc1":7,"keyArpInc2":-3,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":21,"rangeEnd":46,"seqSteps":[true,true,false,true,true,false,true,true,false,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":12,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.316328125,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"harp","rangeMode":true,"keybdPitches":[21,23,24,26,30,33,35,36,38,42,45],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"portamento":0.0668359375,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":272.3073909436541,"resonance":4.9677734375,"rolloff":-24,"filterAttack":0.28153645833333335,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"none","effectWet":0.77078125,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"syncDelayTime":false,"synthType":"fatsawtooth"}},{"id":"c66c3a67-70d2-4499-9c61-490852c00243","color":"#ff413e","channelNum":1,"velocity":1,"key":[true,false,true,false,false,false,true,false,false,true,false,true],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":30,"rangeEnd":55,"seqSteps":[true,false,false,true,false,false,true,true,false,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":12,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.6473307291666667,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"piano","rangeMode":true,"keybdPitches":[30,33,35,36,38,42,45,47,48,50,54],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.03951822916666666,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":779.9457544766001,"resonance":1.2255859374999987,"rolloff":-24,"filterAttack":0.06291666666666669,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"vibrato","effectWet":0.24494791666666668,"chorusDepth":0.06975381086654674,"chorusDelayTime":4.102691406249999,"chorusFreq":4.694105866969629,"chorusSpread":0,"distortion":1,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"syncDelayTime":false,"synthType":"triangle"}}]},{"name":"Example: Drums","id":"3d019314-9d47-424a-afff-b787b0fc2a8d","hotkey":null,"placeholder":false,"numChannels":6,"channelSync":false,"channels":[{"id":"4dd5558d-c261-476e-99e9-fef29690dda4","color":"#ff00ff","channelNum":0,"velocity":0.560118140243902,"key":[false,false,false,false,false,false,false,true,false,false,false,false],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":7,"rangeEnd":8,"seqSteps":[true,false,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":4,"seqRate":"8t","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[7],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"vibrato","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.5988802083333333,"vibratoFreq":1.2430342075147425}},{"id":"20c46fbb-1080-4b8d-bef2-af6e888861d5","color":"#33ff00","channelNum":1,"velocity":0.6288109756097555,"key":[true,false,false,false,false,true,false,false,false,false,false,false],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":true,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":0,"rangeEnd":6,"seqSteps":[true,false,false,true,false,true,false,true,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":12,"seqRate":"8t","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[0,5],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"vibrato","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.5988802083333333,"vibratoFreq":1.2430342075147425}},{"id":"ba138a9b-af9f-40f7-9423-e0fa16397b04","color":"#008dff","channelNum":2,"velocity":0.9202553353658525,"key":[false,false,false,false,false,false,false,false,false,false,false,true],"keyRate":"2n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":true,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":11,"rangeEnd":12,"seqSteps":[true,false,false,false,false,true,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":9,"seqRate":"2n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[11],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":3.437916666666667,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"0686c560-e481-494c-a964-f48bc321a0dd","color":"#ff413e","channelNum":3,"velocity":0.3310785060975607,"key":[false,false,false,false,true,false,true,false,true,false,false,false],"keyRate":"2n.","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":true,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":16,"rangeEnd":21,"seqSteps":[true,false,false,true,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":11,"seqRate":"2t","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[16,18,20],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"vibrato","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.5988802083333333,"vibratoFreq":1.2430342075147425}},{"id":"455d4d2f-ce48-4113-ba86-4facc9470d64","color":"#ff9700","channelNum":4,"velocity":0.20236280487804886,"key":[true,false,false,false,false,false,false,false,false,false,false,false],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":true,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":24,"rangeEnd":25,"seqSteps":[true,true,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":9,"seqRate":"16t","seqMovement":"up/down","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[24],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"vibrato","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.5988802083333333,"vibratoFreq":1.2430342075147425}},{"id":"77b10349-62b6-45cd-9741-2c7784db22e5","color":"#a825f4","channelNum":5,"velocity":0.6508193597560976,"key":[false,false,true,false,false,false,false,false,false,true,false,false],"keyRate":"4n","keyMovement":"+/-","keyArpInc1":6,"keyArpInc2":-5,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":true,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":45,"rangeEnd":51,"seqSteps":[true,true,false,true,false,true,false,true,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":17,"seqRate":"16t","seqMovement":"random","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[45,50],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"vibrato","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.5988802083333333,"vibratoFreq":1.2430342075147425}}]}]'
