import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import regeneratorRuntime from 'regenerator-runtime'
import * as Tone from 'tone'
import WebMidi from 'webmidi'
import { CSSTransition } from 'react-transition-group'
import { useGesture } from 'react-use-gesture'
import {
  BLANK_PITCH_CLASSES,
  CHANNEL_HEIGHT,
  PLAY_NOTE_BUFFER_TIME,
  MIDDLE_C,
  SAMPLER_INSTRUMENTS,
  handleArpMode,
  noteString,
  convertMidiNumber,
  OCTAVES,
} from '../globals'
import { pitchesInRange, constrain } from '../math'
import classNames from 'classnames'
import Sequencer from './Sequencer'
import Modal from './Modal'
import useLoop from '../hooks/useLoop'
import useKeyManipulation from '../hooks/useKeyManipulation'
import useUI from '../hooks/useUI'
import arrowSmall from '../assets/arrow-small.svg'
import arrowSmallDark from '../assets/arrow-small-dark.svg'
import arrowSmallLight from '../assets/arrow-small-light.svg'
import arrowSmallLightMute from '../assets/arrow-small-light-mute.svg'
import arrowClock from '../assets/arrow-clock.svg'
import arrowClockDark from '../assets/arrow-clock-dark.svg'
import arrowClockLight from '../assets/arrow-clock-light.svg'
import arrowClockLightMute from '../assets/arrow-clock-light-mute.svg'
import './Channel.scss'

const CLOCK_CHANNEL_WIDTH = 657
const CLOCK_CHANNEL_HEIGHT = 262

export default function Channel({
  numChannels,
  color,
  channelNum,
  setGrabbing,
  grabbing,
  resizing,
  setResizing,
  view,
  numChannelsSoloed,
  tempo,
  playing,
  showStepNumbers,
  linearKnobs,
  midiOut,
  setChannelState,
  channelPreset,
  duplicateChannel,
  deleteChannel,
  initState,
  container,
  changeChannelOrder,
  theme,
  midiNoteOn,
  midiNoteOff,
}) {
  const id = useRef(initState.id)
  const [velocity, setVelocity] = useState(initState.velocity)
  const [key, setKey] = useState(initState.key)
  const keyRef = useRef()
  const [keyRate, setKeyRate] = useState(initState.keyRate)
  const [keyMovement, setKeyMovement] = useState(initState.keyMovement)
  const [keyArpInc1, setKeyArpInc1] = useState(initState.keyArpInc1)
  const [keyArpInc2, setKeyArpInc2] = useState(initState.keyArpInc2)
  const keyArpUtil = useRef(false)
  const [sustain, setSustain] = useState(initState.sustain)
  const [keySwing, setKeySwing] = useState(initState.keySwing)
  const [keySwingLength, setKeySwingLength] = useState(initState.keySwingLength)
  const [keyPreview, setKeyPreview] = useState(BLANK_PITCH_CLASSES())
  const [showKeyPreview, setShowKeyPreview] = useState(false)
  const [mute, setMute] = useState(initState.mute)
  const [solo, setSolo] = useState(initState.solo)
  const [shiftAmt, setShiftAmt] = useState(initState.shiftAmt)
  const [shiftDirectionForward, setShiftDirectionForward] = useState(true)
  const [axis, setAxis] = useState(initState.axis)
  const [turningAxisKnob, setTurningAxisKnob] = useState(false)
  const [rangeStart, setRangeStart] = useState(initState.rangeStart)
  const [rangeEnd, setRangeEnd] = useState(initState.rangeEnd) // non-inclusive
  const [playingPitchClass, setPlayingPitchClass] = useState()
  const [playingNote, setPlayingNote] = useState()
  const playingNoteRef = useRef()
  const noteIndex = useRef()
  const prevNoteIndex = useRef()
  const [noteOn, setNoteOn] = useState(false)
  const notePlaying = useRef(false)
  const noteOffTimeout = useRef()
  const [seqSteps, setSeqSteps] = useState(initState.seqSteps)
  const [seqLength, setSeqLength] = useState(initState.seqLength)
  const [playingStep, setPlayingStep] = useState()
  const prevStep = useRef()
  const currentStep = useRef(0)
  const nextStep = useRef()
  const [seqRate, setSeqRate] = useState(initState.seqRate)
  const [seqMovement, setSeqMovement] = useState(initState.seqMovement)
  const [seqArpInc1, setSeqArpInc1] = useState(initState.seqArpInc1)
  const [seqArpInc2, setSeqArpInc2] = useState(initState.seqArpInc2)
  const seqArpUtil = useRef(false)
  const [seqSwing, setSeqSwing] = useState(initState.seqSwing)
  const [seqSwingLength, setSeqSwingLength] = useState(initState.seqSwingLength)
  const [hold, setHold] = useState(initState.hold)
  const [instrumentOn, setInstrumentOn] = useState(initState.instrumentOn)
  const [instrumentType, setInstrumentType] = useState(initState.instrumentType)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [keyViewType, setKeyViewType] = useState(1)

  const [draggingChannel, setDraggingChannel] = useState(false)
  const [dragTarget, setDragTarget] = useState(channelNum)
  const [dragRow, setDragRow] = useState(0)

  const [rangeMode, setRangeMode] = useState(initState.rangeMode)
  const rangeModeRef = useRef()
  const [keybdPitches, setKeybdPitches] = useState(initState.keybdPitches)
  const keybdPitchesRef = useRef()

  const [midiIn, setMidiIn] = useState(initState.midiIn)
  const midiInRef = useRef()
  const [midiHold, setMidiHold] = useState(initState.midiHold)
  const midiHoldRef = useRef()
  const [customMidiOutChannel, setCustomMidiOutChannel] = useState(false)
  const customMidiOutChannelRef = useRef(customMidiOutChannel)
  const [midiOutChannel, setMidiOutChannel] = useState(1)
  const midiOutChannelRef = useRef(midiOutChannel)
  const midiOutRef = useRef(midiOut)

  // instrument params
  const [instrumentParams, setInstrumentParams] = useState(initState.instrumentParams)
  const instrumentParamsRef = useRef(instrumentParams)
  const effectRef = useRef()

  const [modalContent, setModalContent] = useState(false)
  const showModal = useCallback(() => {
    setModalContent(true)
  }, [])
  const hideModal = useCallback(() => {
    setModalContent(false)
  }, [])

  const playNoteBuffer = useRef({ seq: null, key: null })
  const presetInitialized = useRef(false)

  const channelNumRef = useRef(channelNum)
  const [modalType, setModalType] = useState('')

  const toggleDrawerOpen = useCallback(() => {
    setDrawerOpen((drawerOpen) => !drawerOpen)
  }, [])

  const emptyKey = useMemo(() => {
    return !key.some((p) => p)
  }, [key])

  useEffect(() => {
    presetInitialized.current = false
  }, [channelNum])

  const keyRestart = useCallback(() => {
    setPlayingNote(undefined)
    setPlayingPitchClass(undefined)
    playingNoteRef.current = undefined
    noteIndex.current = undefined
    prevNoteIndex.current = undefined
  }, [])

  const seqRestart = useCallback(() => {
    prevStep.current = undefined
    currentStep.current = 0
    nextStep.current = undefined
    setPlayingStep(null)
  }, [])

  const seqOpposite = useCallback(() => {
    setSeqSteps((seqSteps) => seqSteps.map((step, i) => (i < seqLength ? !step : step)))
  }, [seqLength])

  // MIDI

  useEffect(() => {
    midiInRef.current = midiIn
  }, [midiIn])
  useEffect(() => {
    midiHoldRef.current = midiHold
  }, [midiHold])
  useEffect(() => {
    rangeModeRef.current = rangeMode
  }, [rangeMode])
  useEffect(() => {
    keyRef.current = key
    if (!key.includes(true)) {
      setPlayingNote(undefined)
      setPlayingPitchClass(undefined)
      playingNoteRef.current = undefined
      noteIndex.current = undefined
      prevNoteIndex.current = undefined
    }
  }, [key])
  useEffect(() => {
    keybdPitchesRef.current = keybdPitches
  }, [keybdPitches])

  useEffect(() => {
    if (midiInRef.current && midiNoteOn) {
      if (rangeModeRef.current) {
        const pitchClassIndex = midiNoteOn.note.number % 12
        if (midiHoldRef.current || !keyRef.current[pitchClassIndex]) {
          setKey((key) => {
            const keyCopy = key.slice()
            keyCopy[pitchClassIndex] = true
            return keyCopy
          })
        } else {
          setKey((key) => {
            const keyCopy = key.slice()
            keyCopy[pitchClassIndex] = false
            return keyCopy
          })
        }
      } else {
        const noteNumber = convertMidiNumber(midiNoteOn.note.number)
        if (noteNumber >= 0 && noteNumber < OCTAVES * 12) {
          if (midiHoldRef.current || !keybdPitchesRef.current.includes(noteNumber)) {
            setKeybdPitches((keybdPitches) => {
              const keybdPitchesCopy = keybdPitches.slice()
              keybdPitchesCopy.push(noteNumber)
              return keybdPitchesCopy.sort()
            })
          } else {
            setKeybdPitches((keybdPitches) => keybdPitches.filter((p) => p !== noteNumber))
          }
        }
      }
    }
  }, [midiNoteOn])

  useEffect(() => {
    if (midiInRef.current && midiNoteOff && midiHoldRef.current) {
      if (rangeModeRef.current) {
        const pitchClassIndex = midiNoteOff.note.number % 12
        setKey((key) => {
          const keyCopy = key.slice()
          keyCopy[pitchClassIndex] = false
          return keyCopy
        })
      } else {
        const noteNumber = convertMidiNumber(midiNoteOff.note.number)
        if (noteNumber >= 0 && noteNumber < OCTAVES * 12) {
          setKeybdPitches((keybdPitches) => keybdPitches.filter((p) => p !== noteNumber))
        }
      }
    }
  }, [midiNoteOff])

  const openMidiModal = useCallback(() => {
    setModalType('MIDI')
  }, [])

  // set channel state when preset is changed

  useEffect(() => {
    if (channelPreset) {
      if (!presetInitialized.current) {
        presetInitialized.current = true
      } else {
        seqRestart()
        keyRestart()
        keyArpUtil.current = false
        seqArpUtil.current = false
        setVelocity(channelPreset.velocity)
        setKey(channelPreset.key.slice())
        setKeyRate(channelPreset.keyRate)
        setKeyMovement(channelPreset.keyMovement)
        setKeyArpInc1(channelPreset.keyArpInc1)
        setKeyArpInc2(channelPreset.keyArpInc2)
        setSustain(channelPreset.sustain)
        setKeySwing(channelPreset.keySwing)
        setKeySwingLength(channelPreset.keySwingLength)
        setMute(channelPreset.mute)
        setSolo(channelPreset.solo)
        setShiftAmt(channelPreset.shiftAmt)
        setAxis(channelPreset.axis)
        setRangeStart(channelPreset.rangeStart)
        setRangeEnd(channelPreset.rangeEnd)
        setSeqSteps(channelPreset.seqSteps.slice())
        setSeqLength(channelPreset.seqLength)
        setSeqRate(channelPreset.seqRate)
        setSeqMovement(channelPreset.seqMovement)
        setSeqArpInc1(channelPreset.seqArpInc1)
        setSeqArpInc2(channelPreset.seqArpInc2)
        setSeqSwing(channelPreset.seqSwing)
        setSeqSwingLength(channelPreset.seqSwingLength)
        setHold(channelPreset.hold)
        setInstrumentOn(channelPreset.instrumentOn)
        setInstrumentType(channelPreset.instrumentType)
        setRangeMode(channelPreset.rangeMode)
        setKeybdPitches(channelPreset.keybdPitches)
        setMidiIn(channelPreset.midiIn)
        setMidiHold(channelPreset.midiHold)
        setCustomMidiOutChannel(channelPreset.customMidiOutChannel)
        setMidiOutChannel(channelPreset.midiOutChannel)
        setInstrumentParams(channelPreset.instrumentParams)
        setModalType(null)
        updateInstruments(
          synthInstrument.current,
          [pianoInstrument.current, marimbaInstrument.current, drumsInstrument.current],
          chorusEffect.current,
          distortionEffect.current,
          delayEffect.current,
          reverbEffect.current,
          vibratoEffect.current,
          channelPreset.instrumentType,
          channelPreset.instrumentParams,
          effectRef.current
        )
      }
    }
  }, [channelPreset, keyRestart, seqRestart])

  const muted = useMemo(() => mute || (numChannelsSoloed > 0 && !solo), [mute, numChannelsSoloed, solo])

  // channel dragging

  const dragChannel = useRef(channelNum)
  const dragAuxChannel = useRef(false)
  const drag = useGesture({
    onDrag: ({ event, xy: [x, y] }) => {
      let hoveredChannel
      if (view === 'stacked' || view === 'horizontal') {
        const topOffset =
          62 +
          (event.target.classList.contains('auxiliary') ? numChannels * CHANNEL_HEIGHT : 0) -
          container.current.scrollTop
        hoveredChannel = constrain(Math.round((y - topOffset) / CHANNEL_HEIGHT), 0, numChannels)
        if (hoveredChannel !== dragChannel.current) {
          dragChannel.current = hoveredChannel
          setDragTarget(hoveredChannel > channelNum ? hoveredChannel - 1 : hoveredChannel)
        }
      } else if (view === 'clock') {
        const topOffset = 62 - container.current.scrollTop
        const column = Math.round(x / CLOCK_CHANNEL_WIDTH)
        const row = Math.floor((y - topOffset) / CLOCK_CHANNEL_HEIGHT)
        setDragRow(row)
        hoveredChannel = constrain(row * Math.floor(window.innerWidth / CLOCK_CHANNEL_WIDTH) + column, 0, numChannels)
      }
      if (hoveredChannel !== dragChannel.current) {
        dragChannel.current = hoveredChannel
        setDragTarget(hoveredChannel > channelNum ? hoveredChannel - 1 : hoveredChannel)
      }
    },
    onDragStart: ({ event }) => {
      dragChannel.current = channelNum
      dragAuxChannel.current = event.target.classList.contains('auxiliary')
      setDragTarget(channelNum)
      setDraggingChannel(true)
    },
    onDragEnd: () => {
      if (dragTarget !== channelNum) {
        changeChannelOrder(channelNum, dragTarget)
      }
      setDraggingChannel(false)
    },
  })

  // instrument

  const initInstrumentType = useRef(instrumentType)
  const instrument = useRef()
  const synthInstrument = useRef()
  const drumsInstrument = useRef()
  const pianoInstrument = useRef()
  const marimbaInstrument = useRef()
  const chorusEffect = useRef()
  const distortionEffect = useRef()
  const delayEffect = useRef()
  const reverbEffect = useRef()
  const vibratoEffect = useRef()

  useEffect(() => {
    synthInstrument.current = new Tone.MonoSynth({
      portamento: instrumentParamsRef.current.portamento,
      volume: -6,
      oscillator: {
        type: SAMPLER_INSTRUMENTS.includes(initInstrumentType.current) ? 'triangle' : initInstrumentType.current,
        modulationType: instrumentParamsRef.current.modulationType,
        harmonicity: instrumentParamsRef.current.harmonicity,
        spread: instrumentParamsRef.current.fatSpread,
        count: instrumentParamsRef.current.fatCount,
        width: instrumentParamsRef.current.pulseWidth,
        modulationFrequency: instrumentParamsRef.current.pwmFreq,
      },
      envelope: {
        attack: instrumentParamsRef.current.envAttack,
        decay: instrumentParamsRef.current.envDecay,
        sustain: instrumentParamsRef.current.envSustain,
        release: instrumentParamsRef.current.envRelease,
      },
      filter: {
        Q: instrumentParamsRef.current.resonance,
        rolloff: instrumentParamsRef.current.rolloff,
      },
      filterEnvelope: {
        baseFrequency: instrumentParamsRef.current.cutoff,
        attack: instrumentParamsRef.current.filterAttack,
        decay: instrumentParamsRef.current.filterDecay,
        sustain: instrumentParamsRef.current.filterSustain,
        release: instrumentParamsRef.current.filterRelease,
        octaves: instrumentParamsRef.current.filterAmount,
      },
    })
    pianoInstrument.current = new Tone.Sampler({
      urls: {
        C2: 'Ensoniq-SQ-2-Piano-C2.mp3',
        C4: 'Ensoniq-SQ-2-Piano-C4.mp3',
        C7: 'Ensoniq-SQ-2-Piano-C7.mp3',
      },
      baseUrl: window.location.origin + '/samples/piano/',
    })
    pianoInstrument.current.set({
      attack: instrumentParamsRef.current.samplerAttack,
      release: instrumentParamsRef.current.samplerRelease,
      volume: -6,
    })
    marimbaInstrument.current = new Tone.Sampler({
      urls: {
        C4: 'Roland-SC-88-Marimba-C4.mp3',
      },
      baseUrl: window.location.origin + '/samples/marimba/',
    })
    marimbaInstrument.current.set({
      attack: instrumentParamsRef.current.samplerAttack,
      release: instrumentParamsRef.current.samplerRelease,
      volume: -6,
    })
    drumsInstrument.current = new Tone.Sampler({
      urls: {
        C1: 'Korg-N1R-Bass-Drum-2.mp3',
        Db1: 'Korg-N1R-Bass-Drum.mp3',
        D1: 'Korg-N1R-Side-Stick.mp3',
        Eb1: 'Korg-N1R-Snare-Drum.mp3',
        E1: 'Korg-N1R-Clap.mp3',
        F1: 'Korg-N1R-Snare-Drum-2.mp3',
        Gb1: 'Korg-N1R-Low-Tom-2.mp3',
        G1: 'Korg-N1R-Closed-Hi-Hat.mp3',
        Ab1: 'Korg-N1R-Low-Tom.mp3',
        A1: 'Korg-N1R-Pedal-Hi-Hat.mp3',
        Bb1: 'Korg-N1R-Mid-Tom-2.mp3',
        B1: 'Korg-N1R-Open-Hi-Hat.mp3',
        C2: 'Korg-N1R-Mid-Tom.mp3',
        Db2: 'Korg-N1R-High-Tom-2.mp3',
        D2: 'Korg-N1R-Crash-Cymbal.mp3',
        Eb2: 'Korg-N1R-High-Tom.mp3',
        E2: 'Korg-N1R-Ride-Cymbal.mp3',
        F2: 'Korg-N1R-Chinese-Cymbal.mp3',
        Gb2: 'Korg-N1R-Ride-Bell.mp3',
        G2: 'Korg-N1R-Tambourine.mp3',
        Ab2: 'Korg-N1R-Splash-Cymbal.mp3',
        A2: 'Korg-N1R-Cowbell.mp3',
        Bb2: 'Korg-N1R-Crash-Cymbal-2.mp3',
        B2: 'Korg-N1R-Vibraslap.mp3',
        C3: 'Korg-N1R-Ride-Cymbal-2.mp3',
        Db3: 'Korg-N1R-High-Bongo.mp3',
        D3: 'Korg-N1R-Low-Bongo.mp3',
        Eb3: 'Roland-SC-88-Mute-High-Conga.mp3',
        E3: 'Roland-SC-88-Open-High-Conga.mp3',
        F3: 'Roland-SC-88-Low-Conga.mp3',
        Gb3: 'Korg-N1R-High-Timbale.mp3',
        G3: 'Korg-N1R-Low-Timbale.mp3',
        Ab3: 'Korg-N1R-High-Agogo.mp3',
        A3: 'Korg-N1R-Low-Agogo.mp3',
        Bb3: 'Korg-N1R-Cabasa.mp3',
        B3: 'Korg-N1R-Maracas.mp3',
        C4: 'Korg-N1R-Short-Whistle.mp3',
        Db4: 'Korg-N1R-Long-Whistle.mp3',
        D4: 'Korg-N1R-Short-Guiro.mp3',
        Eb4: 'Korg-N1R-Long-Guiro.mp3',
        E4: 'Korg-N1R-Claves.mp3',
        F4: 'Korg-N1R-High-Wood-Block.mp3',
        Gb4: 'Korg-N1R-Low-Wood-Block.mp3',
        G4: 'Roland-SC-88-Mute-Cuica.mp3',
        Ab4: 'Roland-SC-88-Open-Cuica.mp3',
        A4: 'Korg-N1R-Mute-Triangle.mp3',
        Bb4: 'Korg-N1R-Open-Triangle.mp3',
        B4: 'Korg-N1R-Shaker.mp3',
        C5: 'Korg-N1R-Jingle-Bell.mp3',
        Db5: 'Korg-N1R-Belltree.mp3',
        D5: 'Korg-N1R-Castanets.mp3',
        Eb5: 'Korg-N1R-Mute-Surdo.mp3',
        E5: 'Korg-N1R-Open-Surdo.mp3',
        F5: 'Korg-N1R-High-Q.mp3',
        Gb5: 'Korg-N1R-Slap.mp3',
        G5: 'Korg-N1R-Scratch-Push.mp3',
        Ab5: 'Korg-N1R-Scratch-Pull.mp3',
        A5: 'Korg-N1R-Sticks.mp3',
        Bb5: 'Korg-N1R-Square-Click.mp3',
        B5: 'Korg-N1R-Metronome-Click.mp3',
        C6: 'Korg-N1R-Metronome-Bell.mp3',
      },
      baseUrl: window.location.origin + '/samples/drums/',
    })
    drumsInstrument.current.set({
      attack: instrumentParamsRef.current.samplerAttack,
      release: instrumentParamsRef.current.samplerRelease,
      volume: -6,
    })
    chorusEffect.current = new Tone.Chorus(
      instrumentParamsRef.current.chorusFreq,
      instrumentParamsRef.current.chorusDelayTime,
      instrumentParamsRef.current.chorusDepth
    ).toDestination()
    chorusEffect.current.set({
      wet: instrumentParamsRef.current.effectWet,
      spread: instrumentParamsRef.current.chorusSpread,
    })
    distortionEffect.current = new Tone.Distortion(instrumentParamsRef.current.distortion).toDestination()
    distortionEffect.current.set({ wet: instrumentParamsRef.current.effectWet })
    delayEffect.current = new Tone.FeedbackDelay(
      instrumentParamsRef.current.delayTime,
      instrumentParamsRef.current.delayFeedback
    ).toDestination()
    delayEffect.current.set({ wet: instrumentParamsRef.current.effectWet })
    reverbEffect.current = new Tone.Reverb(instrumentParamsRef.current.reverbDecay).toDestination()
    reverbEffect.current.set({
      wet: instrumentParamsRef.current.effectWet,
      preDelay: instrumentParamsRef.current.reverbPreDelay,
    })
    vibratoEffect.current = new Tone.Vibrato(
      instrumentParamsRef.current.vibratoFreq,
      instrumentParamsRef.current.vibratoDepth
    ).toDestination()
    vibratoEffect.current.set({
      wet: instrumentParamsRef.current.effectWet,
    })
    let effect
    switch (instrumentParamsRef.current.effectType) {
      case 'chorus':
        effect = chorusEffect.current
        chorusEffect.current.start()
        break
      case 'distortion':
        effect = distortionEffect.current
        break
      case 'delay':
        effect = delayEffect.current
        break
      case 'reverb':
        effect = reverbEffect.current
        break
      case 'vibrato':
        effect = vibratoEffect.current
        break
      default:
        effect = null
    }
    if (effect) {
      effectRef.current = effect
      synthInstrument.current.connect(effect)
      pianoInstrument.current.connect(effect)
      marimbaInstrument.current.connect(effect)
      drumsInstrument.current.connect(effect)
    } else {
      effectRef.current = Tone.getDestination()
      synthInstrument.current.toDestination()
      pianoInstrument.current.toDestination()
      marimbaInstrument.current.toDestination()
      drumsInstrument.current.toDestination()
    }
    switch (initInstrumentType.current) {
      case 'piano':
        instrument.current = pianoInstrument.current
        break
      case 'marimba':
        instrument.current = marimbaInstrument.current
        break
      case 'drums':
        instrument.current = drumsInstrument.current
        break
      default:
        instrument.current = synthInstrument.current
    }
    return () => {
      if (notePlaying.current && noteIndex.current !== undefined) {
        Tone.context.clearTimeout(noteOffTimeout.current)
        if (instrument.current) {
          instrument.current.triggerRelease()
        }
        const channel = customMidiOutChannelRef.current ? midiOutChannelRef.current : channelNumRef.current + 1
        const note = noteString(noteIndex.current)
        const midiOutObj = midiOutRef.current ? WebMidi.getOutputByName(midiOutRef.current) : null
        if (midiOutObj) {
          midiOutObj.stopNote(note, channel)
        }
      }
      synthInstrument.current.dispose()
      marimbaInstrument.current.dispose()
      pianoInstrument.current.dispose()
      drumsInstrument.current.dispose()
      chorusEffect.current.dispose()
      distortionEffect.current.dispose()
      delayEffect.current.dispose()
      reverbEffect.current.dispose()
      vibratoEffect.current.dispose()
      instrument.current = null
    }
  }, [])

  useEffect(() => {
    if (instrument.current) {
      instrument.current.triggerRelease()
    }
    switch (instrumentType) {
      case 'piano':
        instrument.current = pianoInstrument.current
        break
      case 'marimba':
        instrument.current = marimbaInstrument.current
        break
      case 'drums':
        instrument.current = drumsInstrument.current
        break
      default:
        instrument.current = synthInstrument.current
        instrument.current.oscillator.type = instrumentType
    }
  }, [instrumentType])

  useEffect(() => {
    switch (instrumentParams.effectType) {
      case 'chorus':
        effectRef.current = chorusEffect.current
        break
      case 'distortion':
        effectRef.current = distortionEffect.current
        break
      case 'delay':
        effectRef.current = delayEffect.current
        break
      case 'reverb':
        effectRef.current = reverbEffect.current
        break
      case 'vibrato':
        effectRef.current = vibratoEffect.current
        break
      default:
        effectRef.current = Tone.getDestination()
    }
  }, [instrumentParams])

  const openInstrumentModal = useCallback(() => {
    setModalType('instrument')
  }, [])

  const noteOff = useCallback((channel, note, midiOutObj, delay, offTime, clockOffset) => {
    if (instrument.current) {
      instrument.current.triggerRelease(offTime ?? undefined)
    }
    if (midiOutObj) {
      const params = {}
      if (offTime) {
        params.time = offTime * 1000 + clockOffset
      }
      midiOutObj.stopNote(note, channel, params)
    }
    setNoteOn(false)
    if (delay) {
      Tone.context.setTimeout(() => {
        notePlaying.current = false
      }, PLAY_NOTE_BUFFER_TIME)
    } else {
      notePlaying.current = false
    }
  }, [])

  // note off when stop playing
  useEffect(() => {
    if (!playing && notePlaying.current && noteIndex.current !== undefined) {
      const channel = customMidiOutChannel ? midiOutChannel : channelNum + 1
      const note = noteString(noteIndex.current)
      const midiOutObj = midiOut ? WebMidi.getOutputByName(midiOut) : null
      Tone.context.clearTimeout(noteOffTimeout.current)
      noteOff(channel, note, midiOutObj, true, Tone.now(), WebMidi.time - Tone.immediate() * 1000)
    }
  }, [channelNum, customMidiOutChannel, midiOut, midiOutChannel, noteOff, playing])

  // note off when muting
  useEffect(() => {
    if (muted && notePlaying.current && noteIndex.current !== undefined) {
      const channel = customMidiOutChannel ? midiOutChannel : channelNum + 1
      const note = noteString(noteIndex.current)
      const midiOutObj = midiOut ? WebMidi.getOutputByName(midiOut) : null
      noteOff(channel, note, midiOutObj, true, null)
    }
  }, [channelNum, customMidiOutChannel, midiOut, midiOutChannel, muted, noteOff])

  // note off when changing channel number
  useEffect(() => {
    if (notePlaying.current && noteIndex.current !== undefined && channelNumRef.current !== channelNum) {
      const channel = customMidiOutChannel ? midiOutChannel : channelNumRef.current + 1
      const note = noteString(noteIndex.current)
      const midiOutObj = midiOutRef.current ? WebMidi.getOutputByName(midiOutRef.current) : null
      noteOff(channel, note, midiOutObj, true, null)
      channelNumRef.current = channelNum
    }
    midiOutRef.current = midiOut
    customMidiOutChannelRef.current = customMidiOutChannel
    midiOutChannelRef.current = midiOutChannel
  }, [channelNum, customMidiOutChannel, midiOut, midiOutChannel, noteOff])

  // loop events

  // play note
  const playNote = useCallback(
    (time) => {
      const note = noteString(noteIndex.current)
      if (!note) return
      const channel = customMidiOutChannel ? midiOutChannel : channelNum + 1
      const midiOutObj = midiOut ? WebMidi.getOutputByName(midiOut) : null
      const clockOffset = WebMidi.time - Tone.immediate() * 1000
      if (notePlaying.current) {
        Tone.context.clearTimeout(noteOffTimeout.current)
        let offNote = noteIndex.current === playingNoteRef.current ? playingNoteRef.current : prevNoteIndex.current
        if (offNote) {
          noteOff(channel, noteString(offNote), midiOutObj, false, time - 0.005, clockOffset)
        }
      }
      if (
        instrumentOn &&
        instrument.current &&
        (!SAMPLER_INSTRUMENTS.includes(instrumentType) || instrument.current.loaded)
      ) {
        instrument.current.triggerAttack(note, time, velocity)
      }
      if (midiOutObj) {
        midiOutObj.playNote(note, channel, { time: time * 1000 + clockOffset, velocity })
      }
      setNoteOn(true)
      setPlayingNote(noteIndex.current)
      notePlaying.current = true
      playingNoteRef.current = noteIndex.current
      // schedule note-off if we are not hold or if the next step is off
      if (!hold || !seqSteps[nextStep.current]) {
        const sustainTime = Math.max(sustain * Tone.Transport.toSeconds(keyRate), 0.08)
        Tone.context.clearTimeout(noteOffTimeout.current)
        noteOffTimeout.current = Tone.context.setTimeout(() => {
          noteOff(channel, note, midiOutObj, false, null)
        }, time - Tone.immediate() + sustainTime)
      }
    },
    [
      customMidiOutChannel,
      midiOutChannel,
      channelNum,
      midiOut,
      instrumentOn,
      instrumentType,
      hold,
      seqSteps,
      noteOff,
      velocity,
      sustain,
      keyRate,
    ]
  )

  const clearPlayNoteBuffer = useCallback(() => {
    // play note
    let notePlayed = false
    if (!muted && !emptyKey && seqSteps[currentStep.current]) {
      if (playNoteBuffer.current.seq && (!hold || !seqSteps[prevStep.current] || !notePlaying.current)) {
        notePlayed = true
        playNote(playNoteBuffer.current.seq.time + PLAY_NOTE_BUFFER_TIME)
      }
      if (
        !notePlayed &&
        playNoteBuffer.current.key &&
        (!notePlaying.current || !(hold && prevNoteIndex.current === noteIndex.current))
      ) {
        playNote(playNoteBuffer.current.key.time + PLAY_NOTE_BUFFER_TIME)
      }
    }
    playNoteBuffer.current = { seq: null, key: null }
  }, [emptyKey, hold, muted, playNote, seqSteps])

  const loadPlayNoteBuffer = useCallback(
    (type, time, interval) => {
      if (!playNoteBuffer.current.seq && !playNoteBuffer.current.key) {
        Tone.context.setTimeout(clearPlayNoteBuffer, PLAY_NOTE_BUFFER_TIME)
      }
      playNoteBuffer.current[type] = { time, interval }
    },
    [clearPlayNoteBuffer]
  )

  // sequence loop
  const seqCallback = useCallback(
    (time, interval) => {
      // console.log('SEQ', time, Tone.immediate())
      prevStep.current = currentStep.current
      if (nextStep.current !== undefined) {
        currentStep.current = nextStep.current
      }
      setPlayingStep(currentStep.current)
      nextStep.current = handleArpMode(
        seqMovement,
        seqLength,
        constrain(currentStep.current, 0, seqLength - 1),
        seqArpUtil,
        seqArpInc1,
        seqArpInc2
      )
      if (!emptyKey && !muted) {
        loadPlayNoteBuffer('seq', time, interval)
      }
    },
    [emptyKey, loadPlayNoteBuffer, muted, seqArpInc1, seqArpInc2, seqMovement, seqLength]
  )
  useLoop(seqCallback, seqRate, tempo, seqSwing, seqSwingLength)

  // key loop
  const keyCallback = useCallback(
    (time, interval) => {
      // console.log('KEY', time, Tone.immediate())
      const pitchRange = rangeMode ? pitchesInRange(rangeStart, rangeEnd, key) : keybdPitches
      if (pitchRange.length) {
        prevNoteIndex.current = noteIndex.current
        if (noteIndex.current !== undefined) {
          let currentPitchIndex = pitchRange.indexOf(noteIndex.current)
          if (currentPitchIndex === -1) {
            currentPitchIndex = pitchRange.indexOf(
              pitchRange.reduce((acc, curr) =>
                Math.abs(noteIndex.current - curr) < Math.abs(noteIndex.current - acc) ? curr : acc
              )
            )
          }
          noteIndex.current =
            pitchRange[
              handleArpMode(keyMovement, pitchRange.length, currentPitchIndex, keyArpUtil, keyArpInc1, keyArpInc2)
            ]
        } else {
          noteIndex.current = pitchRange[0]
        }
        setPlayingPitchClass(noteIndex.current % 12)
        if (!emptyKey && !muted) {
          loadPlayNoteBuffer('key', time, interval)
        }
      }
    },
    [
      emptyKey,
      key,
      keyArpInc1,
      keyArpInc2,
      keyMovement,
      keybdPitches,
      loadPlayNoteBuffer,
      muted,
      rangeEnd,
      rangeMode,
      rangeStart,
    ]
  )
  useLoop(keyCallback, keyRate, tempo, keySwing, keySwingLength)

  // manage key and notes for range and keybd modes

  useEffect(() => {
    if (rangeMode) {
      setKeybdPitches(pitchesInRange(rangeStart, rangeEnd, key))
    }
  }, [key, rangeEnd, rangeMode, rangeStart])

  useEffect(() => {
    if (!rangeMode) {
      if (!keybdPitches.length) {
        setRangeStart(MIDDLE_C)
        setRangeEnd(MIDDLE_C + 12)
      } else {
        setRangeStart(Math.min(...keybdPitches))
        setRangeEnd(Math.max(...keybdPitches) + 1)
      }
    }
  }, [keybdPitches, rangeMode])

  useEffect(() => {
    if (!rangeMode) {
      const newKey = BLANK_PITCH_CLASSES()
      keybdPitches.forEach((note) => {
        newKey[note % 12] = true
      })
      setKey(newKey)
    }
  }, [rangeMode, keybdPitches])

  // key manipulation functions

  const {
    previewShift,
    updateShift,
    doShift,
    doOpposite,
    previewOpposite,
    updateAxis,
    doFlip,
    previewFlip,
    startChangingAxis,
    stopChangingAxis,
    keyClear,
  } = useKeyManipulation(
    key,
    shiftAmt,
    shiftDirectionForward,
    setKeyPreview,
    setShowKeyPreview,
    setShiftAmt,
    setKey,
    setAxis,
    axis,
    setGrabbing,
    setTurningAxisKnob,
    setKeybdPitches
  )

  // ui elements

  const {
    channelNumNormal,
    channelNumAux,
    duplicateDeleteEl,
    keyEl,
    muteSoloEl,
    velocityEl,
    shiftEl,
    axisNormal,
    axisClock,
    flipOppositeEl,
    pianoEl,
    keyRateEl,
    keyMovementEl,
    sustainNormal,
    sustainVertical,
    keySwingNormal,
    keySwingVertical,
    seqLengthNormal,
    seqLengthInline,
    seqRateNormal,
    seqRateInline,
    seqMovementNormal,
    seqMovementInline,
    seqSwingNormal,
    seqSwingInline,
    holdNormal,
    holdInline,
    instrumentNormal,
    instrumentSmall,
    keyViewTypeEl,
    seqRestartEl,
    seqOppositeEl,
    seqOppositeRestartEl,
    notesModeEl,
    midiEl,
    clearResetEl,
    midiInputModeEl,
  } = useUI(
    id.current,
    color,
    channelNum,
    key,
    setKey,
    playingPitchClass,
    setPlayingPitchClass,
    turningAxisKnob,
    keyPreview,
    showKeyPreview,
    mute,
    muted,
    setMute,
    solo,
    setSolo,
    velocity,
    setVelocity,
    setGrabbing,
    grabbing,
    shiftAmt,
    updateShift,
    previewShift,
    setShowKeyPreview,
    setShiftDirectionForward,
    doShift,
    axis,
    updateAxis,
    startChangingAxis,
    stopChangingAxis,
    doFlip,
    previewFlip,
    doOpposite,
    previewOpposite,
    playingNote,
    noteOn,
    rangeStart,
    setRangeStart,
    rangeEnd,
    setRangeEnd,
    resizing,
    setResizing,
    setKeyRate,
    keyRate,
    setKeyMovement,
    keyMovement,
    keyArpInc1,
    setKeyArpInc1,
    keyArpInc2,
    setKeyArpInc2,
    sustain,
    setSustain,
    keySwing,
    setKeySwing,
    keySwingLength,
    setKeySwingLength,
    seqLength,
    setSeqLength,
    setSeqRate,
    seqRate,
    setSeqMovement,
    seqMovement,
    seqArpInc1,
    setSeqArpInc1,
    seqArpInc2,
    setSeqArpInc2,
    seqSwing,
    setSeqSwing,
    seqSwingLength,
    setSeqSwingLength,
    setHold,
    hold,
    instrumentOn,
    setInstrumentOn,
    instrumentType,
    setInstrumentType,
    keyViewType,
    setKeyViewType,
    duplicateChannel,
    deleteChannel,
    drag,
    draggingChannel,
    linearKnobs,
    theme,
    seqRestart,
    seqOpposite,
    rangeMode,
    setRangeMode,
    keybdPitches,
    setKeybdPitches,
    midiIn,
    setMidiIn,
    midiHold,
    setMidiHold,
    keyClear,
    keyRestart,
    openMidiModal,
    openInstrumentModal
  )

  const instruments = useMemo(() => ({ synthInstrument, pianoInstrument, marimbaInstrument, drumsInstrument }), [])
  const effects = useMemo(
    () => ({
      chorusEffect,
      distortionEffect,
      delayEffect,
      reverbEffect,
      vibratoEffect,
    }),
    []
  )
  const modalEl = useMemo(
    () => (
      <CSSTransition in={!!modalType} timeout={300} classNames="show" onEnter={showModal} onExited={hideModal}>
        <Modal
          modalContent={modalContent}
          modalType={modalType}
          setModalType={setModalType}
          midiHold={midiHold}
          setMidiHold={setMidiHold}
          theme={theme}
          customMidiOutChannel={customMidiOutChannel}
          setCustomMidiOutChannel={setCustomMidiOutChannel}
          channelNum={channelNum}
          midiOutChannel={midiOutChannel}
          setMidiOutChannel={setMidiOutChannel}
          instrumentOn={instrumentOn}
          setInstrumentOn={setInstrumentOn}
          instrumentType={instrumentType}
          setInstrumentType={setInstrumentType}
          instrumentParams={instrumentParams}
          setInstrumentParams={setInstrumentParams}
          instruments={instruments}
          effects={effects}
          grabbing={grabbing}
          setGrabbing={setGrabbing}
          linearKnobs={linearKnobs}
        />
      </CSSTransition>
    ),
    [
      channelNum,
      customMidiOutChannel,
      effects,
      grabbing,
      hideModal,
      instrumentOn,
      instrumentParams,
      instrumentType,
      instruments,
      linearKnobs,
      midiHold,
      midiOutChannel,
      modalContent,
      modalType,
      setGrabbing,
      showModal,
      theme,
    ]
  )

  const dragTargetUI = useCallback(
    (horizontal) => {
      const numHorizontalChannels = Math.floor(window.innerWidth / CLOCK_CHANNEL_WIDTH)
      const top = horizontal
        ? (dragTarget - channelNum + (dragTarget > channelNum ? 1 : 0)) * CHANNEL_HEIGHT +
          (dragAuxChannel.current ? numChannels * CHANNEL_HEIGHT : 0)
        : (dragRow - Math.floor(channelNum / numHorizontalChannels)) * CLOCK_CHANNEL_HEIGHT
      let left
      if (horizontal) {
        left = 0
      } else {
        if (dragTarget < dragRow * numHorizontalChannels) {
          left = 0
        } else if (dragTarget > dragRow * numHorizontalChannels + numHorizontalChannels - 1) {
          left = (numHorizontalChannels - (channelNum % numHorizontalChannels)) * CLOCK_CHANNEL_WIDTH
        } else {
          left =
            ((dragTarget % numHorizontalChannels) -
              (channelNum % numHorizontalChannels) +
              (dragTarget > channelNum ? 1 : 0)) *
            CLOCK_CHANNEL_WIDTH
        }
      }
      return (
        <div
          className={classNames('channel-drag-target', {
            'shift-left': !horizontal && dragTarget !== dragRow * numHorizontalChannels,
          })}
          style={{ top, left, backgroundColor: color }}></div>
      )
    },
    [channelNum, color, dragRow, dragTarget, numChannels]
  )

  const dragTargetHorizontal = useMemo(() => dragTargetUI(true), [dragTargetUI])
  const dragTargetBox = useMemo(() => dragTargetUI(false), [dragTargetUI])

  // watch and update state, with debounce

  const channelStateDebounce = useRef()
  useEffect(() => {
    clearTimeout(channelStateDebounce.current)
    const debounceTime = 200
    channelStateDebounce.current = setTimeout(() => {
      const state = {
        id: id.current,
        color,
        channelNum,
        velocity,
        key,
        keyRate,
        keyMovement,
        keyArpInc1,
        keyArpInc2,
        sustain,
        keySwing,
        keySwingLength,
        mute,
        solo,
        shiftAmt,
        axis,
        rangeStart,
        rangeEnd,
        seqSteps,
        seqLength,
        seqRate,
        seqMovement,
        seqArpInc1,
        seqArpInc2,
        seqSwing,
        seqSwingLength,
        hold,
        instrumentOn,
        instrumentType,
        rangeMode,
        keybdPitches,
        midiIn,
        midiHold,
        customMidiOutChannel,
        midiOutChannel,
        instrumentParams,
      }
      setChannelState(id.current, state)
    }, debounceTime)
  }, [
    axis,
    channelNum,
    color,
    customMidiOutChannel,
    instrumentOn,
    instrumentParams,
    instrumentType,
    key,
    keyArpInc1,
    keyArpInc2,
    keyMovement,
    keyRate,
    sustain,
    keySwing,
    keySwingLength,
    keybdPitches,
    hold,
    midiHold,
    midiIn,
    midiOutChannel,
    mute,
    rangeEnd,
    rangeMode,
    rangeStart,
    seqArpInc1,
    seqArpInc2,
    seqMovement,
    seqLength,
    seqRate,
    seqSteps,
    seqSwing,
    seqSwingLength,
    setChannelState,
    shiftAmt,
    solo,
    velocity,
  ])

  const arrowSmallGraphic = useMemo(() => {
    switch (theme) {
      case 'light':
        return arrowSmall
      case 'dark':
        return arrowSmallDark
      case 'contrast':
        return mute ? arrowSmallLightMute : arrowSmallLight
      default:
        return null
    }
  }, [mute, theme])

  const arrowClockGraphic = useMemo(() => {
    switch (theme) {
      case 'light':
        return arrowClock
      case 'dark':
        return arrowClockDark
      case 'contrast':
        return mute ? arrowClockLightMute : arrowClockLight
      default:
        return null
    }
  }, [mute, theme])

  // return based on view

  const stackedView = useMemo(
    () => (
      <CSSTransition
        timeout={400}
        in={true}
        appear={true}
        classNames={{ appear: 'channel-in', appearActive: 'channel-in-active', appearDone: 'channel-in-done' }}>
        <div className={classNames('channel channel-horizontal', { mute: muted })}>
          {channelNumNormal}
          {duplicateDeleteEl}
          <div className="channel-primary">
            {muteSoloEl}
            {midiEl}
          </div>
          {velocityEl}
          {notesModeEl}
          {keyEl}
          <div className="transformations">
            {rangeMode && shiftEl}
            {rangeMode && axisNormal}
            {rangeMode && <img className="arrow-small" src={arrowSmallGraphic} alt="" draggable="false" />}
            {rangeMode && flipOppositeEl}
            {!rangeMode && midiInputModeEl}
            {!rangeMode && clearResetEl}
          </div>
          {pianoEl}
          {keyRateEl}
          {keyMovementEl}
          {sustainNormal}
          {keySwingNormal}
          <div
            style={{ top: numChannels * CHANNEL_HEIGHT }}
            className={classNames('channel channel-horizontal stacked-auxiliary', { mute: muted })}>
            {channelNumAux}
            <Sequencer
              className="channel-module"
              seqSteps={seqSteps}
              setSeqSteps={setSeqSteps}
              seqLength={seqLength}
              playingStep={playingStep}
              showStepNumbers={showStepNumbers}>
              <div className="sequencer-controls">
                {seqLengthInline}
                {seqRateInline}
                {seqMovementInline}
                {seqSwingInline}
                {holdInline}
                {seqRestartEl}
                {seqOppositeEl}
              </div>
            </Sequencer>
            <div className="channel-module border"></div>
            {instrumentNormal}
          </div>
          {draggingChannel && dragTarget !== channelNum && dragTargetHorizontal}
          {modalEl}
        </div>
      </CSSTransition>
    ),
    [
      arrowSmallGraphic,
      axisNormal,
      channelNum,
      channelNumAux,
      channelNumNormal,
      clearResetEl,
      dragTarget,
      dragTargetHorizontal,
      draggingChannel,
      duplicateDeleteEl,
      flipOppositeEl,
      holdInline,
      instrumentNormal,
      keyEl,
      keyMovementEl,
      keyRateEl,
      keySwingNormal,
      midiEl,
      midiInputModeEl,
      modalEl,
      muteSoloEl,
      muted,
      notesModeEl,
      numChannels,
      pianoEl,
      playingStep,
      rangeMode,
      seqLength,
      seqLengthInline,
      seqMovementInline,
      seqOppositeEl,
      seqRateInline,
      seqRestartEl,
      seqSteps,
      seqSwingInline,
      shiftEl,
      showStepNumbers,
      sustainNormal,
      velocityEl,
    ]
  )

  const horizontalView = useMemo(
    () => (
      <CSSTransition
        timeout={400}
        in={true}
        appear={true}
        classNames={{ appear: 'channel-in', appearActive: 'channel-in-active', appearDone: 'channel-in-done' }}>
        <div className={classNames('channel channel-horizontal', { mute: muted })}>
          {channelNumNormal}
          {duplicateDeleteEl}
          <div className="channel-primary">
            {muteSoloEl}
            {midiEl}
          </div>
          {velocityEl}
          {notesModeEl}
          {keyEl}
          <div className="transformations">
            {rangeMode && shiftEl}
            {rangeMode && axisNormal}
            {rangeMode && <img className="arrow-small" src={arrowSmallGraphic} alt="" draggable="false" />}
            {rangeMode && flipOppositeEl}
            {!rangeMode && midiInputModeEl}
            {!rangeMode && clearResetEl}
          </div>
          {pianoEl}
          {keyRateEl}
          {keyMovementEl}
          {sustainNormal}
          {keySwingNormal}
          <div className="channel-module border"></div>
          <Sequencer
            className="channel-module"
            seqSteps={seqSteps}
            setSeqSteps={setSeqSteps}
            seqLength={seqLength}
            playingStep={playingStep}
            showStepNumbers={showStepNumbers}>
            <div className="sequencer-controls">
              {seqLengthInline}
              {seqRateInline}
              {seqMovementInline}
              {seqSwingInline}
              {holdInline}
              {seqRestartEl}
              {seqOppositeEl}
            </div>
          </Sequencer>
          <div className="channel-module border"></div>
          {instrumentNormal}
          {draggingChannel && dragTarget !== channelNum && dragTargetHorizontal}
          {modalEl}
        </div>
      </CSSTransition>
    ),
    [
      arrowSmallGraphic,
      axisNormal,
      channelNum,
      channelNumNormal,
      clearResetEl,
      dragTarget,
      dragTargetHorizontal,
      draggingChannel,
      duplicateDeleteEl,
      flipOppositeEl,
      holdInline,
      instrumentNormal,
      keyEl,
      keyMovementEl,
      keyRateEl,
      keySwingNormal,
      midiEl,
      midiInputModeEl,
      modalEl,
      muteSoloEl,
      muted,
      notesModeEl,
      pianoEl,
      playingStep,
      rangeMode,
      seqLength,
      seqLengthInline,
      seqMovementInline,
      seqOppositeEl,
      seqRateInline,
      seqRestartEl,
      seqSteps,
      seqSwingInline,
      shiftEl,
      showStepNumbers,
      sustainNormal,
      velocityEl,
    ]
  )

  const clockView = useMemo(
    () => (
      <CSSTransition
        timeout={400}
        in={true}
        appear={true}
        classNames={{ appear: 'channel-in', appearActive: 'channel-in-active', appearDone: 'channel-in-done' }}>
        <div className={classNames('channel channel-clock', { mute: muted })}>
          <div className="channel-clock-top">
            {channelNumNormal}
            {duplicateDeleteEl}
            <div className="channel-primary">
              {muteSoloEl}
              {midiEl}
              {velocityEl}
            </div>
            <div className="channel-vertical left-vertical">
              {notesModeEl}
              {rangeMode && shiftEl}
              {rangeMode && flipOppositeEl}
              {!rangeMode && midiInputModeEl}
              {!rangeMode && clearResetEl}
              {/* {keyViewTypeEl} */}
            </div>
            {rangeMode && <img className="arrow-clock" src={arrowClockGraphic} alt="" />}
            {axisClock}
            <div className="channel-vertical">
              {keyMovementEl}
              <div>
                {keyRateEl}
                {sustainVertical}
              </div>
              {keySwingVertical}
            </div>
            <div
              className={classNames('channel-drawer-control', { 'drawer-open': drawerOpen })}
              onClick={toggleDrawerOpen}>
              <div className="arrow-down"></div>
            </div>
          </div>
          <CSSTransition in={drawerOpen} timeout={300} classNames="drawer-open">
            <div className={classNames('channel-clock-bottom', { 'drawer-open': drawerOpen })}>
              <div className="piano-container">{pianoEl}</div>
              <div className="piano-drawer-border"></div>
              <Sequencer
                className="channel-module"
                seqSteps={seqSteps}
                setSeqSteps={setSeqSteps}
                seqLength={seqLength}
                playingStep={playingStep}
                showStepNumbers={showStepNumbers}
              />
              <div className="sequencer-controls">
                {seqLengthNormal}
                {seqRateNormal}
                {seqMovementNormal}
                {seqSwingNormal}
                {holdNormal}
                {seqOppositeRestartEl}
                {instrumentSmall}
              </div>
            </div>
          </CSSTransition>
          {draggingChannel && dragTarget !== channelNum && dragTargetBox}
          {modalEl}
        </div>
      </CSSTransition>
    ),
    [
      arrowClockGraphic,
      axisClock,
      channelNum,
      channelNumNormal,
      clearResetEl,
      dragTarget,
      dragTargetBox,
      draggingChannel,
      drawerOpen,
      duplicateDeleteEl,
      flipOppositeEl,
      holdNormal,
      instrumentSmall,
      keyMovementEl,
      keyRateEl,
      keySwingVertical,
      midiEl,
      midiInputModeEl,
      modalEl,
      muteSoloEl,
      muted,
      notesModeEl,
      pianoEl,
      playingStep,
      rangeMode,
      seqLength,
      seqLengthNormal,
      seqMovementNormal,
      seqOppositeRestartEl,
      seqRateNormal,
      seqSteps,
      seqSwingNormal,
      shiftEl,
      showStepNumbers,
      sustainVertical,
      toggleDrawerOpen,
      velocityEl,
    ]
  )

  switch (view) {
    case 'stacked':
      return stackedView
    case 'horizontal':
      return horizontalView
    case 'clock':
      return clockView
    default:
      return null
  }
}
Channel.propTypes = {
  numChannels: PropTypes.number,
  color: PropTypes.string,
  channelNum: PropTypes.number,
  grabbing: PropTypes.bool,
  setGrabbing: PropTypes.func,
  resizing: PropTypes.bool,
  setResizing: PropTypes.func,
  view: PropTypes.string,
  numChannelsSoloed: PropTypes.number,
  tempo: PropTypes.number,
  playing: PropTypes.bool,
  showStepNumbers: PropTypes.bool,
  linearKnobs: PropTypes.bool,
  midiOut: PropTypes.string,
  setChannelState: PropTypes.func,
  channelPreset: PropTypes.object,
  duplicateChannel: PropTypes.func,
  deleteChannel: PropTypes.func,
  initState: PropTypes.object,
  container: PropTypes.object,
  changeChannelOrder: PropTypes.func,
  theme: PropTypes.string,
  midiNoteOn: PropTypes.object,
  midiNoteOff: PropTypes.object,
}

function updateInstruments(
  synthInstrument,
  samplerInstruments,
  chorusEffect,
  distortionEffect,
  delayEffect,
  reverbEffect,
  vibratoEffect,
  instrumentType,
  instrumentParams,
  currentEffect
) {
  synthInstrument.set({
    portamento: instrumentParams.portamento,
    oscillator: {
      type: SAMPLER_INSTRUMENTS.includes(instrumentType) ? 'triangle' : instrumentType,
      modulationType: instrumentParams.modulationType,
      harmonicity: instrumentParams.harmonicity,
      spread: instrumentParams.fatSpread,
      count: instrumentParams.fatCount,
      width: instrumentParams.pulseWidth,
      modulationFrequency: instrumentParams.pwmFreq,
    },
    envelope: {
      attack: instrumentParams.envAttack,
      decay: instrumentParams.envDecay,
      sustain: instrumentParams.envSustain,
      release: instrumentParams.envRelease,
    },
    filter: {
      Q: instrumentParams.resonance,
      rolloff: instrumentParams.rolloff,
    },
    filterEnvelope: {
      baseFrequency: instrumentParams.cutoff,
      attack: instrumentParams.filterAttack,
      decay: instrumentParams.filterDecay,
      sustain: instrumentParams.filterSustain,
      release: instrumentParams.filterRelease,
      octaves: instrumentParams.filterAmount,
    },
  })
  chorusEffect.set({
    wet: instrumentParams.effectWet,
    depth: instrumentParams.chorusDepth,
    delayTime: instrumentParams.chorusDelayTime,
    frequency: instrumentParams.chorusFreq,
    spread: instrumentParams.chorusSpread,
  })
  distortionEffect.set({
    wet: instrumentParams.effectWet,
    distortion: instrumentParams.distortion,
  })
  delayEffect.set({
    wet: instrumentParams.effectWet,
    delayTime: instrumentParams.delayTime,
    feedback: instrumentParams.delayFeedback,
  })
  reverbEffect.set({
    wet: instrumentParams.effectWet,
    decay: instrumentParams.reverbDecay,
    preDelay: instrumentParams.reverbPreDelay,
  })
  vibratoEffect.set({
    wet: instrumentParams.effectWet,
    depth: instrumentParams.vibratoDepth,
    frequency: instrumentParams.vibratoFreq,
  })
  let effect
  switch (instrumentParams.effectType) {
    case 'chorus':
      effect = chorusEffect
      chorusEffect.start()
      break
    case 'distortion':
      effect = distortionEffect
      break
    case 'delay':
      effect = delayEffect
      break
    case 'reverb':
      effect = reverbEffect
      break
    case 'vibrato':
      effect = vibratoEffect
      break
    default:
      effect = null
  }
  if (currentEffect) {
    synthInstrument.disconnect(currentEffect)
    samplerInstruments.forEach((sampler) => {
      sampler.disconnect(currentEffect)
    })
  }
  if (effect) {
    synthInstrument.connect(effect)
  } else {
    synthInstrument.toDestination()
  }
  if (effect !== 'chorus') {
    chorusEffect.stop()
  }
  samplerInstruments.forEach((sampler) => {
    sampler.set({
      attack: instrumentParams.samplerAttack,
      release: instrumentParams.samplerRelease,
    })
    if (effect) {
      sampler.connect(effect)
    } else {
      sampler.toDestination()
    }
  })
}
