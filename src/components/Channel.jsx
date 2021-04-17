import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import regeneratorRuntime from 'regenerator-runtime'
import * as Tone from 'tone'
import WebMidi from 'webmidi'
import { CSSTransition } from 'react-transition-group'
import {
  KNOB_MAX,
  BLANK_PITCH_CLASSES,
  MIDDLE_C,
  ARP_MODES,
  CHANNEL_HEIGHT,
  MAX_SEQUENCE_LENGTH,
  DEFAULT_TIME_DIVISION,
  INSTRUMENT_TYPES,
  handleArpMode,
  noteString,
} from '../globals'
import { pitchesInRange, constrain } from '../math'
import classNames from 'classnames'
import Sequencer from './Sequencer'
import useLoop from '../hooks/useLoop'
import useKeyManipulation from '../hooks/useKeyManipulation'
import useUI from '../hooks/useUI'
import arrowSmall from '../assets/arrow-small.svg'
import arrowClock from '../assets/arrow-clock.svg'
import './Channel.scss'

// const synthB = new Tone.Synth().toDestination()
// const loopB = new Tone.Loop((time) => {
//   synthB.triggerAttackRelease('C4', '16n', time)
// }, '4n').start(0)

export default function Channel({
  numChannels,
  channelNum,
  setGrabbing,
  grabbing,
  resizing,
  setResizing,
  view,
  numChannelsSoloed,
  setNumChannelsSoloed,
  tempo,
  playing,
  settings,
  midiOut,
}) {
  const [velocity, setVelocity] = useState(KNOB_MAX)
  const [key, setKey] = useState([false, true, false, false, true, false, true, false, false, true, false, false])
  const [keyRate, setKeyRate] = useState(DEFAULT_TIME_DIVISION)
  const [keyArpMode, setKeyArpMode] = useState(Object.keys(ARP_MODES)[0])
  const [keyArpInc1, setKeyArpInc1] = useState(2)
  const [keyArpInc2, setKeyArpInc2] = useState(-1)
  const keyArpUtil = useRef(false)
  const [keySustain, setKeySustain] = useState(KNOB_MAX / 2)
  const [keySwing, setKeySwing] = useState(KNOB_MAX / 2)
  const [keySwingLength, setKeySwingLength] = useState(2)
  const [keyPreview, setKeyPreview] = useState(BLANK_PITCH_CLASSES())
  const [showKeyPreview, setShowKeyPreview] = useState(false)
  const [mute, setMute] = useState(false)
  const [solo, setSolo] = useState(false)
  const [shiftAmt, setShiftAmt] = useState(1)
  const [shiftDirectionForward, setShiftDirectionForward] = useState(true)
  const [axis, setAxis] = useState(0)
  const [turningAxisKnob, setTurningAxisKnob] = useState(false)
  const [rangeStart, setRangeStart] = useState(MIDDLE_C)
  const [rangeEnd, setRangeEnd] = useState(MIDDLE_C + 12) // non-inclusive
  const [playingPitchClass, setPlayingPitchClass] = useState()
  const [playingNote, setPlayingNote] = useState()
  const noteIndex = useRef()
  const [noteOn, setNoteOn] = useState(false)
  const notePlaying = useRef(false)
  const noteOffTimeout = useRef()
  const [seqSteps, setSeqSteps] = useState([...Array(MAX_SEQUENCE_LENGTH)].map(() => Math.random() > 0.65))
  const [seqLength, setSeqLength] = useState(MAX_SEQUENCE_LENGTH)
  const [playingStep, setPlayingStep] = useState()
  const prevStep = useRef()
  const currentStep = useRef(0)
  const nextStep = useRef()
  const playNoteDebounce = useRef()
  const [seqRate, setSeqRate] = useState(DEFAULT_TIME_DIVISION)
  const [seqArpMode, setSeqArpMode] = useState(Object.keys(ARP_MODES)[0])
  const [seqArpInc1, setSeqArpInc1] = useState(2)
  const [seqArpInc2, setSeqArpInc2] = useState(-1)
  const seqArpUtil = useRef(false)
  const [seqSwing, setSeqSwing] = useState(KNOB_MAX / 2)
  const [seqSwingLength, setSeqSwingLength] = useState(2)
  const [seqSustain, setSeqSustain] = useState(KNOB_MAX / 2)
  const [retrigger, setRetrigger] = useState(true)
  const [instrumentOn, setInstrumentOn] = useState(true)
  const [instrumentType, setInstrumentType] = useState(INSTRUMENT_TYPES.find((i) => i.value === 'sawtooth'))
  const initInstrumentType = useRef(instrumentType.value)
  const instrument = useRef()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const emptyKey = useMemo(() => {
    return !key.some((p) => p)
  }, [key])

  // instrument

  useEffect(() => {
    instrument.current = new Tone.MonoSynth({
      oscillator: {
        type: initInstrumentType.current,
      },
      envelope: {
        attack: 0.05,
      },
      filterEnvelope: {
        attack: 0,
        baseFrequency: 3000,
      },
    }).toDestination()
    return () => {
      instrument.current.dispose()
    }
  }, [])

  useEffect(() => {
    instrument.current.oscillator.type = instrumentType.value
  }, [instrumentType])

  useEffect(() => {
    if (!playing && notePlaying.current) {
      instrument.current.triggerRelease()
      setNoteOn(false)
      notePlaying.current = false
    }
  }, [playing])

  // loop events

  // play note
  const playNote = useCallback(
    (time, interval) => {
      const note = noteString(noteIndex.current)
      const channel = settings.separateMIDIChannels ? channelNum + 1 : 1
      if (!playNoteDebounce.current && noteIndex.current) {
        // play note if retriggering or no note is playing or if this note isn't already playing
        // console.log('note', noteIndex.current)
        if (retrigger || !notePlaying.current || (notePlaying.current && playingNote !== noteIndex.current)) {
          if (notePlaying.current) {
            noteOff()
          }
          if (instrumentOn) {
            instrument.current.triggerAttack(note, time, velocity)
          }
          setNoteOn(true)
          notePlaying.current = true
          if (midiOut) {
            const clockOffset = WebMidi.time - Tone.immediate() * 1000
            midiOut.playNote(note, channel, { time: time * 1000 + clockOffset, velocity })
          }
          setPlayingNote(noteIndex.current)
        }
        // schedule note-off if we are retriggering or if the next step is off
        if (retrigger || !seqSteps[nextStep.current]) {
          clearTimeout(noteOffTimeout.current)
          noteOffTimeout.current = setTimeout(() => {
            noteOff()
          }, time - Tone.immediate() + keySustain * interval * 1000)
        }
        playNoteDebounce.current = setTimeout(() => {
          playNoteDebounce.current = null
        }, 20)
      }
      function noteOff() {
        instrument.current.triggerRelease()
        if (midiOut) {
          midiOut.stopNote(note, channel)
        }
        setNoteOn(false)
        notePlaying.current = false
      }
    },
    [
      channelNum,
      instrumentOn,
      keySustain,
      midiOut,
      playingNote,
      retrigger,
      seqSteps,
      settings.separateMIDIChannels,
      velocity,
    ]
  )

  // sequence loop
  const seqCallback = useCallback(
    (time) => {
      // console.log('SEQ', time)
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
    },
    [seqArpInc1, seqArpInc2, seqArpMode, seqLength]
  )
  useLoop(seqCallback, seqRate, tempo, seqSwing, seqSwingLength)

  // key loop
  const keyCallback = useCallback(
    (time, interval) => {
      // console.log('KEY', time)
      const pitchRange = pitchesInRange(rangeStart, rangeEnd, key)
      if (pitchRange.length) {
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
      }
    },
    [key, keyArpInc1, keyArpInc2, keyArpMode, rangeEnd, rangeStart]
  )
  useLoop(keyCallback, keyRate, tempo, keySwing, keySwingLength)

  // sequence playNote loop
  const seqNoteCallback = useCallback(
    (time, interval) => {
      // console.log('SNT', time)
      if (!emptyKey && seqSteps[currentStep.current] && (retrigger || (!prevStep.current && currentStep.current))) {
        playNote(time, interval)
      }
    },
    [emptyKey, playNote, retrigger, seqSteps]
  )
  useLoop(seqNoteCallback, seqRate, tempo, seqSwing, seqSwingLength)

  // key playNote loop
  const keyNoteCallback = useCallback(
    (time, interval) => {
      // console.log('KNT', time)
      if (!emptyKey && seqSteps[currentStep.current]) {
        playNote(time, interval)
      }
    },
    [emptyKey, playNote, seqSteps]
  )
  useLoop(keyNoteCallback, keyRate, tempo, keySwing, keySwingLength)

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
    setTurningAxisKnob
  )

  // ui elements

  const {
    channelNumEl,
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
    retriggerEl,
    instrumentEl,
  } = useUI(
    channelNum,
    key,
    setKey,
    playingPitchClass,
    setPlayingPitchClass,
    turningAxisKnob,
    keyPreview,
    showKeyPreview,
    mute,
    setMute,
    solo,
    setSolo,
    setNumChannelsSoloed,
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
    setRetrigger,
    retrigger,
    instrumentOn,
    setInstrumentOn,
    instrumentType,
    setInstrumentType
  )

  // return based on view

  if (view === 'stacked') {
    return (
      <div className="channel channel-horizontal">
        {channelNumEl}
        {keyEl}
        {muteSoloEl}
        {velocityEl}
        {shiftEl}
        {axisEl(false)}
        <img className="arrow-small" src={arrowSmall} alt="" />
        {flipOppositeEl}
        {pianoEl}
        {keyRateEl}
        {keyArpModeEl}
        {keySustainEl(false)}
        {keySwingEl(false)}
        <div style={{ top: numChannels * CHANNEL_HEIGHT }} className="channel channel-horizontal stacked-auxiliary">
          {channelNumEl}
          <Sequencer
            className="channel-module"
            seqSteps={seqSteps}
            setSeqSteps={setSeqSteps}
            seqLength={seqLength}
            playingStep={playingStep}
            showStepNumbers={settings.showStepNumbers}>
            <div className="sequencer-controls">
              {seqLengthEl(true)}
              {seqRateEl(true)}
              {seqArpModeEl(true)}
              {seqSustainEl(true)}
              {seqSwingEl(true)}
              {retriggerEl(true)}
            </div>
          </Sequencer>
          <div className="channel-module border"></div>
          {instrumentEl(false)}
        </div>
      </div>
    )
  } else if (view === 'horizontal') {
    return (
      <div className="channel channel-horizontal">
        {channelNumEl}
        {keyEl}
        {muteSoloEl}
        {velocityEl}
        {shiftEl}
        {axisEl(false)}
        <img className="arrow-small" src={arrowSmall} alt="" />
        {flipOppositeEl}
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
          showStepNumbers={settings.showStepNumbers}>
          <div className="sequencer-controls">
            {seqLengthEl(true)}
            {seqRateEl(true)}
            {seqArpModeEl(true)}
            {seqSustainEl(true)}
            {seqSwingEl(true)}
            {retriggerEl(true)}
          </div>
        </Sequencer>
        <div className="channel-module border"></div>
        {instrumentEl(false)}
      </div>
    )
  } else if (view === 'clock') {
    return (
      <div className="channel channel-clock">
        <div className="channel-clock-top">
          {channelNumEl}
          {muteSoloEl}
          <div className="channel-vertical left-vertical">
            {flipOppositeEl}
            {shiftEl}
            {velocityEl}
          </div>
          <img className="arrow-clock" src={arrowClock} alt="" />
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
            <Sequencer
              className="channel-module"
              seqSteps={seqSteps}
              setSeqSteps={setSeqSteps}
              seqLength={seqLength}
              playingStep={playingStep}
              showStepNumbers={settings.showStepNumbers}
            />
            <div className="sequencer-controls">
              {seqLengthEl(false)}
              {seqRateEl(false)}
              {seqArpModeEl(false)}
              {seqSustainEl(false)}
              {seqSwingEl(false)}
              {retriggerEl(false)}
              {instrumentEl(true)}
            </div>
          </div>
        </CSSTransition>
      </div>
    )
  }
  return null
}
Channel.propTypes = {
  numChannels: PropTypes.number,
  channelNum: PropTypes.number,
  grabbing: PropTypes.bool,
  setGrabbing: PropTypes.func,
  resizing: PropTypes.bool,
  setResizing: PropTypes.func,
  view: PropTypes.string,
  numChannelsSoloed: PropTypes.number,
  setNumChannelsSoloed: PropTypes.func,
  tempo: PropTypes.number,
  playing: PropTypes.bool,
  settings: PropTypes.object,
  midiOut: PropTypes.object,
}
