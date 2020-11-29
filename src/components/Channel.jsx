import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { KNOB_MAX } from '../globals'
import RotaryKnob from './RotaryKnob'
import './Channel.scss'

export default function Channel(props) {
  const [velocity, setVelocity] = useState(KNOB_MAX)

  return (
    <div className="channel">
      <RotaryKnob
        value={velocity}
        setValue={setVelocity}
        label="Velocity"
        setTurningKnob={props.setTurningKnob}
        turningKnob={props.turningKnob}
      />
    </div>
  )
}
Channel.propTypes = {
  channelNum: PropTypes.number,
  setTurningKnob: PropTypes.func,
  turningKnob: PropTypes.bool,
}
