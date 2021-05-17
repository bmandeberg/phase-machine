import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import regeneratorRuntime from 'regenerator-runtime'
import * as Tone from 'tone'
import WebMidi from 'webmidi'
import { CSSTransition } from 'react-transition-group'
import { BLANK_PITCH_CLASSES, CHANNEL_HEIGHT, PLAY_NOTE_BUFFER_TIME, handleArpMode, noteString } from '../globals'
import { pitchesInRange, constrain } from '../math'
import classNames from 'classnames'
import Sequencer from './Sequencer'
import useLoop from '../hooks/useLoop'
import useKeyManipulation from '../hooks/useKeyManipulation'
import useUI from '../hooks/useUI'
import arrowSmall from '../assets/arrow-small.svg'
import arrowClock from '../assets/arrow-clock.svg'
import './Channel.scss'

export default function Channel({
  numChannels,
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
  separateMIDIChannels,
  midiOut,
  setChannelState,
  channelPreset,
  duplicateChannel,
  deleteChannel,
  initState,
}) {
  const id = useRef(initState.id)
  const [velocity, setVelocity] = useState(initState.velocity)
  const [key, setKey] = useState(initState.key)
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
  const initInstrumentType = useRef(instrumentType)
  const instrument = useRef()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [keyViewType, setKeyViewType] = useState(1)

  const playNoteBuffer = useRef({ seq: null, key: null })

  const emptyKey = useMemo(() => {
    return !key.some((p) => p)
  }, [key])

  useEffect(() => {
    if (channelPreset) {
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
    }
  }, [channelPreset])

  const muted = useMemo(() => mute || (numChannelsSoloed > 0 && !solo), [mute, numChannelsSoloed, solo])

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
    instrument.current.oscillator.type = instrumentType
  }, [instrumentType])

  const noteOff = useCallback((channel, note, midiOutObj, offTime) => {
    instrument.current.triggerRelease()
    if (midiOutObj) {
      const params = {}
      if (offTime) {
        params.time = offTime
      }
      midiOutObj.stopNote(note, channel, params)
    }
    setNoteOn(false)
    notePlaying.current = false
  }, [])

  // note off when stop playing
  useEffect(() => {
    if (!playing && notePlaying.current && noteIndex.current !== undefined) {
      const channel = separateMIDIChannels ? channelNum + 1 : 1
      const note = noteString(noteIndex.current)
      const midiOutObj = midiOut ? WebMidi.getOutputByName(midiOut) : null
      noteOff(channel, note, midiOutObj, null)
    }
  }, [channelNum, midiOut, noteOff, playing, separateMIDIChannels])

  // note off when muting
  useEffect(() => {
    if (muted && notePlaying.current && noteIndex.current !== undefined) {
      const channel = separateMIDIChannels ? channelNum + 1 : 1
      const note = noteString(noteIndex.current)
      const midiOutObj = midiOut ? WebMidi.getOutputByName(midiOut) : null
      noteOff(channel, note, midiOutObj, null)
    }
  }, [channelNum, midiOut, muted, noteOff, separateMIDIChannels])

  // note off when key is emptied
  useEffect(() => {
    if (emptyKey && notePlaying.current && noteIndex.current !== undefined) {
      const channel = separateMIDIChannels ? channelNum + 1 : 1
      const note = noteString(noteIndex.current)
      const midiOutObj = midiOut ? WebMidi.getOutputByName(midiOut) : null
      noteOff(channel, note, midiOutObj, null)
    }
  }, [channelNum, emptyKey, midiOut, noteOff, separateMIDIChannels])

  // loop events

  // play note
  const playNote = useCallback(
    (time, interval, sustain) => {
      const prevNote = noteString(prevNoteIndex.current)
      const note = noteString(noteIndex.current)
      const channel = separateMIDIChannels ? channelNum + 1 : 1
      const midiOutObj = midiOut ? WebMidi.getOutputByName(midiOut) : null
      const clockOffset = WebMidi.time - Tone.immediate() * 1000
      // console.log(note)
      if (notePlaying.current) {
        clearTimeout(noteOffTimeout.current)
        if (prevNoteIndex.current !== undefined) {
          noteOff(channel, prevNote, midiOutObj, time * 1000 + clockOffset)
        }
      }
      if (instrumentOn) {
        instrument.current.triggerAttack(note, time, velocity)
      }
      setNoteOn(true)
      notePlaying.current = true
      if (midiOutObj) {
        midiOutObj.playNote(note, channel, { time: time * 1000 + clockOffset, velocity })
      }
      setPlayingNote(noteIndex.current)
      playingNoteRef.current = noteIndex.current
      // schedule note-off if we are not legato or if the next step is off
      if (!legato || !seqSteps[nextStep.current]) {
        const sustainTime = Math.max(sustain * interval * 1000, 80)
        clearTimeout(noteOffTimeout.current)
        noteOffTimeout.current = setTimeout(() => {
          noteOff(channel, note, midiOutObj, null)
        }, time - Tone.immediate() + sustainTime)
      }
    },
    [separateMIDIChannels, channelNum, midiOut, legato, seqSteps, noteOff, instrumentOn, velocity]
  )

  const clearPlayNoteBuffer = useCallback(() => {
    // play note
    let notePlayed = false
    if (!muted && !emptyKey && seqSteps[currentStep.current]) {
      if (playNoteBuffer.current.seq && (!legato || !seqSteps[prevStep.current] || !notePlaying.current)) {
        notePlayed = true
        playNote(
          playNoteBuffer.current.seq.time + PLAY_NOTE_BUFFER_TIME / 1000,
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
          playNoteBuffer.current.key.time + PLAY_NOTE_BUFFER_TIME / 1000,
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
        setTimeout(clearPlayNoteBuffer, PLAY_NOTE_BUFFER_TIME)
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
      const pitchRange = pitchesInRange(rangeStart, rangeEnd, key)
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
    [emptyKey, key, keyArpInc1, keyArpInc2, keyArpMode, loadPlayNoteBuffer, muted, rangeEnd, rangeStart]
  )
  useLoop(keyCallback, keyRate, tempo, keySwing, keySwingLength)

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
  } = useUI(
    id.current,
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
    deleteChannel
  )

  // watch and update state

  useEffect(() => {
    const state = {
      id: id.current,
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
    }
    setChannelState(id.current, state)
  }, [
    axis,
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
    legato,
    mute,
    rangeEnd,
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

  // return based on view

  if (view === 'stacked') {
    return (
      <div className={classNames('channel channel-horizontal', { mute: muted })}>
        {channelNumEl}
        {duplicateDeleteEl}
        {muteSoloEl}
        {velocityEl}
        {keyEl}
        {shiftEl}
        {axisEl(false)}
        <img className="arrow-small" src={arrowSmall} alt="" draggable="false" />
        {flipOppositeEl}
        {pianoEl}
        {keyRateEl}
        {keyArpModeEl}
        {keySustainEl(false)}
        {keySwingEl(false)}
        <div
          style={{ top: numChannels * CHANNEL_HEIGHT }}
          className={classNames('channel channel-horizontal stacked-auxiliary', { mute: muted })}>
          {channelNumEl}
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
            </div>
          </Sequencer>
          <div className="channel-module border"></div>
          {instrumentEl(false)}
        </div>
      </div>
    )
  } else if (view === 'horizontal') {
    return (
      <div className={classNames('channel channel-horizontal', { mute: muted })}>
        {channelNumEl}
        {duplicateDeleteEl}
        {muteSoloEl}
        {velocityEl}
        {keyEl}
        {shiftEl}
        {axisEl(false)}
        <img className="arrow-small" src={arrowSmall} alt="" draggable="false" />
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
          showStepNumbers={showStepNumbers}>
          <div className="sequencer-controls">
            {seqLengthEl(true)}
            {seqRateEl(true)}
            {seqArpModeEl(true)}
            {seqSustainEl(true)}
            {seqSwingEl(true)}
            {legatoEl(true)}
          </div>
        </Sequencer>
        <div className="channel-module border"></div>
        {instrumentEl(false)}
      </div>
    )
  } else if (view === 'clock') {
    return (
      <div className={classNames('channel channel-clock', { mute: muted })}>
        <div className="channel-clock-top">
          {channelNumEl}
          {duplicateDeleteEl}
          {muteSoloEl}
          {velocityEl}
          <div className="channel-vertical left-vertical">
            {flipOppositeEl}
            {shiftEl}
            {/* <div className="view-fifths">
              <div className={classNames('button chromatic', { selected: !viewFifths })}>Chromatic</div>
              <div className={classNames('button', { selected: viewFifths })} onClick={() => {alert('not yet 😢')}}>5ths</div>
            </div> */}
            {keyViewTypeEl}
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
  tempo: PropTypes.number,
  playing: PropTypes.bool,
  separateMIDIChannels: PropTypes.bool,
  showStepNumbers: PropTypes.bool,
  midiOut: PropTypes.string,
  setChannelState: PropTypes.func,
  channelPreset: PropTypes.object,
  duplicateChannel: PropTypes.func,
  deleteChannel: PropTypes.func,
  initState: PropTypes.object,
}
