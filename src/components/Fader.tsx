import React, { useMemo, useRef } from 'react'
import classNames from 'classnames'
import { useGesture } from '@use-gesture/react'
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
import faderKnobAero from '../assets/fader-knob-aero.svg'
import faderSlotAero from '../assets/fader-slot-aero.svg'
import faderKnobCoquette from '../assets/fader-knob-coquette.svg'
import faderSlotCoquette from '../assets/fader-slot-coquette.svg'
import './Fader.scss'

const FADER_HEIGHT = 41
const FADER_MIN_PX = 7
const FADER_MAX_PX = 43

interface FaderProps {
  value: number
  setValue: (value: number) => void
  grabbing?: boolean
  setGrabbing: (grabbing: boolean) => void
  label?: string
  mute?: boolean
  theme: string
  className?: string
}

export default function Fader({ label, grabbing, setGrabbing, value, setValue, mute, theme, className }: FaderProps) {
  const faderRef = useRef<HTMLDivElement>(null)

  const faderSlotGraphic = useMemo(() => {
    switch (theme) {
      case 'light':
        return faderSlot
      case 'dark':
        return mute ? faderSlotMuteDark : faderSlotDark
      case 'contrast':
        return faderSlotLight
      case 'aero':
        return faderSlotAero
      case 'coquette':
        return faderSlotCoquette
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
      case 'aero':
        return faderKnobAero
      case 'coquette':
        return faderKnobCoquette
      default:
        return faderKnob
    }
  }, [mute, theme])

  const faderTop = useRef(0)
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
      faderTop.current = faderRef.current?.getBoundingClientRect().top ?? 0
      setGrabbing(true)
    },
    onDragEnd: () => {
      setGrabbing(false)
    },
  })

  const faderStyle = useMemo(() => ({ top: FADER_HEIGHT * (1 - value) - 1 }), [value])

  return (
    <div
      className={classNames('fader channel-module', className)}
      {...drag()}
      onClick={(e) => e.stopPropagation()}
      ref={faderRef}>

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
