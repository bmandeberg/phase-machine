/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useMemo, useRef, useEffect, RefObject } from 'react'
import * as Tone from 'tone'
import { WebMidi } from 'webmidi'
import { CSSTransition } from 'react-transition-group'
import { useGesture } from '@use-gesture/react'
import {
  BLANK_PITCH_CLASSES,
  CHANNEL_HEIGHT,
  PLAY_NOTE_BUFFER_TIME,
  MIDDLE_C,
  handleArpMode,
  noteString,
  convertMidiNumber,
  OCTAVES,
  SUSTAIN_MIN,
  KNOB_MAX,
} from '../globals'
import { pitchesInRange, constrain, scaleToRange, shiftSeq, rateToSeconds } from '../math'
import classNames from 'classnames'
import Modal from './Modal'
import StackedView from './channel/StackedView'
import HorizontalView from './channel/HorizontalView'
import ClockView from './channel/ClockView'
import useLoop from '../hooks/useLoop'
import useKeyManipulation from '../hooks/useKeyManipulation'
import useUI from '../hooks/useUI'
import useInstruments, { updateInstruments } from '../hooks/useInstruments'
import arrowSmall from '../assets/arrow-small.svg'
import arrowSmallDark from '../assets/arrow-small-dark.svg'
import arrowSmallLight from '../assets/arrow-small-light.svg'
import arrowSmallLightMute from '../assets/arrow-small-light-mute.svg'
import arrowClock from '../assets/arrow-clock.svg'
import arrowClockDark from '../assets/arrow-clock-dark.svg'
import arrowClockLight from '../assets/arrow-clock-light.svg'
import arrowClockLightMute from '../assets/arrow-clock-light-mute.svg'
import { Channel as ChannelType, Setter, MidiNoteEvent } from '../types'
import './Channel.scss'

const CLOCK_CHANNEL_WIDTH = 657
const CLOCK_CHANNEL_HEIGHT = 262
const SAMPLE_MAX_TIME = 5

interface ChannelProps {
  numChannels: number
  color: string
  channelNum: number
  setGrabbing: Setter<boolean>
  grabbing: boolean
  resizing: boolean
  setResizing: Setter<boolean>
  view: string
  numChannelsSoloed: number
  tempo: number
  playing: boolean
  showStepNumbers: boolean
  midiOut: string | null
  setChannelState: (id: string, state: ChannelType) => void
  channelPreset?: ChannelType
  duplicateChannel: (id: string) => void
  deleteChannel: (id: string) => void
  initState: ChannelType
  container: RefObject<HTMLDivElement | null>
  changeChannelOrder: (channelNum: number, newChannelNum: number) => void
  theme: string
  midiNoteOn: MidiNoteEvent | null
  midiNoteOff: MidiNoteEvent | null
  restartChannels: boolean
  resetTransport: boolean
  preventUpdate: boolean | undefined
  longestSequence: number
  defaultChannelModeKeybd?: boolean
}

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
  restartChannels,
  resetTransport,
  preventUpdate,
  longestSequence,
}: ChannelProps) {
  const id = useRef(initState.id)
  const [scribbler, setScribbler] = useState(initState.scribbler)
  const [velocity, setVelocity] = useState(initState.velocity)
  const [key, setKey] = useState(initState.key)
  const keyRef = useRef<any>(undefined)
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
  const [playingPitchClass, setPlayingPitchClass] = useState<any>()
  const [playingNote, setPlayingNote] = useState<any>()
  const playingNoteRef = useRef<any>(undefined)
  const noteIndex = useRef<any>(undefined)
  const prevNoteIndex = useRef<any>(undefined)
  // nodeRef for react-transition-group (replaces findDOMNode, removed in React 19).
  // The per-view transition refs now live inside the view components themselves.
  const modalNodeRef = useRef<HTMLDivElement>(null)
  const [noteOn, setNoteOn] = useState(false)
  const notePlaying = useRef(false)
  const noteOffTimeout = useRef<any>(undefined)
  const noNoteOffScheduled = useRef(false)
  const [seqSteps, setSeqSteps] = useState(initState.seqSteps)
  const [seqLength, setSeqLength] = useState(initState.seqLength)
  const [seqShiftAmt, setSeqShiftAmt] = useState(initState.seqShiftAmt)
  const [seqShiftDirectionForward, setSeqShiftDirectionForward] = useState(true)
  const [seqPreview, setSeqPreview] = useState<boolean[]>(initState.seqSteps)
  const [showSeqPreview, setShowSeqPreview] = useState(false)
  // Sequencer shift, mirroring the key shift: a non-zero amount (skips 0 like the
  // key) that rotates the active steps, with a live preview of the result.
  const previewSeqShift = useCallback(
    (forward = seqShiftDirectionForward, newShift = seqShiftAmt, previewSteps = seqSteps) => {
      if (newShift === 0) newShift = forward ? 1 : -1
      setSeqPreview(shiftSeq(newShift, previewSteps, seqLength))
      setShowSeqPreview(true)
    },
    [seqShiftAmt, seqShiftDirectionForward, seqSteps, seqLength]
  )
  const updateSeqShift = useCallback(
    (newShift: number) => {
      if (newShift === 0) newShift = seqShiftDirectionForward ? 1 : -1
      setSeqShiftAmt(newShift)
      previewSeqShift(seqShiftDirectionForward, newShift)
    },
    [previewSeqShift, seqShiftDirectionForward]
  )
  const doSeqShift = useCallback(() => {
    const shifted = shiftSeq(seqShiftAmt, seqSteps, seqLength)
    setSeqSteps(shifted)
    previewSeqShift(seqShiftDirectionForward, seqShiftAmt, shifted)
  }, [seqShiftAmt, seqSteps, seqLength, previewSeqShift, seqShiftDirectionForward])
  const [playingStep, setPlayingStep] = useState<any>()
  const prevStep = useRef<any>(undefined)
  const currentStep = useRef<any>(undefined)
  const nextStep = useRef<any>(undefined)
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
  const rangeModeRef = useRef<any>(undefined)
  const [keybdPitches, setKeybdPitches] = useState(initState.keybdPitches)
  const keybdPitchesRef = useRef<any>(undefined)

  const [midiIn, setMidiIn] = useState(initState.midiIn)
  const midiInRef = useRef<any>(undefined)
  const [midiHold, setMidiHold] = useState(initState.midiHold)
  const midiHoldRef = useRef<any>(undefined)
  const [customMidiOutChannel, setCustomMidiOutChannel] = useState(initState.customMidiOutChannel)
  const customMidiOutChannelRef = useRef(customMidiOutChannel)
  const [midiOutChannel, setMidiOutChannel] = useState(initState.midiOutChannel)
  const midiOutChannelRef = useRef(midiOutChannel)
  const midiOutRef = useRef(midiOut)

  // instrument params
  const [instrumentParams, setInstrumentParams] = useState(initState.instrumentParams)

  const [modalContent, setModalContent] = useState(false)
  const showModal = useCallback(() => {
    setModalContent(true)
  }, [])
  const hideModal = useCallback(() => {
    setModalContent(false)
  }, [])

  const playNoteBuffer = useRef<any>({ seq: null, key: null })
  const presetInitialized = useRef<any>(undefined)

  const channelNumRef = useRef(channelNum)
  const [modalType, setModalType] = useState<any>('')

  const [updateOnce, setUpdateOnce] = useState(false)

  const toggleDrawerOpen = useCallback(() => {
    setDrawerOpen((drawerOpen) => !drawerOpen)
  }, [])

  const emptyKey = useMemo(() => {
    return !key.some((p: any) => p)
  }, [key])

  useEffect(() => {
    if (preventUpdate !== undefined && presetInitialized.current !== undefined) {
      presetInitialized.current = !preventUpdate
    }
  }, [preventUpdate])

  const seqOpposite = useCallback(() => {
    setSeqSteps((seqSteps: any) => seqSteps.map((step: any, i: number) => (i < seqLength ? !step : step)))
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
          setKey((key: any) => {
            const keyCopy = key.slice()
            keyCopy[pitchClassIndex] = true
            return keyCopy
          })
        } else {
          setKey((key: any) => {
            const keyCopy = key.slice()
            keyCopy[pitchClassIndex] = false
            return keyCopy
          })
        }
      } else {
        const noteNumber = convertMidiNumber(midiNoteOn.note.number)
        if (noteNumber >= 0 && noteNumber < OCTAVES * 12) {
          if (midiHoldRef.current || !keybdPitchesRef.current.includes(noteNumber)) {
            setKeybdPitches((keybdPitches: any) => {
              const keybdPitchesCopy = keybdPitches.slice()
              keybdPitchesCopy.push(noteNumber)
              return keybdPitchesCopy.sort()
            })
          } else {
            setKeybdPitches((keybdPitches: any) => keybdPitches.filter((p: any) => p !== noteNumber))
          }
        }
      }
    }
  }, [midiNoteOn])

  useEffect(() => {
    if (midiInRef.current && midiNoteOff && midiHoldRef.current) {
      if (rangeModeRef.current) {
        const pitchClassIndex = midiNoteOff.note.number % 12
        setKey((key: any) => {
          const keyCopy = key.slice()
          keyCopy[pitchClassIndex] = false
          return keyCopy
        })
      } else {
        const noteNumber = convertMidiNumber(midiNoteOff.note.number)
        if (noteNumber >= 0 && noteNumber < OCTAVES * 12) {
          setKeybdPitches((keybdPitches: any) => keybdPitches.filter((p: any) => p !== noteNumber))
        }
      }
    }
  }, [midiNoteOff])

  const openMidiModal = useCallback(() => {
    setModalType('MIDI')
  }, [])

  useEffect(() => {
    if (updateOnce) {
      setUpdateOnce(false)
    }
  }, [updateOnce])

  const muted = useMemo(() => mute || (numChannelsSoloed > 0 && !solo), [mute, numChannelsSoloed, solo])

  // channel dragging

  const dragChannel = useRef(channelNum)
  const dragAuxChannel = useRef(false)
  const drag = useGesture({
    onDrag: ({ event, xy: [x, y] }) => {
      let hoveredChannel: any
      if (view === 'stacked' || view === 'horizontal') {
        const topOffset =
          62 +
          ((event.target as HTMLElement).classList.contains('auxiliary') ? numChannels * CHANNEL_HEIGHT : 0) -
          container.current!.scrollTop
        hoveredChannel = constrain(Math.round((y - topOffset) / CHANNEL_HEIGHT), 0, numChannels)
        if (hoveredChannel !== dragChannel.current) {
          dragChannel.current = hoveredChannel
          setDragTarget(hoveredChannel > channelNum ? hoveredChannel - 1 : hoveredChannel)
        }
      } else if (view === 'clock') {
        const topOffset = 62 - container.current!.scrollTop
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
      dragAuxChannel.current = (event.target as HTMLElement).classList.contains('auxiliary')
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

  const instrument = useRef<any>(undefined)

  const cleanupInstruments = useCallback(() => {
    if (notePlaying.current && noteIndex.current !== undefined) {
      Tone.getContext().clearTimeout(noteOffTimeout.current)
      if (instrument.current) {
        // PolySynth (poly mode) releases by note, so drop all voices instead.
        if (instrument.current instanceof Tone.PolySynth) {
          instrument.current.releaseAll()
        } else {
          instrument.current.triggerRelease()
        }
      }
      const channel = customMidiOutChannelRef.current ? midiOutChannelRef.current : channelNumRef.current + 1
      const note = noteString(noteIndex.current)
      const midiOutObj = midiOutRef.current ? (WebMidi.getOutputByName(midiOutRef.current) as any) : null
      if (midiOutObj) {
        midiOutObj.stopNote(note, { channels: channel })
      }
    }
  }, [instrument])

  const {
    gainNode,
    pannerNode,
    synthInstrument,
    pianoInstrument,
    marimbaInstrument,
    drumsInstrument,
    drumMachineInstrument,
    bassInstrument,
    vibesInstrument,
    harpInstrument,
    choralInstrument,
    chorusEffect,
    distortionEffect,
    delayEffect,
    reverbEffect,
    vibratoEffect,
    getCurrentEffect,
    openInstrumentModal,
    instruments,
    effects,
  } = useInstruments(instrument, instrumentParams, instrumentType, cleanupInstruments, setModalType)

  // Keep a tempo-synced delay locked to the global tempo even while the instrument
  // modal (where useEffectParams lives) is closed. syncDelayTime holds the note rate
  // (e.g. '8n') when synced; recompute the delay seconds from the current tempo and
  // push it to the live node + instrumentParams so it persists.
  useEffect(() => {
    if (typeof instrumentParams.syncDelayTime === 'string' && delayEffect.current) {
      const seconds = rateToSeconds(instrumentParams.syncDelayTime, tempo)
      delayEffect.current.set({ delayTime: seconds })
      setInstrumentParams((params) =>
        params.delayTime === seconds ? params : Object.assign({}, params, { delayTime: seconds })
      )
    }
  }, [tempo, instrumentParams.syncDelayTime, delayEffect])

  const noteOff = useCallback(
    (channel: any, note: any, midiOutObj: any, delay?: any, offTime?: any, clockOffset?: any) => {
      // In poly mode the synth voice self-releases (triggerAttackRelease), so we
      // must not cut it here — that would defeat overlapping notes ringing out.
      if (instrument.current && instrumentType === 'synth' && !instrumentParams.poly) {
        instrument.current.triggerRelease(offTime ?? undefined)
      }
      if (midiOutObj) {
        const params: any = {}
        if (offTime) {
          params.time = offTime * 1000 + clockOffset
        }
        midiOutObj.stopNote(note, { channels: channel, ...params })
      }
      setNoteOn(false)
      if (delay) {
        Tone.getContext().setTimeout(() => {
          notePlaying.current = false
        }, PLAY_NOTE_BUFFER_TIME)
      } else {
        notePlaying.current = false
      }
    },
    [instrument, instrumentType, instrumentParams.poly]
  )

  const getChannelData = useCallback(() => {
    const channel = customMidiOutChannel ? midiOutChannel : channelNum + 1
    const note = noteString(noteIndex.current)
    const midiOutObj = midiOut ? (WebMidi.getOutputByName(midiOut) as any) : null
    const clockOffset = WebMidi.time - Tone.immediate() * 1000
    return { channel, note, midiOutObj, clockOffset }
  }, [channelNum, customMidiOutChannel, midiOut, midiOutChannel])

  // note off when stop playing
  useEffect(() => {
    if (!playing && notePlaying.current && noteIndex.current !== undefined) {
      const { channel, note, midiOutObj } = getChannelData()
      Tone.getContext().clearTimeout(noteOffTimeout.current)
      noteOff(channel, note, midiOutObj, true, Tone.now(), WebMidi.time - Tone.immediate() * 1000)
    }
  }, [getChannelData, noteOff, playing])

  // note off when muting
  useEffect(() => {
    if (muted && notePlaying.current && noteIndex.current !== undefined) {
      const { channel, note, midiOutObj } = getChannelData()
      noteOff(channel, note, midiOutObj, true, null)
    }
  }, [getChannelData, muted, noteOff])

  // note off when changing channel number
  useEffect(() => {
    if (notePlaying.current && noteIndex.current !== undefined && channelNumRef.current !== channelNum) {
      const channel = customMidiOutChannel ? midiOutChannel : channelNumRef.current + 1
      const note = noteString(noteIndex.current)
      const midiOutObj = midiOutRef.current ? (WebMidi.getOutputByName(midiOutRef.current) as any) : null
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
    (time: any) => {
      const { channel, note, midiOutObj, clockOffset } = getChannelData()
      if (!note) return
      if (notePlaying.current) {
        Tone.getContext().clearTimeout(noteOffTimeout.current)
        let offNote = noteIndex.current === playingNoteRef.current ? playingNoteRef.current : prevNoteIndex.current
        if (offNote) {
          noNoteOffScheduled.current = false
          noteOff(channel, noteString(offNote), midiOutObj, false, time - 0.005, clockOffset)
        }
      }
      const unheldNote = !hold || !seqSteps[nextStep.current]
      const sustainTime = Math.max(sustain * rateToSeconds(keyRate, Tone.getTransport().bpm.value), 0.08)
      if (instrumentOn && instrument.current && (instrumentType === 'synth' || instrument.current.loaded)) {
        if (instrumentType !== 'synth') {
          instrument.current.triggerAttackRelease(
            note,
            unheldNote ? scaleToRange(sustain, SUSTAIN_MIN, KNOB_MAX, 0.05, SAMPLE_MAX_TIME) : SAMPLE_MAX_TIME,
            time,
            velocity
          )
        } else if (instrumentParams.poly) {
          // Poly synth self-releases per voice so notes can overlap; match the
          // note length the mono path would have scheduled (its sustainTime).
          instrument.current.triggerAttackRelease(note, unheldNote ? sustainTime : SAMPLE_MAX_TIME, time, velocity)
        } else {
          instrument.current.triggerAttack(note, time, velocity)
        }
      }
      if (midiOutObj) {
        midiOutObj.playNote(note, { channels: channel, time: time * 1000 + clockOffset, attack: velocity })
      }
      setNoteOn(true)
      setPlayingNote(noteIndex.current)
      notePlaying.current = true
      playingNoteRef.current = noteIndex.current
      // schedule note-off if we are not hold or if the next step is off
      if (unheldNote) {
        Tone.getContext().clearTimeout(noteOffTimeout.current)
        noteOffTimeout.current = Tone.getContext().setTimeout(() => {
          noteOff(channel, note, midiOutObj, false, null)
        }, time - Tone.immediate() + sustainTime)
      } else {
        noNoteOffScheduled.current = true
      }
    },
    [
      getChannelData,
      hold,
      instrument,
      instrumentOn,
      instrumentType,
      instrumentParams.poly,
      keyRate,
      noteOff,
      seqSteps,
      sustain,
      velocity,
    ]
  )

  // fire individual notes, like on an ALT+Click
  const triggerNote = useCallback(
    (i: number, callback: any) => {
      const note = noteString(i)
      if (!note) return
      const channel = customMidiOutChannel ? midiOutChannel : channelNum + 1
      const midiOutObj = midiOut ? (WebMidi.getOutputByName(midiOut) as any) : null
      const sustainTime = Math.max(sustain * rateToSeconds(keyRate, Tone.getTransport().bpm.value), 0.08)
      if (instrumentOn && instrument.current && (instrumentType === 'synth' || instrument.current.loaded)) {
        if (instrumentType !== 'synth') {
          instrument.current.triggerAttackRelease(
            note,
            scaleToRange(sustain, SUSTAIN_MIN, KNOB_MAX, 0.05, SAMPLE_MAX_TIME),
            undefined,
            velocity
          )
        } else if (instrumentParams.poly) {
          instrument.current.triggerAttackRelease(note, sustainTime, undefined, velocity)
        } else {
          instrument.current.triggerAttack(note, undefined, velocity)
        }
      }
      if (midiOutObj) {
        midiOutObj.playNote(note, { channels: channel, attack: velocity })
      }
      Tone.getContext().setTimeout(() => {
        // Poly preview notes self-release via triggerAttackRelease above.
        if (instrument.current && instrumentType === 'synth' && !instrumentParams.poly) {
          instrument.current.triggerRelease()
        }
        if (midiOutObj) {
          midiOutObj.stopNote(note, { channels: channel })
        }
        callback()
      }, sustainTime)
    },
    [
      channelNum,
      customMidiOutChannel,
      instrument,
      instrumentOn,
      instrumentType,
      instrumentParams.poly,
      keyRate,
      midiOut,
      midiOutChannel,
      sustain,
      velocity,
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
    // while holding, ensure notes are turned off when the sequence is off
    if (noNoteOffScheduled.current && !seqSteps[currentStep.current] && notePlaying.current) {
      Tone.getContext().clearTimeout(noteOffTimeout.current)
      let offNote = noteIndex.current === playingNoteRef.current ? playingNoteRef.current : prevNoteIndex.current
      if (offNote) {
        const { channel, midiOutObj, clockOffset } = getChannelData()
        noteOff(
          channel,
          noteString(offNote),
          midiOutObj,
          false,
          playNoteBuffer.current.seq.time + PLAY_NOTE_BUFFER_TIME - 0.005,
          clockOffset
        )
      }
      noNoteOffScheduled.current = false
    }
    playNoteBuffer.current = { seq: null, key: null }
  }, [emptyKey, getChannelData, hold, muted, noteOff, playNote, seqSteps])

  const loadPlayNoteBuffer = useCallback(
    (type: any, time: any, interval: any) => {
      if (!playNoteBuffer.current.seq && !playNoteBuffer.current.key) {
        Tone.getContext().setTimeout(clearPlayNoteBuffer, PLAY_NOTE_BUFFER_TIME)
      }
      playNoteBuffer.current[type] = { time, interval }
    },
    [clearPlayNoteBuffer]
  )

  // sequence loop
  const seqCallback = useCallback(
    (time: any, interval: any) => {
      // console.log('SEQ', time, Tone.immediate())
      if (currentStep.current === undefined) {
        currentStep.current = handleArpMode(seqMovement, seqLength, undefined, seqArpUtil, seqArpInc1, seqArpInc2)
      }
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
    [seqMovement, seqLength, seqArpInc1, seqArpInc2, emptyKey, muted, loadPlayNoteBuffer]
  )
  const seqLoop = useLoop(seqCallback, seqRate, tempo, seqSwing, seqSwingLength)

  // key loop
  const keyCallback = useCallback(
    (time: any, interval: any) => {
      // console.log('KEY', time, Tone.immediate())
      const pitchRange = rangeMode ? pitchesInRange(rangeStart, rangeEnd, key) : keybdPitches
      if (pitchRange.length) {
        prevNoteIndex.current = noteIndex.current
        let currentPitchIndex
        if (noteIndex.current !== undefined) {
          currentPitchIndex = pitchRange.indexOf(noteIndex.current)
          if (currentPitchIndex === -1) {
            currentPitchIndex = pitchRange.indexOf(
              pitchRange.reduce((acc: any, curr: any) =>
                Math.abs(noteIndex.current - curr) < Math.abs(noteIndex.current - acc) ? curr : acc
              )
            )
          }
        }
        noteIndex.current =
          pitchRange[
            handleArpMode(keyMovement, pitchRange.length, currentPitchIndex, keyArpUtil, keyArpInc1, keyArpInc2)
          ]
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
  const keyLoop = useLoop(keyCallback, keyRate, tempo, keySwing, keySwingLength)

  // force state updates

  const keyRestart = useCallback(() => {
    setPlayingNote(undefined)
    setPlayingPitchClass(undefined)
    playingNoteRef.current = undefined
    noteIndex.current = undefined
    prevNoteIndex.current = undefined
    keyArpUtil.current = false
    keyLoop.current?.reset()
  }, [keyLoop])

  const seqRestart = useCallback(() => {
    prevStep.current = undefined
    currentStep.current = undefined
    nextStep.current = undefined
    seqArpUtil.current = false
    setPlayingStep(null)
    seqLoop.current?.reset()
  }, [seqLoop])

  useEffect(() => {
    if (resetTransport) {
      keyRestart()
      seqRestart()
    }
  }, [keyRestart, resetTransport, seqRestart])

  // set channel state when preset is changed

  useEffect(() => {
    if (channelPreset) {
      if (!presetInitialized.current) {
        presetInitialized.current = true
      } else {
        if (restartChannels) {
          seqRestart()
          keyRestart()
        }
        setScribbler(channelPreset.scribbler)
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
        setSeqShiftAmt(channelPreset.seqShiftAmt)
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
          gainNode.current!,
          pannerNode.current,
          synthInstrument.current,
          [
            pianoInstrument.current,
            marimbaInstrument.current,
            drumsInstrument.current,
            drumMachineInstrument.current,
            bassInstrument.current,
            vibesInstrument.current,
            harpInstrument.current,
            choralInstrument.current,
          ],
          chorusEffect.current,
          distortionEffect.current!,
          delayEffect.current!,
          reverbEffect.current!,
          vibratoEffect.current!,
          channelPreset.instrumentParams,
          getCurrentEffect()
        )
        setUpdateOnce(true)
      }
    }
  }, [
    channelPreset,
    restartChannels,
    keyRestart,
    seqRestart,
    gainNode,
    pannerNode,
    synthInstrument,
    pianoInstrument,
    marimbaInstrument,
    drumsInstrument,
    drumMachineInstrument,
    bassInstrument,
    vibesInstrument,
    harpInstrument,
    choralInstrument,
    chorusEffect,
    distortionEffect,
    delayEffect,
    reverbEffect,
    vibratoEffect,
    getCurrentEffect,
  ])

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
      keybdPitches.forEach((note: any) => {
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

  const ui = useUI(
    id.current,
    color,
    scribbler,
    setScribbler,
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
    seqShiftAmt,
    updateSeqShift,
    previewSeqShift,
    setShowSeqPreview,
    setSeqShiftDirectionForward,
    doSeqShift,
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
    openInstrumentModal,
    updateOnce,
    triggerNote,
    channelPreset
  )

  const modalEl = useMemo(
    () => (
      <CSSTransition
        in={!!modalType}
        timeout={300}
        classNames="show"
        onEnter={showModal}
        onExited={hideModal}
        nodeRef={modalNodeRef}>
        <Modal
          nodeRef={modalNodeRef}
          modalContent={modalContent}
          modalType={modalType}
          setModalType={setModalType}
          midiHold={midiHold}
          setMidiHold={setMidiHold}
          color={color}
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
          savedInstrumentParams={channelPreset?.instrumentParams}
          instruments={instruments}
          gainNode={gainNode}
          pannerNode={pannerNode}
          effects={effects}
          grabbing={grabbing}
          setGrabbing={setGrabbing}
          tempo={tempo}
        />
      </CSSTransition>
    ),
    [
      channelNum,
      color,
      customMidiOutChannel,
      effects,
      gainNode,
      pannerNode,
      grabbing,
      hideModal,
      instrumentOn,
      instrumentParams,
      channelPreset?.instrumentParams,
      instrumentType,
      instruments,
      midiHold,
      midiOutChannel,
      modalContent,
      modalType,
      setGrabbing,
      showModal,
      tempo,
      theme,
    ]
  )

  const dragTargetUI = useCallback(
    (horizontal: any) => {
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

  const channelStateDebounce = useRef<any>(undefined)
  useEffect(() => {
    clearTimeout(channelStateDebounce.current)
    const debounceTime = 200
    channelStateDebounce.current = setTimeout(() => {
      const state = {
        id: id.current,
        color,
        scribbler,
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
        seqShiftAmt,
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
    seqShiftAmt,
    seqSteps,
    seqSwing,
    seqSwingLength,
    setChannelState,
    shiftAmt,
    solo,
    velocity,
    scribbler,
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

  switch (view) {
    case 'stacked':
      return (
        <StackedView
          {...ui}
          muted={muted}
          color={color}
          channelNum={channelNum}
          numChannels={numChannels}
          rangeMode={rangeMode}
          arrowSmallGraphic={arrowSmallGraphic}
          seqSteps={seqSteps}
          setSeqSteps={setSeqSteps}
          seqLength={seqLength}
          seqPreview={seqPreview}
          showSeqPreview={showSeqPreview}
          playingStep={playingStep}
          showStepNumbers={showStepNumbers}
          longestSequence={longestSequence}
          draggingChannel={draggingChannel}
          dragTarget={dragTarget}
          dragTargetHorizontal={dragTargetHorizontal}
          modalEl={modalEl}
        />
      )
    case 'horizontal':
      return (
        <HorizontalView
          {...ui}
          muted={muted}
          color={color}
          channelNum={channelNum}
          rangeMode={rangeMode}
          arrowSmallGraphic={arrowSmallGraphic}
          seqSteps={seqSteps}
          setSeqSteps={setSeqSteps}
          seqLength={seqLength}
          seqPreview={seqPreview}
          showSeqPreview={showSeqPreview}
          playingStep={playingStep}
          showStepNumbers={showStepNumbers}
          longestSequence={longestSequence}
          draggingChannel={draggingChannel}
          dragTarget={dragTarget}
          dragTargetHorizontal={dragTargetHorizontal}
          modalEl={modalEl}
        />
      )
    case 'clock':
      return (
        <ClockView
          {...ui}
          muted={muted}
          color={color}
          channelNum={channelNum}
          rangeMode={rangeMode}
          arrowClockGraphic={arrowClockGraphic}
          seqSteps={seqSteps}
          setSeqSteps={setSeqSteps}
          seqLength={seqLength}
          seqPreview={seqPreview}
          showSeqPreview={showSeqPreview}
          playingStep={playingStep}
          showStepNumbers={showStepNumbers}
          draggingChannel={draggingChannel}
          dragTarget={dragTarget}
          dragTargetBox={dragTargetBox}
          modalEl={modalEl}
          drawerOpen={drawerOpen}
          toggleDrawerOpen={toggleDrawerOpen}
        />
      )
    default:
      return null
  }
}
