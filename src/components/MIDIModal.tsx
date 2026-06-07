import React, { useMemo } from 'react'
import MidiInputMode from './MidiInputMode'
import Switch from 'react-switch'
import NumInput from './NumInput'
import { themedSwitch } from '../globals'
import './MIDIModal.scss'

interface MIDIModalProps {
  midiHold?: boolean
  setMidiHold: (midiHold: boolean) => void
  customMidiOutChannel?: boolean
  setCustomMidiOutChannel: (custom: boolean) => void
  channelNum?: number
  theme: string
  midiOutChannel?: number
  setMidiOutChannel: (value: number) => void
  color: string
}

export default function MIDIModal({
  midiHold,
  setMidiHold,
  customMidiOutChannel,
  setCustomMidiOutChannel,
  channelNum,
  theme,
  midiOutChannel,
  setMidiOutChannel,
  color,
}: MIDIModalProps) {
  const offColor = useMemo(() => themedSwitch('offColor', theme), [theme])
  const onColor = useMemo(() => themedSwitch('onColor', theme), [theme])
  const offHandleColor = useMemo(() => themedSwitch('offHandleColor', theme, false), [theme])
  // "on" handle uses the channel color (on = channel color)
  const onHandleColor = color

  const midiChannel = useMemo(() => <p className="channel-num">{(channelNum ?? 0) + 1}</p>, [channelNum])
  const customInput = useMemo(
    () => (
      <div className="modal-param">
        <NumInput value={midiOutChannel ?? 1} setValue={setMidiOutChannel} min={1} max={16} />
      </div>
    ),
    [midiOutChannel, setMidiOutChannel]
  )

  return (
    <div className="midi-modal">
      <div className="modal-item modal-num-input">
        <p className="modal-label">MIDI Output Channel</p>
        {!customMidiOutChannel && midiChannel}
        {customMidiOutChannel && customInput}
      </div>
      <div className="modal-item">
        <p className="modal-label">Custom Output Channel</p>
        <Switch
          className="modal-param"
          onChange={setCustomMidiOutChannel}
          checked={customMidiOutChannel ?? false}
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
        <MidiInputMode midiHold={midiHold} setMidiHold={setMidiHold} theme={theme} color={color} />
      </div>
    </div>
  )
}
