import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { KNOB_MAX } from '../globals'
import RotaryKnob from './RotaryKnob'
import './Channel.scss'

const CHANNEL_COLORS = ['#008dff', '#ff413e', '#33ff00', '#ff00ff']

export default function Channel(props) {
  const [velocity, setVelocity] = useState(KNOB_MAX)

  const content = useMemo(() => {
    if (props.view === 'stacked') {
      return (
        <div className="channel channel-horizontal">
          <div
            style={{ color: CHANNEL_COLORS[props.channelNum % CHANNEL_COLORS.length] }}
            className="channel-number channel-module">
            {props.channelNum + 1}
          </div>
          <div className="key channel-module">
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
  }, [props.view, props.setTurningKnob, props.turningKnob, props.channelNum, velocity])

  return content
}
Channel.propTypes = {
  channelNum: PropTypes.number,
  setTurningKnob: PropTypes.func,
  turningKnob: PropTypes.bool,
  view: PropTypes.string,
}
