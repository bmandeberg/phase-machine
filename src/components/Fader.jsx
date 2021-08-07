import React, { useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { useGesture } from 'react-use-gesture'
import { constrain, scaleToRange } from '../math'
import faderSlot from '../assets/fader-slot.svg'
import faderKnob from '../assets/fader-knob.svg'
import faderKnobMute from '../assets/fader-knob-mute.svg'
import faderSlotDark from '../assets/fader-slot-dark.svg'
import faderKnobDark from '../assets/fader-knob-dark.svg'
import faderKnobMuteDark from '../assets/fader-knob-mute-dark.svg'
import faderSlotMuteDark from '../assets/fader-slot-mute-dark.svg'
import faderKnobLight from '../assets/fader-knob-light.svg'
import faderKnobMuteLight from '../assets/fader-knob-mute-light.svg'
import faderSlotLight from '../assets/fader-slot-light.svg'
import './Fader.scss'

const FADER_HEIGHT = 41
const FADER_MIN_PX = 7
const FADER_MAX_PX = 43

export default function Fader({ label, grabbing, setGrabbing, value, setValue, mute, theme, className }) {
  const faderRef = useRef()

  const faderSlotGraphic = useMemo(() => {
    switch (theme) {
      case 'light':
        return faderSlot
      case 'dark':
        return mute ? faderSlotMuteDark : faderSlotDark
      case 'contrast':
        return faderSlotLight
      default:
        return faderSlot
    }
  }, [mute, theme])

  const faderKnobGraphic = useMemo(() => {
    switch (theme) {
      case 'light':
        return mute ? faderKnobMute : faderKnob
      case 'dark':
        return mute ? faderKnobMuteDark : faderKnobDark
      case 'contrast':
        return mute ? faderKnobMuteLight : faderKnobLight
      default:
        return faderKnob
    }
  }, [mute, theme])

  const faderTop = useRef()
  const drag = useGesture({
    onDrag: ({ xy: [x, y] }) => {
      const newValue = constrain(
        scaleToRange(constrain(y - faderTop.current, FADER_MIN_PX, FADER_MAX_PX), FADER_MIN_PX, FADER_MAX_PX, 1, 0),
        0,
        1
      )
      setValue(newValue)
    },
    onDragStart: () => {
      faderTop.current = faderRef.current.getBoundingClientRect().top
      setGrabbing(true)
    },
    onDragEnd: () => {
      setGrabbing(false)
    },
    onClick: (e) => {
      e.event.stopPropagation()
    },
  })

  const faderStyle = useMemo(() => ({ top: FADER_HEIGHT * (1 - value) - 1 }), [value])

  return (
    <div className={classNames('fader channel-module', className)} {...drag()} ref={faderRef}>
      <img src={faderSlotGraphic} alt="" className="fader-slot" draggable="false" />
      <img
        src={faderKnobGraphic}
        alt=""
        style={faderStyle}
        className={classNames('fader-knob no-select', { grabbing })}
        draggable="false"
      />
      <p className="fader-title">{label}</p>
    </div>
  )
}
Fader.propTypes = {
  value: PropTypes.number,
  setValue: PropTypes.func,
  grabbing: PropTypes.bool,
  setGrabbing: PropTypes.func,
  label: PropTypes.string,
  mute: PropTypes.bool,
  theme: PropTypes.string,
  className: PropTypes.string,
}
