import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import MidiInputMode from './MidiInputMode'
import Switch from 'react-switch'
import NumInput from './NumInput'
import { themedSwitch } from '../globals'
import './MIDIModal.scss'

export default function MIDIModal({
  midiHold,
  setMidiHold,
  customMidiOutChannel,
  setCustomMidiOutChannel,
  channelNum,
  theme,
  midiOutChannel,
  setMidiOutChannel,
}) {
  const offColor = useMemo(() => themedSwitch('offColor', theme), [theme])
  const onColor = useMemo(() => themedSwitch('onColor', theme), [theme])
  const offHandleColor = useMemo(() => themedSwitch('offHandleColor', theme, false), [theme])
  const onHandleColor = useMemo(() => themedSwitch('onHandleColor', theme), [theme])

  return (
    <div className="midi-modal">
      <div className="modal-item modal-num-input">
        <p className="modal-label">MIDI Output Channel</p>
        {!customMidiOutChannel && <p className="channel-num">{channelNum + 1}</p>}
        {customMidiOutChannel && (
          <div className="modal-param">
            <NumInput value={midiOutChannel} setValue={setMidiOutChannel} min={1} max={16} />
          </div>
        )}
      </div>
      <div className="modal-item">
        <p className="modal-label">Custom Output Channel</p>
        <Switch
          className="modal-param"
          onChange={setCustomMidiOutChannel}
          checked={customMidiOutChannel}
          uncheckedIcon={false}
          checkedIcon={false}
          offColor={offColor}
          onColor={onColor}
          offHandleColor={offHandleColor}
          onHandleColor={onHandleColor}
          width={48}
          height={24}
        />
      </div>
      <div className="modal-item">
        <MidiInputMode midiHold={midiHold} setMidiHold={setMidiHold} theme={theme} />
      </div>
    </div>
  )
}
MIDIModal.propTypes = {
  midiHold: PropTypes.bool,
  setMidiHold: PropTypes.func,
  customMidiOutChannel: PropTypes.bool,
  setCustomMidiOutChannel: PropTypes.func,
  channelNum: PropTypes.number,
  midiOutChannel: PropTypes.number,
  setMidiOutChannel: PropTypes.func,
  theme: PropTypes.string,
}
