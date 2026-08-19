import React, { useCallback, useMemo } from 'react'
import MidiInputMode from './MidiInputMode'
import Switch from 'react-switch'
import NumInput from './NumInput'
import {
  MidiChannelLabels,
  MidiChannelCells,
  midiAllCellLit,
  nextMidiOutChannels,
  sweepMidiOutChannels,
} from './MidiMatrix'
import useDragPaint from '../hooks/useDragPaint'
import { themedSwitch } from '../globals'
import './MIDIModal.scss'

// "All" readout for the input side (accept all channels)
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
  midiOutChannels?: number[]
  setMidiOutChannels: (value: number[]) => void
  theme: string
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
  midiOutChannels,
  setMidiOutChannels,
  theme,
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

  // Output cells: every click toggles (no modifier needed — this is the dedicated
  // editor, and toggling keeps multi-assign reachable on touch). "all" fills the
  // set or, when already full, deactivates output — as does toggling off the last
  // lit cell. Click-drag paints the pressed cell's new state across the row.
  const { beginPaint, paintState } = useDragPaint()
  const toggleOutChannel = useCallback(
    (midiChannel: number | null) => {
      const next = nextMidiOutChannels(midiOutChannels ?? [], midiChannel, true)
      if (midiChannel !== null) beginPaint(next.includes(midiChannel))
      setMidiOutChannels(next)
    },
    [midiOutChannels, setMidiOutChannels, beginPaint]
  )
  const sweepOutChannel = useCallback(
    (midiChannel: number) => {
      const paint = paintState()
      if (paint === null) return
      const next = sweepMidiOutChannels(midiOutChannels ?? [], midiChannel, paint)
      if (next !== null) setMidiOutChannels(next)
    },
    [midiOutChannels, setMidiOutChannels, paintState]
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
      <div className="modal-item midi-out-channels">
        <p className="modal-label">MIDI Output Channels</p>
        <div className="midi-matrix">
          <MidiChannelLabels />
          <div className="midi-matrix-row">
            <MidiChannelCells
              lit={midiOutChannels ?? []}
              allLit={midiAllCellLit('out', midiOutChannels ?? [])}
              color={color}
              onSelect={toggleOutChannel}
              onSweep={sweepOutChannel}
            />
          </div>
        </div>
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
