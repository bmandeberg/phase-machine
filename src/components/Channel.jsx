import React, { useState, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  KNOB_MAX,
  BLANK_PITCH_CLASSES,
  MIDDLE_C,
  RATES,
  ARP_MODES,
  CHANNEL_HEIGHT,
  MAX_SEQUENCE_LENGTH,
  DEFAULT_TIME_DIVISION,
} from '../globals'
import RotaryKnob from './RotaryKnob'
import NumInput from './NumInput'
import Dropdn from './Dropdn'
import Key from './Key'
import MuteSolo from './MuteSolo'
import FlipOpposite from './FlipOpposite'
import PianoRoll from './PianoRoll'
import Sequencer from './Sequencer'
import arrowSmall from '../assets/arrow-small.svg'
import './Channel.scss'

const CHANNEL_COLORS = ['#008dff', '#ff413e', '#33ff00', '#ff00ff']

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
}) {
  const [velocity, setVelocity] = useState(KNOB_MAX)
  const [key, setKey] = useState([false, true, false, false, true, false, true, false, false, true, false, false])
  const [keyRate, setKeyRate] = useState(DEFAULT_TIME_DIVISION)
  const [keyArpMode, setKeyArpMode] = useState(ARP_MODES[0])
  const [keySwing, setKeySwing] = useState(0)
  const [keyPreview, setKeyPreview] = useState(BLANK_PITCH_CLASSES())
  const [showKeyPreview, setShowKeyPreview] = useState(false)
  const [playingPitchClass, setPlayingPitchClass] = useState(null)
  const [playingNote, setPlayingNote] = useState(null)
  const [mute, setMute] = useState(false)
  const [solo, setSolo] = useState(false)
  const [shiftAmt, setShiftAmt] = useState(1)
  const [shiftDirectionForward, setShiftDirectionForward] = useState(true)
  const [axis, setAxis] = useState(0)
  const [turningAxisKnob, setTurningAxisKnob] = useState(false)
  const [rangeStart, setRangeStart] = useState(MIDDLE_C)
  const [rangeEnd, setRangeEnd] = useState(MIDDLE_C + 12) // non-inclusive
  const [seqSteps, setSeqSteps] = useState([...Array(MAX_SEQUENCE_LENGTH)].map(() => Math.random() > 0.65))
  const [seqLength, setSeqLength] = useState(MAX_SEQUENCE_LENGTH)
  const [playingStep, setPlayingStep] = useState(0)
  const [seqRate, setSeqRate] = useState(DEFAULT_TIME_DIVISION)
  const [seqArpMode, setSeqArpMode] = useState(ARP_MODES[0])
  const [seqSwing, setSeqSwing] = useState(0)
  const [noteLength, setNoteLength] = useState(KNOB_MAX / 2)

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

  const channelNumEl = useMemo(() => {
    return (
      <div style={{ color: CHANNEL_COLORS[channelNum % CHANNEL_COLORS.length] }} className="channel-number">
        {channelNum + 1}
      </div>
    )
  }, [channelNum])

  if (view === 'stacked') {
    return (
      <div className="channel channel-horizontal">
        {channelNumEl}
        <Key
          className="channel-module"
          musicalKey={key}
          setKey={setKey}
          playingPitchClass={playingPitchClass}
          pianoKeys
          turningAxisKnob={turningAxisKnob}
          keyPreview={keyPreview}
          showKeyPreview={showKeyPreview}
        />
        <MuteSolo
          mute={mute}
          setMute={setMute}
          solo={solo}
          setSolo={setSolo}
          setNumChannelsSoloed={setNumChannelsSoloed}
        />
        <RotaryKnob
          className="channel-module"
          value={velocity}
          setValue={setVelocity}
          label="Velocity"
          setGrabbing={setGrabbing}
          grabbing={grabbing}
        />
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
        <RotaryKnob
          className="channel-module"
          value={axis}
          setValue={updateAxis}
          grabbing={grabbing}
          axisKnob
          musicalKey={key}
          setKey={setKey}
          playingPitchClass={playingPitchClass}
          turningAxisKnob={turningAxisKnob}
          keyPreview={keyPreview}
          showKeyPreview={showKeyPreview}
          startChangingAxis={startChangingAxis}
          stopChangingAxis={stopChangingAxis}
        />
        <img className="arrow-small" src={arrowSmall} alt="" />
        <FlipOpposite
          flip={doFlip}
          previewFlip={previewFlip}
          opposite={doOpposite}
          previewOpposite={previewOpposite}
          setShowKeyPreview={setShowKeyPreview}
        />
        <PianoRoll
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
        <Dropdn
          className="channel-module"
          label="Rate"
          options={RATES}
          setValue={setKeyRate}
          value={keyRate}
          noTextTransform
        />
        <Dropdn
          className="channel-module"
          label="Arp Mode"
          options={ARP_MODES}
          setValue={setKeyArpMode}
          value={keyArpMode}
        />
        <RotaryKnob
          className="channel-module"
          value={keySwing}
          setValue={setKeySwing}
          label="Swing"
          setGrabbing={setGrabbing}
          grabbing={grabbing}
          squeeze={2}
        />
        <div style={{ top: numChannels * CHANNEL_HEIGHT }} className="channel channel-horizontal stacked-auxiliary">
          {channelNumEl}
          <Sequencer
            className="channel-module"
            seqSteps={seqSteps}
            setSeqSteps={setSeqSteps}
            seqLength={seqLength}
            playingStep={playingStep}>
            <div className="sequencer-controls">
              <NumInput
                className="channel-module"
                value={seqLength}
                setValue={setSeqLength}
                label="Length"
                min={1}
                max={MAX_SEQUENCE_LENGTH}
                inline
              />
              <Dropdn
                className="channel-module"
                label="Rate"
                options={RATES}
                setValue={setSeqRate}
                value={seqRate}
                noTextTransform
                inline
              />
              <Dropdn
                className="channel-module"
                label="Arp Mode"
                options={ARP_MODES}
                setValue={setSeqArpMode}
                value={seqArpMode}
                inline
              />
              <RotaryKnob
                className="channel-module"
                value={seqSwing}
                setValue={setSeqSwing}
                label="Swing"
                setGrabbing={setGrabbing}
                grabbing={grabbing}
                inline
              />
              <RotaryKnob
                className="channel-module"
                value={noteLength}
                setValue={setNoteLength}
                label="Note Length"
                setGrabbing={setGrabbing}
                grabbing={grabbing}
                inline
              />
            </div>
          </Sequencer>
          <div className="channel-module border"></div>
        </div>
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
}

function pitchClassWrapper(n) {
  return n < 0 ? 11 + ((n + 1) % 12) : n % 12
}

function flip(axis, key) {
  const dedupAxis = (axis / 2) % 6
  const keyCopy = key.slice()
  key.forEach((pitchClass, i) => {
    if (i % 6 !== dedupAxis) {
      const flippedIndex = pitchClassWrapper(dedupAxis - (i - dedupAxis))
      keyCopy[flippedIndex] = pitchClass
    }
  })
  return keyCopy
}

function opposite(key) {
  const keyCopy = key.slice()
  key.forEach((pitchClass, i) => {
    keyCopy[i] = !pitchClass
  })
  return keyCopy
}

function shiftWrapper(n, shiftDirectionForward) {
  if (n < -11) {
    n = 11
  } else if (n > 11) {
    n = -11
  } else if (n === 0) {
    n += shiftDirectionForward ? 1 : -1
  } else {
    n %= 12
  }
  return n
}

function shift(shiftAmt, key) {
  const shiftedPitchClasses = BLANK_PITCH_CLASSES()
  for (let i = 0; i < key.length; i++) {
    if (key[i]) {
      const shiftedIndex = pitchClassWrapper(i + shiftAmt)
      shiftedPitchClasses[shiftedIndex] = true
    }
  }
  return shiftedPitchClasses
}
