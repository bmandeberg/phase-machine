import React from 'react'
import { v4 as uuid } from 'uuid'
import WebMidi from 'webmidi'
import * as Tone from 'tone'
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

export const MAX_SEQUENCE_LENGTH = 32

export const DEFAULT_TIME_DIVISION = '4n'

export const MAX_SWING_LENGTH = 6

export const PRESET_HOLD_TIME = 1000

export const PLAY_NOTE_BUFFER_TIME = 0.015

// MIDI out

export function midiStartContinue(midiOut, midiIn) {
  if (WebMidi.midiClockOut && midiOut && midiOut !== midiIn) {
    const midiOutObj = WebMidi.getOutputByName(midiOut)
    if (Tone.Transport.midiContinue) {
      midiOutObj.sendContinue()
    } else {
      midiOutObj.sendStart()
      Tone.Transport.midiContinue = true
    }
  }
}

export function midiSongpositionReset(midiOut, midiIn) {
  if (WebMidi.midiClockOut && midiOut && midiOut !== midiIn) {
    WebMidi.getOutputByName(midiOut).sendSongPosition(0)
  }
}

export function midiStop(midiOut, midiIn, reset) {
  if (WebMidi.midiClockOut && midiOut && midiOut !== midiIn) {
    WebMidi.getOutputByName(midiOut).sendStop()
    if (reset) {
      midiSongpositionReset(midiOut, midiIn)
      Tone.Transport.midiContinue = false
    }
  }
}

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
  '[{"name":"Example: Basic","id":"d6486d42-9ffd-463b-b130-db608be56aa9","hotkey":null,"placeholder":false,"numChannels":1,"channelSync":false,"channels":[{"id":"3449e18c-ca7b-4460-a58f-22efa2d587c8","color":"#008dff","scribbler":"synth","channelNum":0,"velocity":1,"key":[true,false,true,false,false,false,true,false,false,true,false,true],"keyRate":"4n","keyMovement":"+/-","keyArpInc1":7,"keyArpInc2":-3,"sustain":0.4919583333333332,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":33,"rangeEnd":58,"seqSteps":[true,true,false,true,true,false,true,true,false,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":12,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[33,35,36,38,42,45,47,48,50,54,57],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1.1199999999999999,"cutoff":1605.5456940339009,"resonance":0,"rolloff":-24,"filterAttack":0.11970052083333334,"filterDecay":0.18154947916666667,"filterSustain":0.5,"filterRelease":2.584375,"filterAmount":3.3965104166666666,"samplerAttack":0,"samplerRelease":1,"effectType":"none","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"syncDelayTime":false,"synthType":"triangle"}}]},{"name":"Example: 2 Channels","id":"dfa92e24-91f4-4976-8729-f94bd66b9ce2","hotkey":null,"placeholder":false,"numChannels":2,"channelSync":false,"channels":[{"id":"267851dd-6e1b-46ba-a32a-9e247d0ce91d","color":"#008dff","scribbler":"harp","channelNum":0,"velocity":1,"key":[true,false,true,false,false,false,true,false,false,true,false,true],"keyRate":"4n","keyMovement":"+/-","keyArpInc1":7,"keyArpInc2":-3,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":5,"rangeStart":21,"rangeEnd":46,"seqSteps":[true,true,false,true,true,false,true,true,false,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":12,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.316328125,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"harp","rangeMode":true,"keybdPitches":[21,23,24,26,30,33,35,36,38,42,45],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"portamento":0.0668359375,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":272.3073909436541,"resonance":4.9677734375,"rolloff":-24,"filterAttack":0.28153645833333335,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"none","effectWet":0.77078125,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"syncDelayTime":false,"synthType":"fatsawtooth"}},{"id":"c66c3a67-70d2-4499-9c61-490852c00243","color":"#ff413e","scribbler":"piano","channelNum":1,"velocity":1,"key":[true,false,true,false,false,false,true,false,false,true,false,true],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":5,"rangeStart":30,"rangeEnd":55,"seqSteps":[true,false,false,true,false,false,true,true,false,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":12,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.6473307291666667,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"piano","rangeMode":true,"keybdPitches":[30,33,35,36,38,42,45,47,48,50,54],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.03951822916666666,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":779.9457544766001,"resonance":1.2255859374999987,"rolloff":-24,"filterAttack":0.06291666666666669,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"vibrato","effectWet":0.24494791666666668,"chorusDepth":0.06975381086654674,"chorusDelayTime":4.102691406249999,"chorusFreq":4.694105866969629,"chorusSpread":0,"distortion":1,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5,"syncDelayTime":false,"synthType":"triangle"}}]},{"name":"Example: Percussion","id":"03b1b7fa-5909-404b-b2ae-27d51969e1ba","hotkey":null,"placeholder":false,"numChannels":7,"channelSync":false,"channels":[{"id":"2e0c30ea-c9b1-442a-ac2f-fa62c3276fe6","color":"#008dff","scribbler":"Bell lo","channelNum":0,"velocity":0.3553602430555556,"key":[false,false,false,false,false,false,false,false,false,true,false,false],"keyRate":"16n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":33,"rangeEnd":34,"seqSteps":[true,false,true,false,true,true,false,true,false,true,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":12,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[33],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"chorus","effectWet":0.23298177083333343,"chorusDepth":0.2476837950269109,"chorusDelayTime":5.05348046875,"chorusFreq":3.8378540205557776,"chorusSpread":180,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":1,"vibratoFreq":5.19014376591302}},{"id":"24420102-3fa4-43cd-b3ba-8f853122c8c0","color":"#a825f4","scribbler":"Bell hi","channelNum":1,"velocity":0.5557725694444444,"key":[false,false,false,false,false,false,false,false,true,false,false,false],"keyRate":"8n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":32,"rangeEnd":33,"seqSteps":[false,true,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":24,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[32],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0.25427083333333333,"samplerRelease":1,"effectType":"chorus","effectWet":0.23298177083333343,"chorusDepth":0.2476837950269109,"chorusDelayTime":5.05348046875,"chorusFreq":3.8378540205557776,"chorusSpread":180,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":1,"vibratoFreq":5.19014376591302}},{"id":"38d22be9-5ba0-4880-b2df-7ce179204851","color":"#ff413e","scribbler":"Shaker","channelNum":2,"velocity":0.5084635416666667,"key":[false,false,false,false,false,false,false,false,false,false,true,true],"keyRate":"16n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":34,"rangeEnd":36,"seqSteps":[true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":3,"seqRate":"16n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[34,35],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":0.181015625,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.13109375,"delayFeedback":0.17789062499999997,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.5988802083333333,"vibratoFreq":1.2430342075147425}},{"id":"f94553a7-e620-4c20-90b2-485426933413","color":"#33ff00","scribbler":"mid drum","channelNum":3,"velocity":0.8406032986111112,"key":[false,false,false,false,true,false,false,false,false,false,false,false],"keyRate":"16n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":28,"rangeEnd":29,"seqSteps":[true,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":18,"seqRate":"16t","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[28],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":0.181015625,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.13109375,"delayFeedback":0.17789062499999997,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.5988802083333333,"vibratoFreq":1.2430342075147425}},{"id":"de988313-e3a2-40f6-a9af-ee674e9bc630","color":"#00C591","scribbler":"hi drum","channelNum":4,"velocity":0.7849392361111112,"key":[false,false,true,false,false,false,false,false,false,false,false,false],"keyRate":"16n.","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":26,"rangeEnd":27,"seqSteps":[false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,true,false],"seqLength":32,"seqRate":"16n.","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[26],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":0.181015625,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":true,"delayTime":0.25,"delayFeedback":0.38233072916666666,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.5988802083333333,"vibratoFreq":1.2430342075147425}},{"id":"46e945d3-8d6e-4ae6-b2c1-794cc43f51d5","color":"#ff00ff","scribbler":"hilo drum","channelNum":5,"velocity":0.4564887152777778,"key":[false,false,false,false,true,false,false,true,false,false,false,false],"keyRate":"16n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":31,"rangeEnd":53,"seqSteps":[false,false,true,false,false,true,false,false,true,true,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":12,"seqRate":"16n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[31,52],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.30885416666666676,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.13109375,"delayFeedback":0.17789062499999997,"reverbDecay":1.5,"reverbPreDelay":0.14161458333333335,"vibratoDepth":0.5988802083333333,"vibratoFreq":1.2430342075147425}},{"id":"dd1e9d9f-9398-43b3-bd90-f6f2c11409f5","color":"#ff9700","scribbler":"lo drum","channelNum":6,"velocity":0.2989366319444444,"key":[true,true,false,false,false,false,false,false,false,false,false,false],"keyRate":"16n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":0,"rangeEnd":2,"seqSteps":[true,false,false,false,false,false,true,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":12,"seqRate":"16n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":3,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[0,1],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.5536328125000001,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.13109375,"delayFeedback":0.17789062499999997,"reverbDecay":0.6687500000000001,"reverbPreDelay":0,"vibratoDepth":0.5988802083333333,"vibratoFreq":1.2430342075147425}}]},{"name":"Example: Electro 👽","id":"e926edf6-6493-4b34-95e0-5cdbc7a24f2e","hotkey":null,"placeholder":false,"numChannels":8,"channelSync":false,"channels":[{"id":"d71423e3-5137-47c5-ab8e-f15c82faed95","color":"#008dff","scribbler":"kick","channelNum":0,"velocity":0.8005907012195123,"key":[false,false,false,false,true,false,true,false,false,false,false,false],"keyRate":"8n","keyMovement":"down","keyArpInc1":-1,"keyArpInc2":2,"sustain":0.5906354166666667,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":18,"rangeEnd":41,"seqSteps":[true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":16,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drum-machine","rangeMode":false,"keybdPitches":[18,40],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":0,"effectType":"reverb","effectWet":0.2889583333333333,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.3838020833333333,"delayFeedback":0.11864583333333334,"reverbDecay":3.2395312499999998,"reverbPreDelay":0.23819010416666667,"vibratoDepth":0.9375781249999999,"vibratoFreq":12.856352337016906}},{"id":"bcf6c48a-27ea-4831-bbaa-06e19cf7d625","color":"#EDDB00","scribbler":"hi-hat","channelNum":1,"velocity":0.47599085365853716,"key":[false,false,false,false,false,false,false,false,false,false,true,false],"keyRate":"4n","keyMovement":"up","keyArpInc1":-1,"keyArpInc2":2,"sustain":0.5906354166666667,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":70,"rangeEnd":71,"seqSteps":[false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":2,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drum-machine","rangeMode":false,"keybdPitches":[70],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":0,"effectType":"delay","effectWet":0.18359374999999997,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":true,"delayTime":0.375,"delayFeedback":0.581875,"reverbDecay":3.2395312499999998,"reverbPreDelay":0.23819010416666667,"vibratoDepth":0.9375781249999999,"vibratoFreq":12.856352337016906}},{"id":"b9b6203b-218e-4455-84ec-0d98a61c65e5","color":"#33ff00","scribbler":"percussion","channelNum":2,"velocity":0.5768864329268298,"key":[true,false,false,false,true,false,false,false,false,false,false,false],"keyRate":"1m","keyMovement":"down","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.5906354166666667,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":16,"rangeEnd":61,"seqSteps":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false],"seqLength":32,"seqRate":"16n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drum-machine","rangeMode":false,"keybdPitches":[16,60],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":0,"effectType":"reverb","effectWet":0.5051041666666667,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.3838020833333333,"delayFeedback":0.11864583333333334,"reverbDecay":3.2395312499999998,"reverbPreDelay":0.23819010416666667,"vibratoDepth":0.9375781249999999,"vibratoFreq":12.856352337016906}},{"id":"f009b973-8842-447e-a399-1cda8328ef0b","color":"#ff9700","scribbler":"bass","channelNum":3,"velocity":0.44226371951219523,"key":[false,true,false,true,true,false,true,false,true,false,true,true],"keyRate":"4n","keyMovement":"+/-","keyArpInc1":4,"keyArpInc2":-1,"sustain":0.5906354166666667,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":20,"rangeEnd":33,"seqSteps":[false,false,false,false,false,false,false,false,true,false,false,false,true,false,false,false,true,false,true,false,false,false,false,false,true,false,false,false,true,false,false,false],"seqLength":32,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[20,22,23,25,27,28,30,32],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"fmsquare","portamento":0.0675390625,"modulationType":"square","harmonicity":1,"fatSpread":36.8984375,"fatCount":3,"pulseWidth":0.2,"pwmFreq":1.11605078125,"envAttack":0.0689453125,"envDecay":0.43845052083333336,"envSustain":0.17725260416666672,"envRelease":0.38218750000000007,"cutoff":110.36114912746253,"resonance":0.5083984374999999,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":0.8315625,"filterAmount":3,"samplerAttack":0,"samplerRelease":0,"effectType":"delay","effectWet":0.6828645833333334,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":180,"distortion":1,"syncDelayTime":true,"delayTime":0.375,"delayFeedback":0.5700390625,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.9375781249999999,"vibratoFreq":12.856352337016906}},{"id":"b0767957-6222-43b7-be9e-6214cc756e9a","color":"#00C591","scribbler":"stab","channelNum":4,"velocity":0.44388338414634126,"key":[false,false,false,true,false,false,false,false,true,false,false,false],"keyRate":"4n","keyMovement":"up","keyArpInc1":4,"keyArpInc2":-1,"sustain":0.5906354166666667,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":20,"rangeEnd":28,"seqSteps":[true,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":32,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"synth","rangeMode":false,"keybdPitches":[20,27],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"fmsquare","portamento":0.0675390625,"modulationType":"square","harmonicity":1,"fatSpread":36.8984375,"fatCount":3,"pulseWidth":0.2,"pwmFreq":1.11605078125,"envAttack":0.0689453125,"envDecay":0.43845052083333336,"envSustain":0.17725260416666672,"envRelease":0.38218750000000007,"cutoff":5000,"resonance":0.5083984374999999,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":0.8315625,"filterAmount":3,"samplerAttack":0,"samplerRelease":0,"effectType":"delay","effectWet":0.6828645833333334,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":180,"distortion":1,"syncDelayTime":true,"delayTime":0.375,"delayFeedback":0.6102083333333334,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.9375781249999999,"vibratoFreq":12.856352337016906}},{"id":"fcb08502-da5e-4b98-b8a5-55c03ba97216","color":"#ff413e","scribbler":"chord 1","channelNum":5,"velocity":1,"key":[false,true,false,true,true,false,true,false,true,false,true,true],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":3,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":-3,"axis":0,"rangeStart":38,"rangeEnd":50,"seqSteps":[false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":2,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[39,40,42,44,46,47,49],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"fmtriangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.35282552083333335,"envDecay":0.055546875,"envSustain":0.01808593749999994,"envRelease":0.7162499999999997,"cutoff":205.31879124363573,"resonance":3.340820312500001,"rolloff":-24,"filterAttack":0.05841145833333333,"filterDecay":0.40903645833333335,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.8684375,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":2.0952083333333333,"reverbPreDelay":0.08643880208333332,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"d39f4983-2638-46ab-8b95-209be9ff5269","color":"#a825f4","scribbler":"chord 2","channelNum":6,"velocity":1,"key":[false,true,false,true,true,false,true,false,true,false,true,true],"keyRate":"4n","keyMovement":"+/-","keyArpInc1":5,"keyArpInc2":-3,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":-3,"axis":0,"rangeStart":38,"rangeEnd":50,"seqSteps":[false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":2,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[39,40,42,44,46,47,49],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"fmtriangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.35282552083333335,"envDecay":0.055546875,"envSustain":0.01808593749999994,"envRelease":0.7162499999999997,"cutoff":203.25692495885627,"resonance":3.340820312500001,"rolloff":-24,"filterAttack":0.05841145833333333,"filterDecay":0.40903645833333335,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.8717057291666667,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":2.0952083333333333,"reverbPreDelay":0.08643880208333332,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"51c4c21b-c2c4-4556-a803-8ad4147b216d","color":"#ff00ff","scribbler":"flutter","channelNum":7,"velocity":0.22075076219512185,"key":[false,true,false,true,true,false,true,false,true,false,true,true],"keyRate":"16n","keyMovement":"+/-","keyArpInc1":1,"keyArpInc2":4,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":-3,"axis":0,"rangeStart":48,"rangeEnd":72,"seqSteps":[false,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":4,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"synth","rangeMode":true,"keybdPitches":[49,51,52,54,56,58,59,61,63,64,66,68,70,71],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"fmsquare","portamento":0.023359375,"modulationType":"triangle","harmonicity":1.4925,"fatSpread":20,"fatCount":4,"pulseWidth":-0.42546875,"pwmFreq":0.4,"envAttack":0.1396484375,"envDecay":0.09746093749999998,"envSustain":0.3041666666666666,"envRelease":2.7975,"cutoff":333.93132298937127,"resonance":1.0021484375,"rolloff":-12,"filterAttack":0.06511718749999999,"filterDecay":0.051588541666666654,"filterSustain":0,"filterRelease":1.0520833333333335,"filterAmount":2.3544791666666667,"samplerAttack":0.034830729166666664,"samplerRelease":0,"effectType":"delay","effectWet":0.7988671875000001,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.30276041666666664,"reverbDecay":2.0952083333333333,"reverbPreDelay":0.08643880208333332,"vibratoDepth":0.1,"vibratoFreq":5}}]},{"name":"Example: Jazz 😎","id":"f37d70c5-338d-4e88-b7bb-f309bd0ebe6c","hotkey":null,"placeholder":false,"numChannels":8,"channelSync":false,"channels":[{"id":"ec7b9ee1-1910-4fcf-8459-7057e68c5c43","color":"#008dff","scribbler":"hi-hat","channelNum":0,"velocity":0.479420731707317,"key":[false,false,false,false,false,false,false,false,false,true,false,false],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":9,"rangeEnd":10,"seqSteps":[false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":2,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[9],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":0.1846354166666667,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.3415234375,"delayFeedback":0,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"31eae4ea-0343-410a-acc9-f5d175febc3b","color":"#EDDB00","scribbler":"Rimshot","channelNum":1,"velocity":0.4423589939024389,"key":[false,false,true,false,false,false,false,false,false,false,false,false],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":2,"rangeEnd":3,"seqSteps":[false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":8,"seqRate":"4n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[2],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.40302083333333344,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.3415234375,"delayFeedback":0,"reverbDecay":1.5,"reverbPreDelay":0.07111328125,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"fe0e5041-1f4d-4233-916a-7e2bf97160d7","color":"#ff413e","scribbler":"ride","channelNum":2,"velocity":0.479420731707317,"key":[false,false,false,false,true,false,false,false,false,false,false,false],"keyRate":"4n","keyMovement":"up","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":16,"rangeEnd":17,"seqSteps":[true,false,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":4,"seqRate":"8n","seqMovement":"up","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.6881901041666667,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[16],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.5255989583333334,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":2.53140625,"reverbPreDelay":0,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"b70e1c5b-2057-495f-884a-03a4450f228b","color":"#00C591","scribbler":"Drums","channelNum":3,"velocity":0.6098513719512192,"key":[true,true,false,true,false,true,true,true,false,false,false,true],"keyRate":"8n","keyMovement":"random","keyArpInc1":2,"keyArpInc2":-1,"sustain":0.6000000000000001,"keySwing":0.6662760416666667,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":0,"rangeEnd":16,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":13,"seqRate":"8n","seqMovement":"random","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.7126432291666667,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"drums","rangeMode":false,"keybdPitches":[0,11,12,13,15,5,6,7],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.6336328125,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":3.5733333333333333,"reverbPreDelay":0,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"460fb99f-cf47-484c-84fa-b4ed4af39cc0","color":"#33ff00","scribbler":"bass","channelNum":4,"velocity":0.5971798780487808,"key":[true,false,true,false,true,true,false,true,true,false,true,true],"keyRate":"4n","keyMovement":"+/-","keyArpInc1":7,"keyArpInc2":3,"sustain":0.28347916666666667,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":0,"rangeEnd":26,"seqSteps":[false,true,true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,true,false,true],"seqLength":32,"seqRate":"8n","seqMovement":"up/down","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.6878125,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"bass","rangeMode":true,"keybdPitches":[0,2,4,5,7,8,10,11,12,14,16,17,19,20,22,23,24],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"none","effectWet":1,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"c5b2b49b-bc91-43e1-8721-c94589c5d00d","color":"#ff00ff","scribbler":"piano","channelNum":5,"velocity":0.6391006097560972,"key":[true,false,true,false,true,true,false,true,true,false,true,true],"keyRate":"8n","keyMovement":"+/-","keyArpInc1":-7,"keyArpInc2":3,"sustain":0.28347916666666667,"keySwing":0.7093229166666667,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":25,"rangeEnd":53,"seqSteps":[false,true,false,false,false,false,false,false,false,false,false,true,true,false,true,true,false,false,false,false,false,false,false,true,true,false,true,false,false,false,true,false],"seqLength":32,"seqRate":"8n","seqMovement":"up/down","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.6779296875,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"piano","rangeMode":true,"keybdPitches":[26,28,29,31,32,34,35,36,38,40,41,43,44,46,47,48,50,52],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":0.029427083333333326,"effectType":"reverb","effectWet":0.31921874999999994,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.5,"reverbDecay":2.649010416666667,"reverbPreDelay":0.18725260416666667,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"e3654938-6128-49bd-826c-83cb1a4d1f67","color":"#ff9700","scribbler":"vibes","channelNum":6,"velocity":0.548685213414634,"key":[true,false,true,false,true,true,false,true,true,false,true,true],"keyRate":"2n.","keyMovement":"+/-","keyArpInc1":-1,"keyArpInc2":8,"sustain":1,"keySwing":0.9284505208333331,"keySwingLength":3,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":53,"rangeEnd":71,"seqSteps":[false,false,false,true,true,false,true,false,false,true,false,false,true,false,false,true,false,false,true,true,false,false,false,false,false,false,false,false,false,true,true,true],"seqLength":32,"seqRate":"1m","seqMovement":"up/down","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"vibes","rangeMode":true,"keybdPitches":[53,55,56,58,59,60,62,64,65,67,68,70],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"chorus","effectWet":1,"chorusDepth":0.15526835305009887,"chorusDelayTime":6.9078203125,"chorusFreq":1.018132973074793,"chorusSpread":180,"distortion":1,"syncDelayTime":false,"delayTime":0.25,"delayFeedback":0.6656640625,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.4430729166666666,"vibratoFreq":3.103310808543857}},{"id":"941fd373-b23d-4cdb-aa88-c7543ab9bdf1","color":"#a825f4","scribbler":"harp sweep","channelNum":7,"velocity":0.2135099085365852,"key":[true,false,true,false,true,true,false,true,true,false,true,true],"keyRate":"32n","keyMovement":"down","keyArpInc1":3,"keyArpInc2":7,"sustain":1,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":14,"rangeEnd":85,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":32,"seqRate":"1m","seqMovement":"up/down","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":false,"instrumentOn":true,"instrumentType":"harp","rangeMode":true,"keybdPitches":[14,16,17,19,20,22,23,24,26,28,29,31,32,34,35,36,38,40,41,43,44,46,47,48,50,52,53,55,56,58,59,60,62,64,65,67,68,70,71,72,74,76,77,79,80,82,83,84],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0.090234375,"samplerRelease":1,"effectType":"delay","effectWet":0.3863020833333335,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.3010677083333333,"delayFeedback":0.7575260416666667,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.17166666666666663,"vibratoFreq":3.103310808543857}}]},{"name":"Example: Voices 👄","id":"f96f33da-aaf7-4438-95a0-df6659db65fa","hotkey":null,"placeholder":false,"numChannels":4,"channelSync":false,"channels":[{"id":"9b81bfbf-3a84-48fa-b7cd-5b4b4ece43f0","color":"#008dff","scribbler":"low","channelNum":0,"velocity":0.7123666158536587,"key":[true,false,false,true,false,true,false,false,true,true,true,false],"keyRate":"2n","keyMovement":"random","keyArpInc1":6,"keyArpInc2":-2,"sustain":1,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":2,"rangeEnd":20,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":5,"seqRate":"1m","seqMovement":"random","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"choral","rangeMode":true,"keybdPitches":[3,5,8,9,10,12,15,17],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"distortion","effectWet":0.14925781250000003,"chorusDepth":0.4447129814807687,"chorusDelayTime":2.5,"chorusFreq":1,"chorusSpread":131.184375,"distortion":0.359765625,"syncDelayTime":false,"delayTime":0.3383458646616541,"delayFeedback":0.8349609375000001,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"e1dd6bac-62cb-4c44-8d21-b59bf48dcff9","color":"#ff413e","scribbler":"wobbly","channelNum":1,"velocity":0.49752286585365874,"key":[true,false,false,true,false,true,false,false,true,true,true,false],"keyRate":"2n","keyMovement":"random","keyArpInc1":6,"keyArpInc2":-2,"sustain":1,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":20,"rangeEnd":39,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":5,"seqRate":"1m","seqMovement":"random","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"choral","rangeMode":true,"keybdPitches":[20,21,22,24,27,29,32,33,34,36],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0.3030598958333333,"samplerRelease":1,"effectType":"vibrato","effectWet":0.8949479166666666,"chorusDepth":1,"chorusDelayTime":0.1,"chorusFreq":1.02151372879297,"chorusSpread":180,"distortion":1,"syncDelayTime":false,"delayTime":0.3383458646616541,"delayFeedback":0.8358463541666667,"reverbDecay":1.5,"reverbPreDelay":0.01,"vibratoDepth":0.9503515625,"vibratoFreq":1}},{"id":"3dd2ad3a-aec6-4751-96ec-40a5412a027a","color":"#33ff00","scribbler":"mid","channelNum":2,"velocity":0.49752286585365874,"key":[true,false,false,true,false,true,false,false,true,true,true,false],"keyRate":"2n","keyMovement":"random","keyArpInc1":6,"keyArpInc2":-2,"sustain":1,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":39,"rangeEnd":54,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":5,"seqRate":"1m","seqMovement":"random","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"choral","rangeMode":true,"keybdPitches":[39,41,44,45,46,48,51,53],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"delay","effectWet":0.9073307291666666,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.2536583646616541,"delayFeedback":0.71125,"reverbDecay":1.5,"reverbPreDelay":0.32076171875000004,"vibratoDepth":0.1,"vibratoFreq":5}},{"id":"d1f1829f-aec1-4001-b14b-79ec729f7698","color":"#ff00ff","scribbler":"high","channelNum":3,"velocity":0.49752286585365874,"key":[true,false,false,true,false,true,false,false,true,true,true,false],"keyRate":"2n","keyMovement":"random","keyArpInc1":6,"keyArpInc2":-2,"sustain":1,"keySwing":0.5,"keySwingLength":2,"mute":false,"solo":false,"shiftAmt":1,"axis":0,"rangeStart":54,"rangeEnd":86,"seqSteps":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"seqLength":5,"seqRate":"1m","seqMovement":"random","seqArpInc1":2,"seqArpInc2":-1,"seqSwing":0.5,"seqSwingLength":2,"hold":true,"instrumentOn":true,"instrumentType":"choral","rangeMode":true,"keybdPitches":[56,57,58,60,63,65,68,69,70,72,75,77,80,81,82,84],"midiIn":false,"midiHold":false,"customMidiOutChannel":false,"midiOutChannel":1,"instrumentParams":{"synthType":"triangle","portamento":0,"modulationType":"square","harmonicity":1,"fatSpread":20,"fatCount":3,"pulseWidth":0.2,"pwmFreq":0.4,"envAttack":0.05,"envDecay":0.1,"envSustain":0.9,"envRelease":1,"cutoff":3000,"resonance":1,"rolloff":-24,"filterAttack":0.05,"filterDecay":0.2,"filterSustain":0.5,"filterRelease":2,"filterAmount":3,"samplerAttack":0,"samplerRelease":1,"effectType":"reverb","effectWet":0.7857291666666666,"chorusDepth":0.5,"chorusDelayTime":2.5,"chorusFreq":4,"chorusSpread":0,"distortion":1,"syncDelayTime":false,"delayTime":0.3383458646616541,"delayFeedback":0.8358463541666667,"reverbDecay":3.539895833333333,"reverbPreDelay":0.1842252604166667,"vibratoDepth":0.1,"vibratoFreq":5}}]}]'
