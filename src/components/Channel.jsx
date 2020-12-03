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

export default function Channel(props) {
  const [velocity, setVelocity] = useState(KNOB_MAX)
  const [key, setKey] = useState([false, true, false, false, true, false, true, false, false, true, false, false])
  const [playingPitchClass, setPlayingPitchClass] = useState(null)
  const [mute, setMute] = useState(false)
  const [solo, setSolo] = useState(false)
  const [shift, setShift] = useState(0)
  const [axis, setAxis] = useState(0)

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

  const flip = useCallback(() => {}, [])

  const opposite = useCallback(() => {
    setKey((key) => {
      const keyCopy = key.slice()
      key.forEach((pitchClass, i) => {
        keyCopy[i] = !pitchClass
      })
      return keyCopy
    })
  }, [])

  if (props.view === 'stacked') {
    return (
      <div className="channel channel-horizontal">
        <div style={{ color: CHANNEL_COLORS[props.channelNum % CHANNEL_COLORS.length] }} className="channel-number">
          {props.channelNum + 1}
        </div>
        <Key musicalKey={key} setKey={setKey} playingPitchClass={playingPitchClass} />
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
          setValue={setAxis}
          setTurningKnob={props.setTurningKnob}
          turningKnob={props.turningKnob}
          axisKnob
        />
        <img className="arrow-small" src={arrowSmall} alt="" />
        <FlipOpposite flip={flip} opposite={opposite} />
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
