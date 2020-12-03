import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { KNOB_MAX } from '../globals'
import { Knob } from 'react-rotary-knob'
import './RotaryKnob.scss'

export default function RotaryKnob({
  value,
  setValue,
  min,
  max,
  label,
  setTurningKnob,
  turningKnob,
  className,
  axisKnob,
}) {
  const minVal = useMemo(() => min || 0, [min])
  const maxVal = useMemo(() => (axisKnob ? 24 : max || KNOB_MAX), [axisKnob, max])
  const updateValue = useCallback(
    (val) => {
      if (axisKnob) {
        setValue(Math.round(val))
      } else {
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
      }
    },
    [axisKnob, maxVal, minVal, value, setValue]
  )

  return (
    <div className={classNames('knob-container', className, {'axis-knob': axisKnob})}>
      <Knob
        className={classNames('knob', { grabbing: turningKnob })}
        min={minVal}
        max={maxVal}
        value={value}
        onChange={updateValue}
        skin={axisKnob ? axisSkin : skin}
        unlockDistance={30}
        preciseMode={false}
        style={
          axisKnob
            ? {
                width: '42px',
                height: '42px',
              }
            : {
                width: '55px',
                height: '49px',
              }
        }
        onStart={() => setTurningKnob(true)}
        onEnd={() => setTurningKnob(false)}
        clampMax={axisKnob ? 360 : 270}
        rotateDegrees={axisKnob ? 0 : -135}
      />
      <div className="knob-label">{axisKnob ? 'Axis' : label}</div>
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
  axisKnob: PropTypes.bool,
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

const axisSkin = {
  knobX: 42,
  knobY: 42,
  svg: `
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 84 84" style="enable-background:new 0 0 84 84;" xml:space="preserve">
<style type="text/css">
	.st0{fill:#E6E6E6;}
	.st1{fill:#CCCCCC;}
	.st2{fill:#FFFFFF;}
	.st3{fill:#666666;}
</style>
<desc>Created with Sketch.</desc>
<g id="knob">
	<g>
		<circle class="st0" cx="42" cy="42" r="41"/>
		<path class="st1" d="M13.7,13.7c15.6-15.6,40.9-15.6,56.6,0s15.6,40.9,0,56.6s-40.9,15.6-56.6,0S-1.9,29.4,13.7,13.7 M12.3,12.3
			c-16.4,16.4-16.4,43,0,59.4s43,16.4,59.4,0s16.4-43,0-59.4S28.7-4.1,12.3,12.3L12.3,12.3z"/>
		<path class="st2" d="M14.4,14.4c15.2-15.2,39.9-15.2,55.2,0s15.2,39.9,0,55.2s-39.9,15.2-55.2,0S-0.8,29.6,14.4,14.4 M13.7,13.7
			c-15.6,15.6-15.6,40.9,0,56.6s40.9,15.6,56.6,0s15.6-40.9,0-56.6S29.3-1.9,13.7,13.7L13.7,13.7z"/>
	</g>
	<polygon class="st3" points="44,19.3 52,19.3 42,2 32,19.3 40,19.3 40,64.7 32,64.7 42,82 52,64.7 44,64.7 	"/>
</g>
</svg>
`,
}
