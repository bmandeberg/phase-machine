import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { KNOB_MAX, BLANK_PITCH_CLASSES } from '../globals'
import RotaryKnob from './RotaryKnob'
import NumInput from './NumInput'
import Key from './Key'
import MuteSolo from './MuteSolo'
import FlipOpposite from './FlipOpposite'
import arrowSmall from '../assets/arrow-small.svg'
import './Channel.scss'

const CHANNEL_COLORS = ['#008dff', '#ff413e', '#33ff00', '#ff00ff']

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

export default function Channel({
  channelNum,
  setTurningKnob,
  turningKnob,
  view,
  numChannelsSoloed,
  setNumChannelsSoloed,
}) {
  const [velocity, setVelocity] = useState(KNOB_MAX)
  const [key, setKey] = useState([false, true, false, false, true, false, true, false, false, true, false, false])
  const [keyPreview, setKeyPreview] = useState(BLANK_PITCH_CLASSES())
  const [showKeyPreview, setShowKeyPreview] = useState(false)
  const [playingPitchClass, setPlayingPitchClass] = useState(null)
  const [mute, setMute] = useState(false)
  const [solo, setSolo] = useState(false)
  const [shiftAmt, setShiftAmt] = useState(1)
  const [shiftDirectionForward, setShiftDirectionForward] = useState(true)
  const [axis, setAxis] = useState(0)
  const [turningAxisKnob, setTurningAxisKnob] = useState(false)

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
    setTurningKnob(true)
    setTurningAxisKnob(true)
    previewFlip()
  }, [previewFlip, setTurningKnob])

  const stopChangingAxis = useCallback(() => {
    setTurningKnob(false)
    setTurningAxisKnob(false)
    setShowKeyPreview(false)
  }, [setTurningKnob])

  if (view === 'stacked') {
    return (
      <div className="channel channel-horizontal">
        <div style={{ color: CHANNEL_COLORS[channelNum % CHANNEL_COLORS.length] }} className="channel-number">
          {channelNum + 1}
        </div>
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
          setTurningKnob={setTurningKnob}
          turningKnob={turningKnob}
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
          turningKnob={turningKnob}
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
      </div>
    )
  }
  return null
}
Channel.propTypes = {
  channelNum: PropTypes.number,
  setTurningKnob: PropTypes.func,
  turningKnob: PropTypes.bool,
  view: PropTypes.string,
  numChannelsSoloed: PropTypes.number,
  setNumChannelsSoloed: PropTypes.func,
}
