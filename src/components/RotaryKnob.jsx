import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { KNOB_MAX } from '../globals'
import { Knob } from 'react-rotary-knob'
import './RotaryKnob.scss'

export default function RotaryKnob({ value, setValue, min, max, label, setTurningKnob, turningKnob, className }) {
  const minVal = useMemo(() => min || 0, [min])
  const maxVal = useMemo(() => max || KNOB_MAX, [max])
  const updateValue = useCallback(
    (val) => {
      const maxDistance = (maxVal - minVal) / 5
      let distance = Math.abs(val - value)
      if (distance > maxDistance) {
        if (val - value > 0 && value !== minVal) {
          setValue(minVal)
        } else if (val - value < 0 && value !== maxVal) {
          setValue(maxVal)
        }
        return
      } else {
        setValue(val)
      }
    },
    [setValue, maxVal, minVal, value]
  )

  return (
    <div className={classNames('knob-container', className)}>
      <Knob
        className={classNames('knob', { grabbing: turningKnob })}
        min={minVal}
        max={maxVal}
        value={value}
        onChange={updateValue}
        skin={skin}
        unlockDistance={30}
        preciseMode={false}
        style={{
          width: '55px',
          height: '49px',
        }}
        onStart={() => setTurningKnob(true)}
        onEnd={() => setTurningKnob(false)}
        clampMin={0}
        clampMax={270}
        rotateDegrees={-135}
      />
      <div className="knob-label">{label}</div>
    </div>
  )
}
RotaryKnob.propTypes = {
  value: PropTypes.number,
  setValue: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
  label: PropTypes.string,
  setTurningKnob: PropTypes.func,
  turningKnob: PropTypes.bool,
  className: PropTypes.string,
}

const skin = {
  knobX: 55,
  knobY: 55.5,
  svg: `
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 110.6 97.5" style="enable-background:new 0 0 110.6 97.5;" xml:space="preserve">
<style type="text/css">
	.st0{fill:#E6E6E6;}
	.st1{fill:#CCCCCC;}
	.st2{fill:#FFFFFF;}
	.st3{fill:#666666;}
	.st4{fill:none;stroke:#999999;stroke-miterlimit:10;}
</style>
<desc>Created with Sketch.</desc>
<g id="knob">
	<circle class="st0" cx="55" cy="55.5" r="41"/>
	<path class="st1" d="M26.7,27.2c15.6-15.6,40.9-15.6,56.6,0s15.6,40.9,0,56.6s-40.9,15.6-56.6,0S11.1,42.9,26.7,27.2 M25.3,25.8
		c-16.4,16.4-16.4,43,0,59.4s43,16.4,59.4,0s16.4-43,0-59.4S41.7,9.4,25.3,25.8L25.3,25.8z"/>
	<path class="st2" d="M27.4,27.9c15.2-15.2,39.9-15.2,55.2,0s15.2,39.9,0,55.2s-39.9,15.2-55.2,0S12.2,43.1,27.4,27.9 M26.7,27.2
		c-15.6,15.6-15.6,40.9,0,56.6s40.9,15.6,56.6,0s15.6-40.9,0-56.6S42.3,11.6,26.7,27.2L26.7,27.2z"/>
	<g>
		<rect x="53" y="15.5" class="st3" width="4" height="28.1"/>
	</g>
</g>
<g>
	<line class="st4" x1="8" y1="55.3" x2="0" y2="55.3"/>
	<line class="st4" x1="110.6" y1="55.3" x2="102.6" y2="55.3"/>
	<line class="st4" x1="55.3" y1="0" x2="55.3" y2="8"/>
	<line class="st4" x1="88.8" y1="88.8" x2="94.4" y2="94.4"/>
	<line class="st4" x1="16.2" y1="16.2" x2="21.9" y2="21.9"/>
	<line class="st4" x1="88.8" y1="21.9" x2="94.4" y2="16.2"/>
	<line class="st4" x1="16.2" y1="94.4" x2="21.9" y2="88.8"/>
</g>
</svg>
`,
}
