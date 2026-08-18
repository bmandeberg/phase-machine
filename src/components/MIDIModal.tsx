import React, { useMemo } from 'react'
import MidiInputMode from './MidiInputMode'
import Switch from 'react-switch'
import NumInput from './NumInput'
import { themedSwitch } from '../globals'
import './MIDIModal.scss'

// "All" readout, shared by the output (midiOutAll) and input (non-custom) sides
const ALL_CHANNELS_EL = <p className="channel-num">All</p>

interface MIDIModalProps {
  midiIn?: boolean | string
  setMidiIn: React.Dispatch<React.SetStateAction<boolean | string>>
  midiHold?: boolean
  setMidiHold: (midiHold: boolean) => void
  customMidiInChannel?: boolean
  setCustomMidiInChannel: (custom: boolean) => void
  midiInChannel?: number
  setMidiInChannel: (value: number) => void
  midiOutAll?: boolean
  setMidiOutAll: (all: boolean) => void
  customMidiOutChannel?: boolean
  setCustomMidiOutChannel: (custom: boolean) => void
  channelNum?: number
  theme: string
  midiOutChannel?: number
  setMidiOutChannel: (value: number) => void
  color: string
}

export default function MIDIModal({
  midiIn,
  setMidiIn,
  midiHold,
  setMidiHold,
  customMidiInChannel,
  setCustomMidiInChannel,
  midiInChannel,
  setMidiInChannel,
  midiOutAll,
  setMidiOutAll,
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

  // the props every Switch in this modal shares
  const switchProps = useMemo(
    () => ({
      uncheckedIcon: false as const,
      checkedIcon: false as const,
      offColor,
      onColor,
      offHandleColor,
      onHandleColor,
      width: 48,
      height: 24,
    }),
    [offColor, onColor, offHandleColor, onHandleColor]
  )

  const midiChannel = useMemo(() => <p className="channel-num">{(channelNum ?? 0) + 1}</p>, [channelNum])
  const customInput = useMemo(
    () => (
      <div className="modal-param">
        <NumInput value={midiOutChannel ?? 1} setValue={setMidiOutChannel} min={1} max={16} />
      </div>
    ),
    [midiOutChannel, setMidiOutChannel]
  )

  const customInChannelInput = useMemo(
    () => (
      <div className="modal-param">
        <NumInput value={midiInChannel ?? 1} setValue={setMidiInChannel} min={1} max={16} />
      </div>
    ),
    [midiInChannel, setMidiInChannel]
  )

  return (
    <div className="midi-modal">
      <div className="modal-item modal-num-input">
        <p className="modal-label">MIDI Output Channel</p>
        {midiOutAll ? ALL_CHANNELS_EL : customMidiOutChannel ? customInput : midiChannel}
      </div>
      <div className="modal-item">
        <p className="modal-label">All Output Channels</p>
        <Switch className="modal-param" onChange={setMidiOutAll} checked={midiOutAll ?? false} {...switchProps} />
      </div>
      <div className="modal-item">
        <p className="modal-label">Custom Output Channel</p>
        <Switch
          className="modal-param"
          onChange={setCustomMidiOutChannel}
          checked={customMidiOutChannel ?? false}
          {...switchProps}
        />
      </div>
      <div className="modal-item">
        <p className="modal-label">MIDI Input</p>
        <Switch
          className="modal-param"
          onChange={(checked) => setMidiIn(checked)}
          checked={!!midiIn}
          {...switchProps}
        />
      </div>
      <div className="modal-item modal-num-input">
        <p className="modal-label">MIDI Input Channel</p>
        {customMidiInChannel ? customInChannelInput : ALL_CHANNELS_EL}
      </div>
      <div className="modal-item">
        <p className="modal-label">Custom Input Channel</p>
        <Switch
          className="modal-param"
          onChange={setCustomMidiInChannel}
          checked={customMidiInChannel ?? false}
          {...switchProps}
        />
      </div>
      <div className="modal-item">
        <MidiInputMode midiHold={midiHold} setMidiHold={setMidiHold} theme={theme} color={color} />
      </div>
    </div>
  )
}
