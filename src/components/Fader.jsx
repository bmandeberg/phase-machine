import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { useGesture } from 'react-use-gesture'
import { constrain } from '../math'
import faderSlot from '../assets/fader-slot.svg'
import faderKnob from '../assets/fader-knob.svg'
import faderKnobMute from '../assets/fader-knob-mute.svg'
import faderSlotDark from '../assets/fader-slot-dark.svg'
import faderKnobDark from '../assets/fader-knob-dark.svg'
import faderKnobMuteDark from '../assets/fader-knob-mute-dark.svg'
import faderSlotMuteDark from '../assets/fader-slot-mute-dark.svg'
import './Fader.scss'

const FADER_HEIGHT = 41

export default function Fader({ label, grabbing, setGrabbing, value, setValue, mute, theme }) {
  const faderClick = useCallback(
    (e) => {
      var bounding = e.target.getBoundingClientRect()
      const y = e.clientY - bounding.top
      if (y >= -2 && y <= FADER_HEIGHT + 9) {
        if (y < FADER_HEIGHT * 0.1) {
          setValue(1)
        } else if (y > FADER_HEIGHT * 0.9) {
          setValue(0)
        } else {
          setValue(1 - constrain(y / FADER_HEIGHT, 0, 1))
        }
      }
    },
    [setValue]
  )

  const faderSlotGraphic = useMemo(() => {
    if (theme === 'dark') {
      if (mute) {
        return faderSlotMuteDark
      }
      return faderSlotDark
    }
    return faderSlot
  }, [mute, theme])

  const faderKnobGraphic = useMemo(() => {
    if (mute) {
      return theme === 'dark' ? faderKnobMuteDark : faderKnobMute
    } else {
      return theme === 'dark' ? faderKnobDark : faderKnob
    }
  }, [mute, theme])

  const drag = useGesture({
    onDrag: ({ delta: [dx, dy] }) => {
      setValue((value) => constrain(value - dy / FADER_HEIGHT, 0, 1))
    },
    onDragStart: () => {
      setGrabbing(true)
    },
    onDragEnd: () => {
      setGrabbing(false)
    },
    onClick: (e) => {
      e.event.stopPropagation()
    },
  })

  return (
    <div className="fader channel-module" onClick={faderClick}>
      <img src={faderSlotGraphic} alt="" className="fader-slot" />
      <img
        src={faderKnobGraphic}
        alt=""
        style={{ top: FADER_HEIGHT * (1 - value) - 1 }}
        {...drag()}
        className={classNames('fader-knob', { grabbing })}
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
}
