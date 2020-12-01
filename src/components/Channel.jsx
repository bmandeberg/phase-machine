import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { KNOB_MAX } from '../globals'
import RotaryKnob from './RotaryKnob'
import Key from './Key'
import MuteSolo from './MuteSolo'
import './Channel.scss'

const CHANNEL_COLORS = ['#008dff', '#ff413e', '#33ff00', '#ff00ff']

export default function Channel(props) {
  const [velocity, setVelocity] = useState(KNOB_MAX)
  const [key, setKey] = useState([false, true, false, false, true, false, true, false, false, true, false, false])
  const [playingPitchClass, setPlayingPitchClass] = useState(null)
  const [mute, setMute] = useState(false)
  const [solo, setSolo] = useState(false)

  const content = useMemo(() => {
    if (props.view === 'stacked') {
      return (
        <div className="channel channel-horizontal">
          <div
            style={{ color: CHANNEL_COLORS[props.channelNum % CHANNEL_COLORS.length] }}
            className="channel-number">
            {props.channelNum + 1}
          </div>
          <Key musicalKey={key} setKey={setKey} playingPitchClass={playingPitchClass} />
          <MuteSolo mute={mute} setMute={setMute} solo={solo} setSolo={setSolo} />
          <div className="channel-module">
            <RotaryKnob
              value={velocity}
              setValue={setVelocity}
              label="Velocity"
              setTurningKnob={props.setTurningKnob}
              turningKnob={props.turningKnob}
            />
          </div>
        </div>
      )
    }
    return null
  }, [
    props.view,
    props.setTurningKnob,
    props.turningKnob,
    props.channelNum,
    velocity,
    key,
    playingPitchClass,
    mute,
    solo,
  ])

  return content
}
Channel.propTypes = {
  channelNum: PropTypes.number,
  setTurningKnob: PropTypes.func,
  turningKnob: PropTypes.bool,
  view: PropTypes.string,
}
