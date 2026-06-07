import React, { useMemo, useCallback } from 'react'
import classNames from 'classnames'
import Switch from 'react-switch'
import { themedSwitch } from '../globals'
import './MidiInputMode.scss'

interface MidiInputModeProps {
  midiHold?: boolean
  setMidiHold: (midiHold: boolean) => void
  theme: string
  color: string
}

export default function MidiInputMode({ midiHold, setMidiHold, theme, color }: MidiInputModeProps) {
  const offColor = useMemo(() => themedSwitch('offColor', theme), [theme])
  const onColor = useMemo(() => themedSwitch('onColor', theme), [theme])
  // the toggle handle uses the channel color (on/selected = channel color)
  const onHandleColor = color

  const setToggle = useCallback(() => {
    setMidiHold(false)
  }, [setMidiHold])

  const setHold = useCallback(() => {
    setMidiHold(true)
  }, [setMidiHold])

  return (
    <div className="midi-input-mode">
      <div className="midi-input-switch-container">
        <div onClick={setToggle} className={classNames('switch-label label-left', { selected: !midiHold })}>
          Toggle
        </div>
        <Switch
          className="switch"
          onChange={setMidiHold}
          checked={midiHold ?? false}
          uncheckedIcon={false}
          checkedIcon={false}
          offColor={offColor}
          onColor={onColor}
          offHandleColor={onHandleColor}
          onHandleColor={onHandleColor}
          width={48}
          height={24}
        />
        <div onClick={setHold} className={classNames('switch-label label-right', { selected: midiHold })}>
          Hold
        </div>
      </div>
      <p className="midi-input-mode-title no-select">MIDI In</p>
    </div>
  )
}
