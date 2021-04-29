import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import Switch from 'react-switch'
import './Settings.scss'

export default function Settings({
  showStepNumbers,
  setShowStepNumbers,
  separateMIDIChannels,
  setSeparateMIDIChannels,
}) {
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
          offColor={'#e6e6e6'}
          onColor={'#e6e6e6'}
          offHandleColor={'#666666'}
          onHandleColor={'#33ff00'}
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
          offColor={'#e6e6e6'}
          onColor={'#e6e6e6'}
          offHandleColor={'#666666'}
          onHandleColor={'#33ff00'}
          width={48}
          height={24}
        />
      </div>
    </div>
  )
}
Settings.propTypes = {
  separateMIDIChannels: PropTypes.bool,
  setSeparateMIDIChannels: PropTypes.func,
  showStepNumbers: PropTypes.bool,
  setShowStepNumbers: PropTypes.func,
}
