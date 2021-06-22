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
  handleArpMode,
  noteString,
  convertMidiNumber,
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
  hotkeyRestart,
  midiNoteOn,
  midiNoteOff,
}) {
  const id = useRef(initState.id)
  const [velocity, setVelocity] = useState(initState.velocity)
  const [key, setKey] = useState(initState.key)
  const keyRef = useRef()
  const [keyRate, setKeyRate] = useState(initState.keyRate)
  const [keyArpMode, setKeyArpMode] = useState(initState.keyArpMode)
  const [keyArpInc1, setKeyArpInc1] = useState(initState.keyArpInc1)
  const [keyArpInc2, setKeyArpInc2] = useState(initState.keyArpInc2)
  const keyArpUtil = useRef(false)
  const [keySustain, setKeySustain] = useState(initState.keySustain)
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
  const [seqArpMode, setSeqArpMode] = useState(initState.seqArpMode)
  const [seqArpInc1, setSeqArpInc1] = useState(initState.seqArpInc1)
  const [seqArpInc2, setSeqArpInc2] = useState(initState.seqArpInc2)
  const seqArpUtil = useRef(false)
  const [seqSwing, setSeqSwing] = useState(initState.seqSwing)
  const [seqSwingLength, setSeqSwingLength] = useState(initState.seqSwingLength)
  const [seqSustain, setSeqSustain] = useState(initState.seqSustain)
  const [legato, setLegato] = useState(initState.legato)
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
  

  const playNoteBuffer = useRef({ seq: null, key: null })
  const presetInitialized = useRef(false)
  const hotkeyRestartRef = useRef(hotkeyRestart)

  const channelNumRef = useRef(channelNum)
  const midiOutRef = useRef(midiOut)

  const [modalType, setModalType] = useState('')

  const emptyKey = useMemo(() => {
    return !key.some((p) => p)
  }, [key])

  useEffect(() => {
    presetInitialized.current = false
  }, [channelNum])

  useEffect(() => {
    hotkeyRestartRef.current = hotkeyRestart
  }, [hotkeyRestart])

  const seqRestart = useCallback(() => {
    prevStep.current = undefined
    currentStep.current = 0
    nextStep.current = undefined
    setPlayingStep(null)
  }, [])

  const seqOpposite = useCallback(() => {
    setSeqSteps((seqSteps) => seqSteps.map((step) => !step))
  }, [])

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
        setKeybdPitches((keybdPitches) => keybdPitches.filter((p) => p !== noteNumber))
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
        if (hotkeyRestartRef.current) {
          seqRestart()
        }
        setVelocity(channelPreset.velocity)
        setKey(channelPreset.key.slice())
        setKeyRate(channelPreset.keyRate)
        setKeyArpMode(channelPreset.keyArpMode)
        setKeyArpInc1(channelPreset.keyArpInc1)
        setKeyArpInc2(channelPreset.keyArpInc2)
        setKeySustain(channelPreset.keySustain)
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
        setSeqArpMode(channelPreset.seqArpMode)
        setSeqArpInc1(channelPreset.seqArpInc1)
        setSeqArpInc2(channelPreset.seqArpInc2)
        setSeqSwing(channelPreset.seqSwing)
        setSeqSwingLength(channelPreset.seqSwingLength)
        setSeqSustain(channelPreset.seqSustain)
        setLegato(channelPreset.legato)
        setInstrumentOn(channelPreset.instrumentOn)
        setInstrumentType(channelPreset.instrumentType)
        setRangeMode(channelPreset.rangeMode)
        setKeybdPitches(channelPreset.keybdPitches)
        setMidiIn(channelPreset.midiIn)
        setMidiHold(channelPreset.midiHold)
      }
    }
  }, [channelPreset, seqRestart])

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

  useEffect(() => {
    const samplerInstruments = ['drums', 'piano', 'marimba']
    synthInstrument.current = new Tone.MonoSynth({
      oscillator: {
        type: samplerInstruments.includes(initInstrumentType.current) ? 'triangle' : initInstrumentType.current,
      },
      envelope: {
        attack: 0.05,
      },
      filterEnvelope: {
        attack: 0,
        baseFrequency: 3000,
      },
    }).toDestination()
    pianoInstrument.current = new Tone.Sampler({
      urls: {
        C2: 'Ensoniq-SQ-2-Piano-C2.mp3',
        C4: 'Ensoniq-SQ-2-Piano-C4.mp3',
        C7: 'Ensoniq-SQ-2-Piano-C7.mp3',
      },
      baseUrl: window.location.origin + '/samples/piano/',
    }).toDestination()
    marimbaInstrument.current = new Tone.Sampler({
      urls: {
        C4: 'Roland-SC-88-Marimba-C4.mp3',
      },
      baseUrl: window.location.origin + '/samples/marimba/',
    }).toDestination()
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
    }).toDestination()
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
      synthInstrument.current.dispose()
      marimbaInstrument.current.dispose()
      pianoInstrument.current.dispose()
      drumsInstrument.current.dispose()
    }
  }, [])

  useEffect(() => {
    instrument.current.triggerRelease()
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

  const noteOff = useCallback((channel, note, midiOutObj, delay, offTime, clockOffset) => {
    instrument.current.triggerRelease(offTime ?? undefined)
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
      const channel = channelNum + 1
      const note = noteString(noteIndex.current)
      const midiOutObj = midiOut ? WebMidi.getOutputByName(midiOut) : null
      Tone.context.clearTimeout(noteOffTimeout.current)
      noteOff(channel, note, midiOutObj, true, Tone.now(), WebMidi.time - Tone.immediate() * 1000)
    }
  }, [channelNum, midiOut, noteOff, playing])

  // note off when muting
  useEffect(() => {
    if (muted && notePlaying.current && noteIndex.current !== undefined) {
      const channel = channelNum + 1
      const note = noteString(noteIndex.current)
      const midiOutObj = midiOut ? WebMidi.getOutputByName(midiOut) : null
      noteOff(channel, note, midiOutObj, true, null)
    }
  }, [channelNum, midiOut, muted, noteOff])

  // note off when changing channel number
  useEffect(() => {
    if (notePlaying.current && noteIndex.current !== undefined) {
      const channel = channelNumRef.current + 1
      const note = noteString(noteIndex.current)
      const midiOutObj = midiOutRef.current ? WebMidi.getOutputByName(midiOutRef.current) : null
      noteOff(channel, note, midiOutObj, true, null)
    }
    channelNumRef.current = channelNum
    midiOutRef.current = midiOut
  }, [channelNum, midiOut, noteOff])

  // loop events

  // play note
  const playNote = useCallback(
    (time, interval, sustain) => {
      const note = noteString(noteIndex.current)
      if (!note) return
      const channel = channelNum + 1
      const midiOutObj = midiOut ? WebMidi.getOutputByName(midiOut) : null
      const clockOffset = WebMidi.time - Tone.immediate() * 1000
      if (notePlaying.current) {
        Tone.context.clearTimeout(noteOffTimeout.current)
        let offNote = noteIndex.current === playingNoteRef.current ? playingNoteRef.current : prevNoteIndex.current
        if (offNote) {
          noteOff(channel, noteString(offNote), midiOutObj, false, time - 0.005, clockOffset)
        }
      }
      if (instrumentOn) {
        instrument.current.triggerAttack(note, time, velocity)
      }
      if (midiOutObj) {
        midiOutObj.playNote(note, channel, { time: time * 1000 + clockOffset, velocity })
      }
      setNoteOn(true)
      setPlayingNote(noteIndex.current)
      notePlaying.current = true
      playingNoteRef.current = noteIndex.current
      // schedule note-off if we are not legato or if the next step is off
      if (!legato || !seqSteps[nextStep.current]) {
        const sustainTime = Math.max(sustain * interval, 0.08)
        Tone.context.clearTimeout(noteOffTimeout.current)
        noteOffTimeout.current = Tone.context.setTimeout(() => {
          noteOff(channel, note, midiOutObj, false, null)
        }, time - Tone.immediate() + sustainTime)
      }
    },
    [channelNum, midiOut, legato, seqSteps, noteOff, instrumentOn, velocity]
  )

  const clearPlayNoteBuffer = useCallback(() => {
    // play note
    let notePlayed = false
    if (!muted && !emptyKey && seqSteps[currentStep.current]) {
      if (playNoteBuffer.current.seq && (!legato || !seqSteps[prevStep.current] || !notePlaying.current)) {
        notePlayed = true
        playNote(
          playNoteBuffer.current.seq.time + PLAY_NOTE_BUFFER_TIME,
          playNoteBuffer.current.seq.interval,
          seqSustain
        )
      }
      if (
        !notePlayed &&
        playNoteBuffer.current.key &&
        (!notePlaying.current || !(legato && prevNoteIndex.current === noteIndex.current))
      ) {
        playNote(
          playNoteBuffer.current.key.time + PLAY_NOTE_BUFFER_TIME,
          playNoteBuffer.current.key.interval,
          keySustain
        )
      }
    }
    playNoteBuffer.current = { seq: null, key: null }
  }, [emptyKey, keySustain, legato, muted, playNote, seqSteps, seqSustain])

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
        seqArpMode,
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
    [emptyKey, loadPlayNoteBuffer, muted, seqArpInc1, seqArpInc2, seqArpMode, seqLength]
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
              handleArpMode(keyArpMode, pitchRange.length, currentPitchIndex, keyArpUtil, keyArpInc1, keyArpInc2)
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
      keyArpMode,
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
    clearNotes,
    restartNotes,
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
    setKeybdPitches,
    setPlayingNote,
    setPlayingPitchClass,
    playingNoteRef,
    noteIndex,
    prevNoteIndex
  )

  // ui elements

  const {
    channelNumEl,
    duplicateDeleteEl,
    keyEl,
    muteSoloEl,
    velocityEl,
    shiftEl,
    axisEl,
    flipOppositeEl,
    pianoEl,
    keyRateEl,
    keyArpModeEl,
    keySustainEl,
    keySwingEl,
    seqLengthEl,
    seqRateEl,
    seqArpModeEl,
    seqSwingEl,
    seqSustainEl,
    legatoEl,
    instrumentEl,
    keyViewTypeEl,
    seqRestartEl,
    seqOppositeEl,
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
    setKeyArpMode,
    keyArpMode,
    keyArpInc1,
    setKeyArpInc1,
    keyArpInc2,
    setKeyArpInc2,
    keySustain,
    setKeySustain,
    keySwing,
    setKeySwing,
    keySwingLength,
    setKeySwingLength,
    seqLength,
    setSeqLength,
    setSeqRate,
    seqRate,
    setSeqArpMode,
    seqArpMode,
    seqArpInc1,
    setSeqArpInc1,
    seqArpInc2,
    setSeqArpInc2,
    seqSwing,
    setSeqSwing,
    seqSwingLength,
    setSeqSwingLength,
    seqSustain,
    setSeqSustain,
    setLegato,
    legato,
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
    clearNotes,
    restartNotes,
    openMidiModal
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
        keyArpMode,
        keyArpInc1,
        keyArpInc2,
        keySustain,
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
        seqArpMode,
        seqArpInc1,
        seqArpInc2,
        seqSwing,
        seqSwingLength,
        seqSustain,
        legato,
        instrumentOn,
        instrumentType,
        rangeMode,
        keybdPitches,
        midiIn,
        midiHold,
      }
      setChannelState(id.current, state)
    }, debounceTime)
  }, [
    axis,
    channelNum,
    color,
    instrumentOn,
    instrumentType,
    key,
    keyArpInc1,
    keyArpInc2,
    keyArpMode,
    keyRate,
    keySustain,
    keySwing,
    keySwingLength,
    keybdPitches,
    legato,
    midiHold,
    midiIn,
    mute,
    rangeEnd,
    rangeMode,
    rangeStart,
    seqArpInc1,
    seqArpInc2,
    seqArpMode,
    seqLength,
    seqRate,
    seqSteps,
    seqSustain,
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

  if (view === 'stacked') {
    return (
      <CSSTransition
        timeout={400}
        in={true}
        appear={true}
        classNames={{ appear: 'channel-in', appearActive: 'channel-in-active', appearDone: 'channel-in-done' }}>
        <div className={classNames('channel channel-horizontal', { mute: muted })}>
          {channelNumEl(false)}
          {duplicateDeleteEl}
          <div className="channel-primary">
            {muteSoloEl}
            {midiEl}
          </div>
          {velocityEl}
          {keyEl}
          <div className="transformations">
            {rangeMode && shiftEl}
            {rangeMode && axisEl(false)}
            {rangeMode && <img className="arrow-small" src={arrowSmallGraphic} alt="" draggable="false" />}
            {rangeMode && flipOppositeEl}
            {!rangeMode && clearResetEl}
            {!rangeMode && midiInputModeEl}
          </div>
          {notesModeEl}
          {pianoEl}
          {keyRateEl}
          {keyArpModeEl}
          {keySustainEl(false)}
          {keySwingEl(false)}
          <div
            style={{ top: numChannels * CHANNEL_HEIGHT }}
            className={classNames('channel channel-horizontal stacked-auxiliary', { mute: muted })}>
            {channelNumEl(true)}
            <Sequencer
              className="channel-module"
              seqSteps={seqSteps}
              setSeqSteps={setSeqSteps}
              seqLength={seqLength}
              playingStep={playingStep}
              showStepNumbers={showStepNumbers}>
              <div className="sequencer-controls">
                {seqLengthEl(true)}
                {seqRateEl(true)}
                {seqArpModeEl(true)}
                {seqSustainEl(true)}
                {seqSwingEl(true)}
                {legatoEl(true)}
                {seqRestartEl}
                {seqOppositeEl}
              </div>
            </Sequencer>
            <div className="channel-module border"></div>
            {instrumentEl(false)}
          </div>
          {draggingChannel && dragTarget !== channelNum && dragTargetUI(true)}
          <CSSTransition in={!!modalType} timeout={300} classNames="show">
            <Modal
              modalType={modalType}
              setModalType={setModalType}
              midiHold={midiHold}
              setMidiHold={setMidiHold}
              theme={theme}
            />
          </CSSTransition>
        </div>
      </CSSTransition>
    )
  } else if (view === 'horizontal') {
    return (
      <CSSTransition
        timeout={400}
        in={true}
        appear={true}
        classNames={{ appear: 'channel-in', appearActive: 'channel-in-active', appearDone: 'channel-in-done' }}>
        <div className={classNames('channel channel-horizontal', { mute: muted })}>
          {channelNumEl(false)}
          {duplicateDeleteEl}
          <div className="channel-primary">
            {muteSoloEl}
            {midiEl}
          </div>
          {velocityEl}
          {keyEl}
          <div className="transformations">
            {rangeMode && shiftEl}
            {rangeMode && axisEl(false)}
            {rangeMode && <img className="arrow-small" src={arrowSmallGraphic} alt="" draggable="false" />}
            {rangeMode && flipOppositeEl}
            {!rangeMode && clearResetEl}
            {!rangeMode && midiInputModeEl}
          </div>
          {notesModeEl}
          {pianoEl}
          {keyRateEl}
          {keyArpModeEl}
          {keySustainEl(false)}
          {keySwingEl(false)}
          <div className="channel-module border"></div>
          <Sequencer
            className="channel-module"
            seqSteps={seqSteps}
            setSeqSteps={setSeqSteps}
            seqLength={seqLength}
            playingStep={playingStep}
            showStepNumbers={showStepNumbers}>
            <div className="sequencer-controls">
              {seqLengthEl(true)}
              {seqRateEl(true)}
              {seqArpModeEl(true)}
              {seqSustainEl(true)}
              {seqSwingEl(true)}
              {legatoEl(true)}
              {seqRestartEl}
              {seqOppositeEl}
            </div>
          </Sequencer>
          <div className="channel-module border"></div>
          {instrumentEl(false)}
          {draggingChannel && dragTarget !== channelNum && dragTargetUI(true)}
        </div>
      </CSSTransition>
    )
  } else if (view === 'clock') {
    return (
      <CSSTransition
        timeout={400}
        in={true}
        appear={true}
        classNames={{ appear: 'channel-in', appearActive: 'channel-in-active', appearDone: 'channel-in-done' }}>
        <div className={classNames('channel channel-clock', { mute: muted })}>
          <div className="channel-clock-top">
            {channelNumEl(false)}
            {duplicateDeleteEl}
            <div className="channel-primary">
              {muteSoloEl}
              {midiEl}
              {velocityEl}
            </div>
            <div className="channel-vertical left-vertical">
              {rangeMode && flipOppositeEl}
              {rangeMode && shiftEl}
              {!rangeMode && clearResetEl}
              {!rangeMode && midiInputModeEl}
              {/* {keyViewTypeEl} */}
              {notesModeEl}
            </div>
            {rangeMode && <img className="arrow-clock" src={arrowClockGraphic} alt="" />}
            {axisEl(true)}
            <div className="channel-vertical">
              {keyArpModeEl}
              <div>
                {keyRateEl}
                {keySustainEl(true)}
              </div>
              {keySwingEl(true)}
            </div>
            <div
              className={classNames('channel-drawer-control', { 'drawer-open': drawerOpen })}
              onClick={() => {
                setDrawerOpen((drawerOpen) => !drawerOpen)
              }}>
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
                {seqLengthEl(false)}
                {seqRateEl(false)}
                {seqArpModeEl(false)}
                {seqSustainEl(false)}
                {seqSwingEl(false)}
                {legatoEl(false)}
                {instrumentEl(true)}
              </div>
            </div>
          </CSSTransition>
          {draggingChannel && dragTarget !== channelNum && dragTargetUI(false)}
        </div>
      </CSSTransition>
    )
  }
  return null
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
  hotkeyRestart: PropTypes.bool,
  midiNoteOn: PropTypes.object,
  midiNoteOff: PropTypes.object,
}
