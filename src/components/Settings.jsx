import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import Switch from 'react-switch'
import Dropdn from '../components/Dropdn'
import { THEMES, themedSwitch } from '../globals'
import './Settings.scss'

export default function Settings({
  showStepNumbers,
  setShowStepNumbers,
  separateMIDIChannels,
  setSeparateMIDIChannels,
  linearKnobs,
  setLinearKnobs,
  hotkeyRestart,
  setHotkeyRestart,
  theme,
  setTheme,
}) {
  const setKnobType = useCallback(
    (knobType) => {
      setLinearKnobs(knobType === 'Linear')
    },
    [setLinearKnobs]
  )

  return (
    <div className="settings">
      <div className="settings-item">
        <p className="settings-label">Show step numbers</p>
        <Switch
          className="instrument-switch"
          onChange={setShowStepNumbers}
          checked={showStepNumbers}
          uncheckedIcon={false}
          checkedIcon={false}
          offColor={themedSwitch('offColor', theme)}
          onColor={themedSwitch('onColor', theme)}
          offHandleColor={themedSwitch('offHandleColor', theme)}
          onHandleColor={themedSwitch('onHandleColor', theme)}
          width={48}
          height={24}
        />
      </div>
      <div className="settings-item">
        <p className="settings-label">Separate MIDI channels</p>
        <Switch
          className="instrument-switch"
          onChange={setSeparateMIDIChannels}
          checked={separateMIDIChannels}
          uncheckedIcon={false}
          checkedIcon={false}
          offColor={themedSwitch('offColor', theme)}
          onColor={themedSwitch('onColor', theme)}
          offHandleColor={themedSwitch('offHandleColor', theme)}
          onHandleColor={themedSwitch('onHandleColor', theme)}
          width={48}
          height={24}
        />
      </div>
      <div className="settings-item">
        <p className="settings-label">Hotkey Restart Sequencer</p>
        <Switch
          className="instrument-switch"
          onChange={setHotkeyRestart}
          checked={hotkeyRestart}
          uncheckedIcon={false}
          checkedIcon={false}
          offColor={themedSwitch('offColor', theme)}
          onColor={themedSwitch('onColor', theme)}
          offHandleColor={themedSwitch('offHandleColor', theme)}
          onHandleColor={themedSwitch('onHandleColor', theme)}
          width={48}
          height={24}
        />
      </div>
      <div className="settings-item dropdown">
        <p className="settings-label">Knob type</p>
        <Dropdn
          options={['Linear', 'Relative Circular']}
          value={linearKnobs ? 'Linear' : 'Relative Circular'}
          setValue={setKnobType}
          noTextTransform
        />
      </div>
      <div className="settings-item dropdown">
        <p className="settings-label">Theme</p>
        <Dropdn options={THEMES} value={theme} setValue={setTheme} capitalize />
      </div>
    </div>
  )
}
Settings.propTypes = {
  separateMIDIChannels: PropTypes.bool,
  setSeparateMIDIChannels: PropTypes.func,
  showStepNumbers: PropTypes.bool,
  setShowStepNumbers: PropTypes.func,
  linearKnobs: PropTypes.bool,
  setLinearKnobs: PropTypes.func,
  hotkeyRestart: PropTypes.bool,
  setHotkeyRestart: PropTypes.func,
  theme: PropTypes.string,
  setTheme: PropTypes.func,
}
