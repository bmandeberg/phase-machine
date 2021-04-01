import React, { useState, useCallback, useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import regeneratorRuntime from 'regenerator-runtime'
import * as Tone from 'tone'
import { CSSTransition } from 'react-transition-group'
import useLoop from '../tonejs/useLoop'
import {
  KNOB_MAX,
  BLANK_PITCH_CLASSES,
  MIDDLE_C,
  RATES,
  ARP_MODES,
  CHANNEL_HEIGHT,
  MAX_SEQUENCE_LENGTH,
  DEFAULT_TIME_DIVISION,
  MAX_SWING_LENGTH,
  handleArpMode,
} from '../globals'
import { flip, opposite, shiftWrapper, shift, pitchesInRange } from '../math'
import classNames from 'classnames'
import RotaryKnob from './RotaryKnob'
import NumInput from './NumInput'
import Dropdn from './Dropdn'
import Key from './Key'
import MuteSolo from './MuteSolo'
import FlipOpposite from './FlipOpposite'
import Piano from './Piano'
import Sequencer from './Sequencer'
import Switch from 'react-switch'
import Instrument from './Instrument'
import arrowSmall from '../assets/arrow-small.svg'
import arrowClock from '../assets/arrow-clock.svg'
import './Channel.scss'

const CHANNEL_COLORS = ['#008dff', '#ff413e', '#33ff00', '#ff00ff']

const synth = new Tone.Synth().toDestination()
const synthB = new Tone.Synth().toDestination()
const loopB = new Tone.Loop((time) => {
  synthB.triggerAttackRelease('C4', '16n', time)
}, '4n').start(0)

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
}) {
  const [velocity, setVelocity] = useState(KNOB_MAX)
  const [key, setKey] = useState([false, true, false, false, true, false, true, false, false, true, false, false])
  const [keyRate, setKeyRate] = useState(DEFAULT_TIME_DIVISION)
  const [keyArpMode, setKeyArpMode] = useState(Object.keys(ARP_MODES)[0])
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
  const [playingPitchClass, setPlayingPitchClass] = useState(key.indexOf(true))
  const [playingNote, setPlayingNote] = useState(pitchesInRange(rangeStart, rangeEnd, key)[0])
  const [noteOn, setNoteOn] = useState(true)
  const [seqSteps, setSeqSteps] = useState([...Array(MAX_SEQUENCE_LENGTH)].map(() => Math.random() > 0.65))
  const [seqLength, setSeqLength] = useState(MAX_SEQUENCE_LENGTH)
  const [playingStep, setPlayingStep] = useState(0)
  const [seqRate, setSeqRate] = useState(DEFAULT_TIME_DIVISION)
  const [seqArpMode, setSeqArpMode] = useState(Object.keys(ARP_MODES)[0])
  const seqArpUtil = useRef(false)
  const [seqSwing, setSeqSwing] = useState(KNOB_MAX / 2)
  const [seqSwingLength, setSeqSwingLength] = useState(2)
  const [seqSustain, setSeqSustain] = useState(KNOB_MAX / 2)
  const [retrigger, setRetrigger] = useState(true)
  const [instrumentOn, setInstrumentOn] = useState(true)
  const [instrumentType, setInstrumentType] = useState('saw')
  const [drawerOpen, setDrawerOpen] = useState(false)

  // key loop
  const keyCallback = useCallback(
    (time, interval) => {
      console.log('KEY', time)
      const pitchRange = pitchesInRange(rangeStart, rangeEnd, key)
      let currentPitchIndex = pitchRange.indexOf(playingNote)
      if (currentPitchIndex === -1) {
        currentPitchIndex = pitchRange.indexOf(
          pitchRange.reduce((acc, curr) => (Math.abs(playingNote - curr) < Math.abs(playingNote - acc) ? curr : acc))
        )
      }
      const nextPitchIndex = handleArpMode(keyArpMode, pitchRange.length, currentPitchIndex, keyArpUtil, 2, -1)
      setPlayingNote(pitchRange[nextPitchIndex])
      setPlayingPitchClass(pitchRange[nextPitchIndex] % 12)
      synth.triggerAttackRelease('C5', 0.01, time)
    },
    [key, keyArpMode, playingNote, rangeEnd, rangeStart]
  )
  useLoop(keyCallback, keyRate, tempo, keySwing, keySwingLength)

  // sequence loop
  const seqCallback = useCallback((time, interval) => {
    console.log('SEQ', time)
  }, [])
  useLoop(seqCallback, seqRate, tempo, seqSwing, seqSwingLength)

  // key manipulation functions

  const previewShift = useCallback(
    (forward = shiftDirectionForward, newShift = shiftAmt, previewKey = key) => {
      newShift = shiftWrapper(newShift, forward)
      setKeyPreview(shift(newShift, previewKey))
      setShowKeyPreview(true)
    },
    [key, shiftAmt, shiftDirectionForward]
  )

  const updateShift = useCallback(
    (newShift) => {
      newShift = shiftWrapper(newShift, shiftDirectionForward)
      setShiftAmt(newShift)
      previewShift(shiftDirectionForward, newShift)
    },
    [previewShift, shiftDirectionForward]
  )

  const doShift = useCallback(() => {
    const shiftedKey = shift(shiftAmt, key)
    setKey(shiftedKey)
    previewShift(shiftDirectionForward, shiftAmt, shiftedKey)
  }, [key, previewShift, shiftAmt, shiftDirectionForward])

  const doOpposite = useCallback(() => {
    setKey((key) => opposite(key))
    setKeyPreview(key)
  }, [key])

  const previewOpposite = useCallback(() => {
    setKeyPreview(opposite(key))
    setShowKeyPreview(true)
  }, [key])

  const updateAxis = useCallback(
    (a) => {
      setAxis(a)
      setKeyPreview(flip(a, key))
    },
    [key]
  )

  const doFlip = useCallback(() => {
    setKey((key) => flip(axis, key))
    setKeyPreview(key)
  }, [axis, key])

  const previewFlip = useCallback(() => {
    setKeyPreview(flip(axis, key))
    setShowKeyPreview(true)
  }, [axis, key])

  const startChangingAxis = useCallback(() => {
    setGrabbing(true)
    setTurningAxisKnob(true)
    previewFlip()
  }, [previewFlip, setGrabbing])

  const stopChangingAxis = useCallback(() => {
    setGrabbing(false)
    setTurningAxisKnob(false)
    setShowKeyPreview(false)
  }, [setGrabbing])

  // ui elements

  const channelNumEl = useMemo(() => {
    return (
      <div style={{ color: CHANNEL_COLORS[channelNum % CHANNEL_COLORS.length] }} className="channel-number">
        {channelNum + 1}
      </div>
    )
  }, [channelNum])

  const keyEl = useMemo(() => {
    return (
      <Key
        className="channel-module"
        musicalKey={key}
        setKey={setKey}
        playingPitchClass={playingPitchClass}
        noteOn={noteOn}
        pianoKeys
        turningAxisKnob={turningAxisKnob}
        keyPreview={keyPreview}
        showKeyPreview={showKeyPreview}
      />
    )
  }, [key, keyPreview, noteOn, playingPitchClass, showKeyPreview, turningAxisKnob])

  const muteSoloEl = useMemo(() => {
    return (
      <MuteSolo
        mute={mute}
        setMute={setMute}
        solo={solo}
        setSolo={setSolo}
        setNumChannelsSoloed={setNumChannelsSoloed}
      />
    )
  }, [mute, setNumChannelsSoloed, solo])

  const velocityEl = useMemo(() => {
    return (
      <RotaryKnob
        className="channel-module"
        value={velocity}
        setValue={setVelocity}
        label="Velocity"
        setGrabbing={setGrabbing}
        grabbing={grabbing}
      />
    )
  }, [grabbing, setGrabbing, velocity])

  const shiftEl = useMemo(() => {
    return (
      <NumInput
        className="channel-module shift-input"
        value={shiftAmt}
        setValue={updateShift}
        label="Shift"
        preview={previewShift}
        setShowKeyPreview={setShowKeyPreview}
        setDirectionForward={setShiftDirectionForward}
        buttonText="Shift"
        buttonAction={doShift}
      />
    )
  }, [doShift, previewShift, shiftAmt, updateShift])

  const axisEl = useCallback(
    (clock) => {
      return (
        <RotaryKnob
          className={classNames({ 'channel-module': !clock, 'axis-knob': clock })}
          value={axis}
          setValue={updateAxis}
          grabbing={grabbing}
          axisKnob
          axisKnobLarge={clock}
          musicalKey={key}
          setKey={setKey}
          playingPitchClass={playingPitchClass}
          turningAxisKnob={turningAxisKnob}
          keyPreview={keyPreview}
          showKeyPreview={showKeyPreview}
          startChangingAxis={startChangingAxis}
          stopChangingAxis={stopChangingAxis}
        />
      )
    },
    [
      axis,
      grabbing,
      key,
      keyPreview,
      playingPitchClass,
      showKeyPreview,
      startChangingAxis,
      stopChangingAxis,
      turningAxisKnob,
      updateAxis,
    ]
  )

  const flipOppositeEl = useMemo(() => {
    return (
      <FlipOpposite
        flip={doFlip}
        previewFlip={previewFlip}
        opposite={doOpposite}
        previewOpposite={previewOpposite}
        setShowKeyPreview={setShowKeyPreview}
      />
    )
  }, [doFlip, doOpposite, previewFlip, previewOpposite])

  const pianoEl = useMemo(() => {
    return (
      <Piano
        playingNote={playingNote}
        noteOn={noteOn}
        rangeStart={rangeStart}
        setRangeStart={setRangeStart}
        rangeEnd={rangeEnd}
        setRangeEnd={setRangeEnd}
        channelNum={channelNum}
        grabbing={grabbing}
        setGrabbing={setGrabbing}
        resizing={resizing}
        setResizing={setResizing}
      />
    )
  }, [channelNum, grabbing, noteOn, playingNote, rangeEnd, rangeStart, resizing, setGrabbing, setResizing])

  const keyRateEl = useMemo(() => {
    return (
      <Dropdn
        className="channel-module key-rate"
        label="Rate"
        options={RATES}
        setValue={setKeyRate}
        value={keyRate}
        noTextTransform
      />
    )
  }, [keyRate])

  const keyArpModeEl = useMemo(() => {
    return (
      <Dropdn
        className="channel-module key-arp-mode"
        label="Arp Mode"
        options={Object.keys(ARP_MODES)}
        setValue={setKeyArpMode}
        value={keyArpMode}
      />
    )
  }, [keyArpMode])

  const keySustainEl = useCallback(
    (vertical) => {
      return (
        <RotaryKnob
          className="channel-module key-sustain"
          value={keySustain}
          setValue={setKeySustain}
          label="Sustain"
          setGrabbing={setGrabbing}
          grabbing={grabbing}
          squeeze={!vertical ? 6 : 0}
        />
      )
    },
    [grabbing, keySustain, setGrabbing]
  )

  const keySwingEl = useCallback(
    (vertical) => {
      return (
        <div className="swing-module channel-module">
          <RotaryKnob
            className="key-swing"
            value={keySwing}
            setValue={setKeySwing}
            label="Swing"
            setGrabbing={setGrabbing}
            grabbing={grabbing}
            squeeze={!vertical ? 2 : 0}
            detent
          />
          <NumInput
            value={keySwingLength}
            setValue={setKeySwingLength}
            label="Length"
            min={2}
            max={MAX_SWING_LENGTH}
            short={true}
          />
        </div>
      )
    },
    [grabbing, keySwing, keySwingLength, setGrabbing]
  )

  const seqLengthEl = useCallback(
    (inline) => {
      return (
        <NumInput
          className="channel-module"
          value={seqLength}
          setValue={setSeqLength}
          label="Steps"
          min={1}
          max={MAX_SEQUENCE_LENGTH}
          inline={inline}
          short={!inline}
        />
      )
    },
    [seqLength]
  )

  const seqRateEl = useCallback(
    (inline) => {
      return (
        <Dropdn
          className="channel-module"
          label="Rate"
          options={RATES}
          setValue={setSeqRate}
          value={seqRate}
          noTextTransform
          inline={inline}
        />
      )
    },
    [seqRate]
  )

  const seqArpModeEl = useCallback(
    (inline) => {
      return (
        <Dropdn
          className="channel-module"
          label="Arp Mode"
          options={Object.keys(ARP_MODES)}
          setValue={setSeqArpMode}
          value={seqArpMode}
          inline={inline}
        />
      )
    },
    [seqArpMode]
  )

  const seqSwingEl = useCallback(
    (inline) => {
      return (
        <div className="swing-module channel-module">
          <RotaryKnob
            className="channel-module"
            value={seqSwing}
            setValue={setSeqSwing}
            label="Swing"
            setGrabbing={setGrabbing}
            grabbing={grabbing}
            inline={inline}
            detent
          />
          <NumInput
            value={seqSwingLength}
            setValue={setSeqSwingLength}
            label="Length"
            min={2}
            max={MAX_SWING_LENGTH}
            short={true}
            inline={inline}
          />
        </div>
      )
    },
    [grabbing, seqSwing, seqSwingLength, setGrabbing]
  )

  const seqSustainEl = useCallback(
    (inline) => {
      return (
        <RotaryKnob
          className="channel-module"
          value={seqSustain}
          setValue={setSeqSustain}
          label="Sustain"
          setGrabbing={setGrabbing}
          grabbing={grabbing}
          inline={inline}
        />
      )
    },
    [grabbing, seqSustain, setGrabbing]
  )

  const retriggerEl = useCallback(
    (inline) => {
      return (
        <div className={classNames('switch-container channel-module', { inline })}>
          <Switch
            className="switch"
            onChange={setRetrigger}
            checked={retrigger}
            uncheckedIcon={false}
            checkedIcon={false}
            offColor={'#e6e6e6'}
            onColor={'#e6e6e6'}
            offHandleColor={'#666666'}
            onHandleColor={'#33ff00'}
            width={48}
            height={24}
          />
          <p className="switch-label">{inline ? 'Retrigger' : 'Retrig'}</p>
        </div>
      )
    },
    [retrigger]
  )

  const instrumentEl = useCallback(
    (small) => {
      return (
        <Instrument
          className="channel-module"
          instrumentOn={instrumentOn}
          setInstrumentOn={setInstrumentOn}
          instrumentType={instrumentType}
          setInstrumentType={setInstrumentType}
          small={small}
        />
      )
    },
    [instrumentOn, instrumentType]
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
            playingStep={playingStep}>
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
          playingStep={playingStep}>
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
}
