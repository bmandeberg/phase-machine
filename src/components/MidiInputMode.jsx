import React, { useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Switch from 'react-switch'
import { themedSwitch } from '../globals'
import './MidiInputMode.scss'

export default function MidiInputMode({ midiHold, setMidiHold, theme }) {
  const offColor = useMemo(() => themedSwitch('offColor', theme), [theme])
  const onColor = useMemo(() => themedSwitch('onColor', theme), [theme])
  const onHandleColor = useMemo(() => themedSwitch('onHandleColor', theme), [theme])

  const setToggle = useCallback(() => {
    setMidiHold(false)
  }, [setMidiHold])

  const setHold = useCallback(() => {
    setMidiHold(true)
  }, [setMidiHold])

  return (
    <div className="midi-input-mode">
      <div onClick={setToggle} className={classNames('switch-label label-left', { selected: !midiHold })}>
        Toggle
      </div>
      <Switch
        // className="instrument-switch"
        onChange={setMidiHold}
        checked={midiHold}
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
      <p className="midi-input-mode-title no-select">MIDI Input</p>
    </div>
  )
}
MidiInputMode.propTypes = {
  midiHold: PropTypes.bool,
  setMidiHold: PropTypes.func,
  theme: PropTypes.string,
}
