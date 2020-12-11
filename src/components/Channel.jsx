import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { KNOB_MAX, BLANK_PITCH_CLASSES, RANDOM_PITCH_CLASSES } from '../globals'
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

export default function Channel(props) {
  const [velocity, setVelocity] = useState(KNOB_MAX)
  const [key, setKey] = useState([false, true, false, false, true, false, true, false, false, true, false, false])
  const [keyPreview, setKeyPreview] = useState(RANDOM_PITCH_CLASSES())
  const [showKeyPreview, setShowKeyPreview] = useState(false)
  const [playingPitchClass, setPlayingPitchClass] = useState(null)
  const [mute, setMute] = useState(false)
  const [solo, setSolo] = useState(false)
  const [shift, setShift] = useState(0)
  const [axis, setAxis] = useState(0)
  const [turningAxisKnob, setTurningAxisKnob] = useState(false)

  const doShift = useCallback(
    (shiftAmt) => {
      const blankPitches = BLANK_PITCH_CLASSES()
      for (let i = 0; i < key.length; i++) {
        if (key[i]) {
          const shiftedPitchClass = pitchClassWrapper(i + shiftAmt)
          blankPitches[shiftedPitchClass] = true
        }
      }
      setKey(blankPitches)
    },
    [key]
  )

  const updateShift = useCallback(
    (newShift) => {
      newShift = pitchClassWrapper(newShift)
      doShift(newShift - shift)
      setShift(newShift)
    },
    [doShift, shift]
  )

  const doOpposite = useCallback(() => {
    setKey((key) => opposite(key))
  }, [])

  const updateAxis = useCallback(
    (a) => {
      setAxis(a)
      setKeyPreview(flip(a, key))
    },
    [key]
  )

  if (props.view === 'stacked') {
    return (
      <div className="channel channel-horizontal">
        <div style={{ color: CHANNEL_COLORS[props.channelNum % CHANNEL_COLORS.length] }} className="channel-number">
          {props.channelNum + 1}
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
          setNumChannelsSoloed={props.setNumChannelsSoloed}
        />
        <RotaryKnob
          className="channel-module"
          value={velocity}
          setValue={setVelocity}
          label="Velocity"
          setTurningKnob={props.setTurningKnob}
          turningKnob={props.turningKnob}
        />
        <NumInput className="channel-module" value={shift} setValue={updateShift} label="Shift" />
        <RotaryKnob
          className="channel-module"
          value={axis}
          setValue={updateAxis}
          setTurningKnob={props.setTurningKnob}
          turningKnob={props.turningKnob}
          axisKnob
          musicalKey={key}
          setKey={setKey}
          playingPitchClass={playingPitchClass}
          turningAxisKnob={turningAxisKnob}
          setTurningAxisKnob={setTurningAxisKnob}
          keyPreview={keyPreview}
          showKeyPreview={showKeyPreview}
          setShowKeyPreview={setShowKeyPreview}
        />
        <img className="arrow-small" src={arrowSmall} alt="" />
        <FlipOpposite flip={flip} opposite={doOpposite} />
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
