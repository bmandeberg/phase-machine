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
  STACKABLE_INSTRUMENTS,
  NOTE_STACKS,
} from '../globals'
import { pitchesInRange, constrain, scaleToRange, shiftSeq, rateToSeconds, shift, opposite, flip } from '../math'
import classNames from 'classnames'
import Modal from './Modal'
import StackedView from './channel/StackedView'
import CondensedView from './channel/CondensedView'
import HorizontalView from './channel/HorizontalView'
import ClockView from './channel/ClockView'
import useLoop from '../hooks/useLoop'
import { SelectionModifiers } from '../hooks/useSelection'
import useKeyManipulation from '../hooks/useKeyManipulation'
import useUI from '../hooks/useUI'
import useInstruments from '../hooks/useInstruments'
import arrowSmall from '../assets/arrow-small.svg'
import arrowSmallDark from '../assets/arrow-small-dark.svg'
import arrowSmallLight from '../assets/arrow-small-light.svg'
import arrowSmallLightMute from '../assets/arrow-small-light-mute.svg'
import arrowSmallAero from '../assets/arrow-small-aero.svg'
import arrowSmallCoquette from '../assets/arrow-small-coquette.svg'
import arrowClock from '../assets/arrow-clock.svg'
import arrowClockDark from '../assets/arrow-clock-dark.svg'
import arrowClockLight from '../assets/arrow-clock-light.svg'
import arrowClockLightMute from '../assets/arrow-clock-light-mute.svg'
import arrowClockAero from '../assets/arrow-clock-aero.svg'
import arrowClockCoquette from '../assets/arrow-clock-coquette.svg'
import { Channel as ChannelType, Setter, MidiNoteEvent, ApplyEdit, ApplyAction, ChannelAction } from '../types'
import './Channel.scss'

const CLOCK_CHANNEL_WIDTH = 621
const CLOCK_CHANNEL_HEIGHT = 262
const SAMPLE_MAX_TIME = 5

interface ChannelProps {
  numChannels: number
  color: string
  channelNum: number
  selected: boolean
  selectionSize: number
  onSelect: (id: string, mods: SelectionModifiers) => void
  registerApplyEdit: (id: string, fn: ApplyEdit) => () => void
  fanOutEdit: (sourceId: string, field: keyof ChannelType, value: unknown) => void
  registerApplyAction: (id: string, fn: ApplyAction) => () => void
  fanOutAction: (sourceId: string, action: ChannelAction) => void
  setGrabbing: Setter<boolean>
  grabbing: boolean
  resizing: boolean
  setResizing: Setter<boolean>
  view: string
  numOtherChannelsSoloed: number
  tempo: number
  playing: boolean
  showStepNumbers: boolean
  midiOut: string | null
  setChannelState: (id: string, state: ChannelType) => void
  setChannelColor: (id: string, color: string) => void
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
  // true only for a channel freshly added by the user — gates the one-shot create
  // flash so it doesn't replay on app startup or when switching views.
  flash: boolean
}

export default function Channel({
  flash,
  numChannels,
  color,
  channelNum,
  selected,
  selectionSize,
  onSelect,
  registerApplyEdit,
  fanOutEdit,
  registerApplyAction,
  fanOutAction,
  setGrabbing,
  grabbing,
  resizing,
  setResizing,
  view,
  numOtherChannelsSoloed,
  tempo,
  playing,
  showStepNumbers,
  midiOut,
  setChannelState,
  setChannelColor,
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

  // Selection: a capture-phase mousedown on the channel wrapper selects it before any
  // child handler runs, and never preventDefault/stopPropagation — so it coexists with
  // the channel-number color picker, reorder drag, and sequencer/key painting. Refs keep
  // the latest selected/size for the multi-select-preserve guard without re-creating the
  // handler. `onWrapperFocus` covers keyboard/typing entry (scribbler, num inputs).
  const isSelectedRef = useRef(selected)
  isSelectedRef.current = selected
  const selectionSizeRef = useRef(selectionSize)
  selectionSizeRef.current = selectionSize
  const onWrapperMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return
      const mods = { shift: e.shiftKey, meta: e.metaKey || e.ctrlKey }
      // A modifier-click is a selection gesture, not an edit: suppress the native
      // text-selection it would otherwise drag across the scribblers / instrument icons
      // / num inputs (and clear any selection already started). Plain clicks are left
      // alone so normal focus/editing still works.
      if (mods.shift || mods.meta) {
        e.preventDefault()
        window.getSelection()?.removeAllRanges()
      }
      // editing a member of an existing multi-selection must not collapse it
      if (!mods.shift && !mods.meta && isSelectedRef.current && selectionSizeRef.current > 1) return
      onSelect(id.current, mods)
    },
    [onSelect]
  )
  const onWrapperFocus = useCallback(() => {
    if (!isSelectedRef.current && selectionSizeRef.current <= 1) onSelect(id.current, {})
  }, [onSelect])

  // ── Selected-channel edit fan-out ──────────────────────────────────────────────
  // A user edit updates THIS channel and queues the new value to be replayed onto the
  // other selected channels — flushed post-commit (the useEffect below) so we never set
  // sibling state during render. `makeMirroredSetter` wraps a raw setter to do both; a
  // couple of inline transforms (seq shift/opposite) push to the queue directly. The
  // replay side (applyEdit, further down) uses the RAW setters and never re-emits —
  // that's what keeps the fan-out loop-free. (color uses an App-level setter, so it's
  // mirrored in App, not here.)
  const fanOutEditRef = useRef(fanOutEdit)
  fanOutEditRef.current = fanOutEdit
  const emitQueue = useRef<Array<{ field: keyof ChannelType; value: unknown }>>([])
  useEffect(() => {
    if (!emitQueue.current.length) return
    const q = emitQueue.current
    emitQueue.current = []
    q.forEach(({ field, value }) => fanOutEditRef.current(id.current, field, value))
  })
  const makeMirroredSetter = useCallback(
    <T,>(field: keyof ChannelType, raw: Setter<T>): Setter<T> =>
      ((update) => {
        raw((prev: T) => {
          const next = typeof update === 'function' ? (update as (p: T) => T)(prev) : update
          emitQueue.current.push({ field, value: next })
          return next
        })
      }) as Setter<T>,
    []
  )

  // Pattern/key edits fan out as GESTURES (see ChannelAction): each selected channel
  // applies the action to its OWN data, so they stay distinct. Same post-commit flush.
  const fanOutActionRef = useRef(fanOutAction)
  fanOutActionRef.current = fanOutAction
  const actionQueue = useRef<ChannelAction[]>([])
  useEffect(() => {
    if (!actionQueue.current.length) return
    const q = actionQueue.current
    actionQueue.current = []
    q.forEach((action) => fanOutActionRef.current(id.current, action))
  })
  const emitAction = useCallback((action: ChannelAction) => {
    actionQueue.current.push(action)
  }, [])

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
      // mirror the shift-amount value to other selected channels (the SHIFT button then
      // fans out the actual transform as a gesture — see doSeqShift)
      emitQueue.current.push({ field: 'seqShiftAmt', value: newShift })
      previewSeqShift(seqShiftDirectionForward, newShift)
    },
    [previewSeqShift, seqShiftDirectionForward]
  )
  const doSeqShift = useCallback(() => {
    const shifted = shiftSeq(seqShiftAmt, seqSteps, seqLength)
    setSeqSteps(shifted)
    // mirror as a gesture: each selected channel shifts its own pattern by this amount
    emitAction({ kind: 'seqShift', amount: seqShiftAmt })
    previewSeqShift(seqShiftDirectionForward, seqShiftAmt, shifted)
  }, [seqShiftAmt, seqSteps, seqLength, previewSeqShift, seqShiftDirectionForward, emitAction])
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
  // tracks the last channelPreset we reloaded from, so the reload below fires only
  // on a real preset change — not when the effect re-runs with the same preset
  // (e.g. React StrictMode's dev double-invoke), which would otherwise clobber the
  // channel's live working state back to the saved preset
  const prevChannelPreset = useRef(channelPreset)

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
    // mirror as a gesture: each selected channel inverts its own active steps
    emitAction({ kind: 'seqOpposite' })
  }, [seqLength, emitAction])

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
              return keybdPitchesCopy.sort((a: number, b: number) => a - b)
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

  // `numOtherChannelsSoloed` excludes this channel (App subtracts our own solo from the
  // global count). Using the global count here would let our own solo toggle race: `solo`
  // flips locally at once, but the global count only catches up after the 200ms state
  // debounce, so un-soloing the lone soloed channel would briefly satisfy `count > 0 &&
  // !solo` and flash-mute us. Excluding self makes our solo toggle self-consistent.
  const muted = useMemo(
    () => mute || (numOtherChannelsSoloed > 0 && !solo),
    [mute, numOtherChannelsSoloed, solo]
  )

  // channel dragging

  const dragChannel = useRef(channelNum)
  const dragAuxChannel = useRef(false)
  const drag = useGesture({
    onDrag: ({ event, xy: [x, y] }) => {
      let hoveredChannel: any
      if (view === 'stacked' || view === 'horizontal' || view === 'condensed') {
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
    // filterTaps: a click without movement is suppressed from the drag (and its native
    // click is NOT preventDefault-ed), so the channel number's onClick fires to open the
    // color picker; an actual drag suppresses that click so reordering won't open it.
  }, { drag: { filterTaps: true } })

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
    slotNodesRef,
    rebuildEffectChain,
    reloadInstruments,
    openInstrumentModal,
    instruments,
  } = useInstruments(instrument, instrumentParams, instrumentType, cleanupInstruments, setModalType)

  // applyEdit replays a single mirrored field onto this channel via its RAW setter.
  // Array/object values are cloned so selected channels don't share references;
  // instrumentParams additionally re-applies to this channel's live Tone nodes
  // (the same path the channelPreset reload uses), mirroring instrument-editor edits.
  const applyEdit = useCallback<ApplyEdit>(
    (field, value) => {
      switch (field) {
        case 'velocity': setVelocity(value as number); break
        case 'sustain': setSustain(value as number); break
        case 'hold': setHold(value as boolean); break
        case 'mute': setMute(value as boolean); break
        case 'solo': setSolo(value as boolean); break
        case 'instrumentOn': setInstrumentOn(value as boolean); break
        case 'instrumentType': setInstrumentType(value as string); break
        case 'keyRate': setKeyRate(value as string); break
        case 'keyMovement': setKeyMovement(value as string); break
        case 'keyArpInc1': setKeyArpInc1(value as number); break
        case 'keyArpInc2': setKeyArpInc2(value as number); break
        case 'keySwing': setKeySwing(value as number); break
        case 'keySwingLength': setKeySwingLength(value as number); break
        case 'seqRate': setSeqRate(value as string); break
        case 'seqMovement': setSeqMovement(value as string); break
        case 'seqArpInc1': setSeqArpInc1(value as number); break
        case 'seqArpInc2': setSeqArpInc2(value as number); break
        case 'seqSwing': setSeqSwing(value as number); break
        case 'seqSwingLength': setSeqSwingLength(value as number); break
        case 'seqLength': setSeqLength(value as number); break
        case 'rangeMode': setRangeMode(value as boolean); break
        case 'rangeStart': setRangeStart(value as number); break
        case 'rangeEnd': setRangeEnd(value as number); break
        case 'midiHold': setMidiHold(value as boolean); break
        case 'scribbler': setScribbler(value as string); break
        case 'shiftAmt': setShiftAmt(value as number); break
        case 'axis': setAxis(value as number); break
        case 'seqShiftAmt': setSeqShiftAmt(value as number); break
        case 'midiIn': setMidiIn(value as boolean | string); break
        case 'customMidiOutChannel': setCustomMidiOutChannel(value as boolean); break
        case 'midiOutChannel': setMidiOutChannel(value as number); break
        case 'instrumentParams': {
          const params = value as typeof instrumentParams
          setInstrumentParams(params)
          reloadInstruments(params)
          break
        }
        default: break
      }
    },
    [reloadInstruments]
  )
  useEffect(() => registerApplyEdit(id.current, applyEdit), [registerApplyEdit, applyEdit])

  // Mirrored setters for the user-facing controls (raw setters stay for applyEdit, the
  // channelPreset reload, and the key/range derived effects — all of which must never
  // re-emit). Built once; each wraps the matching raw setter. Substituted into useUI /
  // useKeyManipulation / the views / the instrument modal at the call sites below.
  const mset = useMemo(
    () => ({
      scribbler: makeMirroredSetter('scribbler', setScribbler),
      shiftAmt: makeMirroredSetter('shiftAmt', setShiftAmt),
      axis: makeMirroredSetter('axis', setAxis),
      midiIn: makeMirroredSetter('midiIn', setMidiIn),
      customMidiOutChannel: makeMirroredSetter('customMidiOutChannel', setCustomMidiOutChannel),
      midiOutChannel: makeMirroredSetter('midiOutChannel', setMidiOutChannel),
      velocity: makeMirroredSetter('velocity', setVelocity),
      sustain: makeMirroredSetter('sustain', setSustain),
      hold: makeMirroredSetter('hold', setHold),
      mute: makeMirroredSetter('mute', setMute),
      solo: makeMirroredSetter('solo', setSolo),
      instrumentOn: makeMirroredSetter('instrumentOn', setInstrumentOn),
      instrumentType: makeMirroredSetter('instrumentType', setInstrumentType),
      keyRate: makeMirroredSetter('keyRate', setKeyRate),
      keyMovement: makeMirroredSetter('keyMovement', setKeyMovement),
      keyArpInc1: makeMirroredSetter('keyArpInc1', setKeyArpInc1),
      keyArpInc2: makeMirroredSetter('keyArpInc2', setKeyArpInc2),
      keySwing: makeMirroredSetter('keySwing', setKeySwing),
      keySwingLength: makeMirroredSetter('keySwingLength', setKeySwingLength),
      seqRate: makeMirroredSetter('seqRate', setSeqRate),
      seqMovement: makeMirroredSetter('seqMovement', setSeqMovement),
      seqArpInc1: makeMirroredSetter('seqArpInc1', setSeqArpInc1),
      seqArpInc2: makeMirroredSetter('seqArpInc2', setSeqArpInc2),
      seqSwing: makeMirroredSetter('seqSwing', setSeqSwing),
      seqSwingLength: makeMirroredSetter('seqSwingLength', setSeqSwingLength),
      seqLength: makeMirroredSetter('seqLength', setSeqLength),
      rangeMode: makeMirroredSetter('rangeMode', setRangeMode),
      rangeStart: makeMirroredSetter('rangeStart', setRangeStart),
      rangeEnd: makeMirroredSetter('rangeEnd', setRangeEnd),
      midiHold: makeMirroredSetter('midiHold', setMidiHold),
      instrumentParams: makeMirroredSetter('instrumentParams', setInstrumentParams),
    }),
    [makeMirroredSetter]
  )

  // Latest axis / seqLength for the gesture replays below (applyAction is stable).
  const axisRef = useRef(axis)
  axisRef.current = axis
  const seqLengthRef = useRef(seqLength)
  seqLengthRef.current = seqLength

  // Toggle setters for the key grid / sequencer / keybd piano: update this channel's
  // array AND emit a per-element gesture so each selected channel toggles the SAME
  // index/pitch on its own pattern (rather than copying the whole array). Passed to the
  // Key/Sequencer/Piano controls; the raw setters stay for transforms + derived effects.
  const mSetKeyToggle = useCallback<Setter<boolean[]>>((update) => {
    setKey((prev) => {
      const next = typeof update === 'function' ? (update as (p: boolean[]) => boolean[])(prev) : update
      for (let i = 0; i < next.length; i++) {
        if (!!next[i] !== !!prev[i]) actionQueue.current.push({ kind: 'keyPitchClass', index: i, value: !!next[i] })
      }
      return next
    })
  }, [])
  const mSetSeqStepsToggle = useCallback<Setter<boolean[]>>((update) => {
    setSeqSteps((prev: boolean[]) => {
      const next = typeof update === 'function' ? (update as (p: boolean[]) => boolean[])(prev) : update
      for (let i = 0; i < next.length; i++) {
        if (!!next[i] !== !!prev[i]) actionQueue.current.push({ kind: 'seqStep', index: i, value: !!next[i] })
      }
      return next
    })
  }, [])
  const mSetKeybdPitchesToggle = useCallback<Setter<number[]>>((update) => {
    setKeybdPitches((prev: number[]) => {
      const next = typeof update === 'function' ? (update as (p: number[]) => number[])(prev) : update
      const prevSet = new Set(prev)
      const nextSet = new Set(next)
      next.forEach((p) => {
        if (!prevSet.has(p)) actionQueue.current.push({ kind: 'keybdPitch', pitch: p, value: true })
      })
      prev.forEach((p) => {
        if (!nextSet.has(p)) actionQueue.current.push({ kind: 'keybdPitch', pitch: p, value: false })
      })
      return next
    })
  }, [])

  // Target side: replay a fanned-out gesture onto THIS channel's own data via raw setters
  // (never re-emits). Transforms reuse the same pure math helpers as the source controls.
  const applyAction = useCallback<ApplyAction>((action) => {
    switch (action.kind) {
      case 'seqStep':
        setSeqSteps((prev: boolean[]) => {
          const c = prev.slice()
          c[action.index] = action.value
          return c
        })
        break
      case 'seqShift':
        setSeqSteps((prev: boolean[]) => shiftSeq(action.amount, prev, seqLengthRef.current))
        break
      case 'seqOpposite':
        setSeqSteps((prev: boolean[]) => prev.map((s, i) => (i < seqLengthRef.current ? !s : s)))
        break
      case 'keyPitchClass':
        setKey((prev) => {
          const c = prev.slice()
          c[action.index] = action.value
          return c
        })
        break
      case 'keybdPitch':
        setKeybdPitches((prev: number[]) =>
          action.value
            ? prev.includes(action.pitch)
              ? prev
              : [...prev, action.pitch]
            : prev.filter((p) => p !== action.pitch)
        )
        break
      case 'keyShift':
        setKey((prev) => shift(action.amount, prev))
        break
      case 'keyFlip':
        setKey((prev) => flip(axisRef.current, prev))
        break
      case 'keyOpposite':
        setKey((prev) => opposite(prev))
        break
      case 'keyClear':
        setKey(BLANK_PITCH_CLASSES())
        setKeybdPitches([])
        break
    }
  }, [])
  useEffect(() => registerApplyAction(id.current, applyAction), [registerApplyAction, applyAction])

  // Keep any tempo-synced delay SLOT locked to the global tempo even while the
  // instrument modal (where useEffectParams lives) is closed. A delay slot whose
  // syncDelayTime is a note-rate string derives its delay seconds from the current
  // tempo; push that to the live node + instrumentParams (immutably) so it persists.
  useEffect(() => {
    const effects = instrumentParams.effects
    let changed = false
    const next = effects.map((slot, i) => {
      if (slot.type === 'delay' && typeof slot.syncDelayTime === 'string') {
        const seconds = rateToSeconds(slot.syncDelayTime, tempo)
        if (slot.delayTime !== seconds) {
          changed = true
          const updated = { ...slot, delayTime: seconds }
          const node = slotNodesRef.current[i]
          if (node && node.type === 'delay') node.setParams(updated)
          return updated
        }
      }
      return slot
    })
    if (changed) {
      setInstrumentParams((params) => Object.assign({}, params, { effects: next as typeof params.effects }))
    }
  }, [tempo, instrumentParams.effects, slotNodesRef, setInstrumentParams])

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

  // Extra notes stacked above the base note for the pitched samplers (piano/bass/etc.).
  // Empty unless this is a stackable instrument with a chord/interval selected.
  const stackOffsets = useMemo(
    () => (STACKABLE_INSTRUMENTS.includes(instrumentType) ? NOTE_STACKS[instrumentParams.samplerStack] ?? [] : []),
    [instrumentType, instrumentParams.samplerStack]
  )
  // Fire the stacked voices alongside the base note. Sampler voices self-release after
  // `duration`, so (like the base note) these need no separate note-off bookkeeping.
  const triggerStack = useCallback(
    (note: string, duration: any, time: any, velocity: number) => {
      if (!stackOffsets.length || !instrument.current) return
      for (const semitones of stackOffsets) {
        const stacked = Tone.Frequency(note).transpose(semitones).toNote()
        instrument.current.triggerAttackRelease(stacked, duration, time, velocity)
      }
    },
    [stackOffsets, instrument]
  )

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
      if (
        instrumentOn &&
        instrument.current &&
        (instrumentType === 'synth' ||
          instrumentType === 'metal' ||
          instrumentType === 'pluck' ||
          instrument.current.loaded)
      ) {
        if (instrumentType !== 'synth') {
          const sampleDuration = unheldNote
            ? scaleToRange(sustain, SUSTAIN_MIN, KNOB_MAX, 0.05, SAMPLE_MAX_TIME)
            : SAMPLE_MAX_TIME
          instrument.current.triggerAttackRelease(note, sampleDuration, time, velocity)
          triggerStack(note, sampleDuration, time, velocity)
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
      triggerStack,
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
      if (
        instrumentOn &&
        instrument.current &&
        (instrumentType === 'synth' ||
          instrumentType === 'metal' ||
          instrumentType === 'pluck' ||
          instrument.current.loaded)
      ) {
        if (instrumentType !== 'synth') {
          const previewDuration = scaleToRange(sustain, SUSTAIN_MIN, KNOB_MAX, 0.05, SAMPLE_MAX_TIME)
          instrument.current.triggerAttackRelease(note, previewDuration, undefined, velocity)
          triggerStack(note, previewDuration, undefined, velocity)
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
      triggerStack,
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
      } else if (channelPreset !== prevChannelPreset.current) {
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
        reloadInstruments(channelPreset.instrumentParams)
        setUpdateOnce(true)
      }
      prevChannelPreset.current = channelPreset
    }
  }, [channelPreset, restartChannels, keyRestart, seqRestart, reloadInstruments])

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
    doShift: doShiftRaw,
    doOpposite: doOppositeRaw,
    previewOpposite,
    updateAxis,
    doFlip: doFlipRaw,
    previewFlip,
    startChangingAxis,
    stopChangingAxis,
    keyClear: keyClearRaw,
  } = useKeyManipulation(
    key,
    shiftAmt,
    shiftDirectionForward,
    setKeyPreview,
    setShowKeyPreview,
    mset.shiftAmt,
    setKey,
    mset.axis,
    axis,
    setGrabbing,
    setTurningAxisKnob,
    setKeybdPitches
  )

  // Wrap the key transforms so they also fan out as gestures: each selected channel
  // shifts/flips/inverts/clears its OWN key (the raw transform already updated ours).
  const doShift = useCallback(() => {
    doShiftRaw()
    emitAction({ kind: 'keyShift', amount: shiftAmt })
  }, [doShiftRaw, emitAction, shiftAmt])
  const doOpposite = useCallback(() => {
    doOppositeRaw()
    emitAction({ kind: 'keyOpposite' })
  }, [doOppositeRaw, emitAction])
  const doFlip = useCallback(() => {
    doFlipRaw()
    emitAction({ kind: 'keyFlip' })
  }, [doFlipRaw, emitAction])
  const keyClear = useCallback(() => {
    keyClearRaw()
    emitAction({ kind: 'keyClear' })
  }, [keyClearRaw, emitAction])

  // ui elements

  const ui = useUI(
    id.current,
    color,
    scribbler,
    mset.scribbler,
    channelNum,
    key,
    mSetKeyToggle,
    playingPitchClass,
    setPlayingPitchClass,
    turningAxisKnob,
    keyPreview,
    showKeyPreview,
    mute,
    muted,
    mset.mute,
    solo,
    mset.solo,
    velocity,
    mset.velocity,
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
    mset.rangeStart,
    rangeEnd,
    mset.rangeEnd,
    resizing,
    setResizing,
    mset.keyRate,
    keyRate,
    mset.keyMovement,
    keyMovement,
    keyArpInc1,
    mset.keyArpInc1,
    keyArpInc2,
    mset.keyArpInc2,
    sustain,
    mset.sustain,
    keySwing,
    mset.keySwing,
    keySwingLength,
    mset.keySwingLength,
    seqLength,
    mset.seqLength,
    mset.seqRate,
    seqRate,
    mset.seqMovement,
    seqMovement,
    seqArpInc1,
    mset.seqArpInc1,
    seqArpInc2,
    mset.seqArpInc2,
    seqSwing,
    mset.seqSwing,
    seqSwingLength,
    mset.seqSwingLength,
    seqShiftAmt,
    updateSeqShift,
    previewSeqShift,
    setShowSeqPreview,
    setSeqShiftDirectionForward,
    doSeqShift,
    mset.hold,
    hold,
    instrumentOn,
    mset.instrumentOn,
    instrumentType,
    mset.instrumentType,
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
    mset.rangeMode,
    keybdPitches,
    mSetKeybdPitchesToggle,
    midiHold,
    mset.midiHold,
    keyClear,
    keyRestart,
    openMidiModal,
    openInstrumentModal,
    updateOnce,
    triggerNote,
    channelPreset,
    setChannelColor
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
          setMidiHold={mset.midiHold}
          midiIn={midiIn}
          setMidiIn={mset.midiIn}
          color={color}
          scribbler={scribbler}
          theme={theme}
          customMidiOutChannel={customMidiOutChannel}
          setCustomMidiOutChannel={mset.customMidiOutChannel}
          channelNum={channelNum}
          midiOutChannel={midiOutChannel}
          setMidiOutChannel={mset.midiOutChannel}
          instrumentOn={instrumentOn}
          setInstrumentOn={mset.instrumentOn}
          instrumentType={instrumentType}
          setInstrumentType={mset.instrumentType}
          instrumentParams={instrumentParams}
          setInstrumentParams={mset.instrumentParams}
          savedInstrumentParams={channelPreset?.instrumentParams}
          instruments={instruments}
          gainNode={gainNode}
          pannerNode={pannerNode}
          slotNodesRef={slotNodesRef}
          rebuildEffectChain={rebuildEffectChain}
          grabbing={grabbing}
          setGrabbing={setGrabbing}
          tempo={tempo}
        />
      </CSSTransition>
    ),
    [
      channelNum,
      color,
      scribbler,
      customMidiOutChannel,
      slotNodesRef,
      rebuildEffectChain,
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
      midiIn,
      setMidiIn,
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
      case 'eclipse':
      case 'dark':
        return arrowSmallDark
      case 'contrast':
        return mute ? arrowSmallLightMute : arrowSmallLight
      case 'aero':
        return arrowSmallAero
      case 'coquette':
        return arrowSmallCoquette
      default:
        return null
    }
  }, [mute, theme])

  const arrowClockGraphic = useMemo(() => {
    switch (theme) {
      case 'light':
        return arrowClock
      case 'eclipse':
      case 'dark':
        return arrowClockDark
      case 'contrast':
        return mute ? arrowClockLightMute : arrowClockLight
      case 'aero':
        return arrowClockAero
      case 'coquette':
        return arrowClockCoquette
      default:
        return null
    }
  }, [mute, theme])

  switch (view) {
    case 'stacked':
      return (
        <StackedView
          {...ui}
          flash={flash}
          muted={muted}
          selected={selected}
          onWrapperMouseDown={onWrapperMouseDown}
          onWrapperFocus={onWrapperFocus}
          color={color}
          channelNum={channelNum}
          numChannels={numChannels}
          rangeMode={rangeMode}
          arrowSmallGraphic={arrowSmallGraphic}
          seqSteps={seqSteps}
          setSeqSteps={mSetSeqStepsToggle}
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
    case 'condensed':
      return (
        <CondensedView
          {...ui}
          flash={flash}
          muted={muted}
          selected={selected}
          onWrapperMouseDown={onWrapperMouseDown}
          onWrapperFocus={onWrapperFocus}
          color={color}
          channelNum={channelNum}
          seqSteps={seqSteps}
          setSeqSteps={mSetSeqStepsToggle}
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
          flash={flash}
          muted={muted}
          selected={selected}
          onWrapperMouseDown={onWrapperMouseDown}
          onWrapperFocus={onWrapperFocus}
          color={color}
          channelNum={channelNum}
          rangeMode={rangeMode}
          arrowSmallGraphic={arrowSmallGraphic}
          seqSteps={seqSteps}
          setSeqSteps={mSetSeqStepsToggle}
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
          flash={flash}
          muted={muted}
          selected={selected}
          onWrapperMouseDown={onWrapperMouseDown}
          onWrapperFocus={onWrapperFocus}
          color={color}
          channelNum={channelNum}
          rangeMode={rangeMode}
          arrowClockGraphic={arrowClockGraphic}
          seqSteps={seqSteps}
          setSeqSteps={mSetSeqStepsToggle}
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
