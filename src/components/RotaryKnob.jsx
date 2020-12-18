import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { KNOB_MAX } from '../globals'
import Key from './Key'
import { Knob } from 'react-rotary-knob'
import './RotaryKnob.scss'

const AXIS_LINE_SIZE = 270

export default function RotaryKnob({
  value,
  setValue,
  min,
  max,
  label,
  grabbing,
  setGrabbing,
  className,
  axisKnob,
  musicalKey,
  setKey,
  playingPitchClass,
  turningAxisKnob,
  keyPreview,
  showKeyPreview,
  startChangingAxis,
  stopChangingAxis,
  leftShift,
}) {
  const minVal = useMemo(() => min || 0, [min])
  const maxVal = useMemo(() => (axisKnob ? 24 : max || KNOB_MAX), [axisKnob, max])

  const updateValue = useCallback(
    (val) => {
      if (axisKnob) {
        const roundedVal = Math.round(val)
        if (roundedVal !== value) {
          setValue(roundedVal)
        }
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

  const startTurningKnob = useCallback(() => {
    setGrabbing(true)
  }, [setGrabbing])

  const stopTurningKnob = useCallback(() => {
    setGrabbing(false)
  }, [setGrabbing])

  return (
    <div
      style={{ marginLeft: leftShift }}
      className={classNames('knob-container', className, { 'axis-knob': axisKnob, 'knob-active': turningAxisKnob })}>
      {axisKnob && (
        <div className="axis-knob-helper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transform: `rotate(${value * 15}deg)`,
              left: AXIS_LINE_SIZE / -2 + 21,
              top: AXIS_LINE_SIZE / -2 + 21,
            }}
            className="axis-line"
            width={AXIS_LINE_SIZE}
            height={AXIS_LINE_SIZE}>
            <defs>
              <filter id="filter">
                <feGaussianBlur stdDeviation="15" />
              </filter>
              <mask id="mask">
                <ellipse
                  cx={AXIS_LINE_SIZE / 2}
                  cy={AXIS_LINE_SIZE / 2}
                  rx={AXIS_LINE_SIZE / 2 - 40}
                  ry={AXIS_LINE_SIZE / 2 - 40}
                  fill="white"
                  filter="url(#filter)"></ellipse>
              </mask>
            </defs>
            <rect x="0" y="0" width={AXIS_LINE_SIZE / 2} height={AXIS_LINE_SIZE} fill="transparent" mask="url(#mask)" />
          </svg>
          <Key
            musicalKey={musicalKey}
            setKey={setKey}
            playingPitchClass={playingPitchClass}
            className="axis-knob-supplemental"
            keyPreview={keyPreview}
            showKeyPreview={showKeyPreview}
          />
        </div>
      )}
      <Knob
        className={classNames('knob', { grabbing: grabbing })}
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
        onStart={axisKnob ? startChangingAxis : startTurningKnob}
        onEnd={axisKnob ? stopChangingAxis : stopTurningKnob}
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
  grabbing: PropTypes.bool,
  setGrabbing: PropTypes.func,
  className: PropTypes.string,
  axisKnob: PropTypes.bool,
  musicalKey: PropTypes.array,
  setKey: PropTypes.func,
  playingPitchClass: PropTypes.number,
  turningAxisKnob: PropTypes.bool,
  keyPreview: PropTypes.array,
  showKeyPreview: PropTypes.bool,
  startChangingAxis: PropTypes.func,
  stopChangingAxis: PropTypes.func,
  leftShift: PropTypes.number,
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
		<path class="st0" d="M42,83c-11,0-21.2-4.3-29-12C-3,55-3,29,13,13C20.8,5.3,31,1,42,1c11,0,21.2,4.3,29,12c16,16,16,42,0,58
			C63.2,78.7,53,83,42,83z"/>
		<path class="st1" d="M42,2c10.2,0,20.5,3.9,28.3,11.7c15.6,15.6,15.6,40.9,0,56.6C62.5,78.1,52.2,82,42,82s-20.5-3.9-28.3-11.7
			c-15.6-15.6-15.6-40.9,0-56.6C21.5,5.9,31.8,2,42,2 M42,0C30.8,0,20.2,4.4,12.3,12.3C4.4,20.2,0,30.8,0,42
			c0,11.2,4.4,21.8,12.3,29.7C20.2,79.6,30.8,84,42,84c11.2,0,21.8-4.4,29.7-12.3C79.6,63.8,84,53.2,84,42
			c0-11.2-4.4-21.8-12.3-29.7C63.8,4.4,53.2,0,42,0L42,0z"/>
	</g>
	<g>
		<path class="st2" d="M42,3c10.4,0,20.2,4.1,27.6,11.4c15.2,15.2,15.2,39.9,0,55.2C62.2,76.9,52.4,81,42,81
			c-10.4,0-20.2-4.1-27.6-11.4c-15.2-15.2-15.2-39.9,0-55.2C21.8,7.1,31.6,3,42,3 M42,2C31.8,2,21.5,5.9,13.7,13.7
			c-15.6,15.6-15.6,40.9,0,56.6C21.5,78.1,31.8,82,42,82s20.5-3.9,28.3-11.7c15.6-15.6,15.6-40.9,0-56.6C62.5,5.9,52.2,2,42,2L42,2z
			"/>
	</g>
	<g>
		<rect x="40" y="2" class="st3" width="4" height="80"/>
	</g>
	<g>
		<g>
			<rect x="17.6" y="41" class="st3" width="11.7" height="2"/>
		</g>
		<g>
			<g>
				<polygon class="st3" points="19.1,47.2 10.1,42 19.1,36.8 				"/>
			</g>
		</g>
	</g>
	<g>
		<g>
			<rect x="54.7" y="41" class="st3" width="11.7" height="2"/>
		</g>
		<g>
			<g>
				<polygon class="st3" points="64.9,36.8 73.9,42 64.9,47.2 				"/>
			</g>
		</g>
	</g>
</g>
</svg>
`,
}
