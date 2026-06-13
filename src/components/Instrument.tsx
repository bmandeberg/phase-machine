import React, { useMemo } from 'react'
import classNames from 'classnames'
import Switch from 'react-switch'
import Dropdown from './Dropdown'
import { INSTRUMENT_TYPES, themedSwitch } from '../globals'
import './Instrument.scss'

// The modal instrument picker groups the icons under category headings (laid out in a
// horizontal grid under each). Order/membership are intentional; every `value` must
// exist in INSTRUMENT_TYPES, and `label` is the icon's hover tooltip (the glyphs aren't
// self-explanatory). Widest group (Instruments = 6) sets the grid column count.
const INSTRUMENT_GROUPS: { heading: string; instruments: { value: string; label: string }[] }[] = [
  {
    heading: 'Synthesizers',
    instruments: [
      { value: 'synth', label: 'Synthesizer' },
      { value: 'metal', label: 'Metal Synth' },
      { value: 'pluck', label: 'Pluck Synth' },
    ],
  },
  {
    heading: 'Instruments',
    instruments: [
      { value: 'bass', label: 'Bass' },
      { value: 'piano', label: 'Piano' },
      { value: 'marimba', label: 'Marimba' },
      { value: 'vibes', label: 'Vibraphone' },
      { value: 'harp', label: 'Harp' },
      { value: 'choral', label: 'Vocal' },
    ],
  },
  {
    heading: 'Drum Samplers',
    instruments: [
      { value: 'drums', label: 'Drums' },
      { value: 'drum-machine', label: 'Drum Machine' },
      { value: 'hxc', label: 'Hardcore' },
      { value: 'rhythmic', label: 'Breaks' },
      { value: 'percussion', label: 'Percussion Chops' },
    ],
  },
]
const INSTRUMENT_GRID_COLUMNS = Math.max(...INSTRUMENT_GROUPS.map((g) => g.instruments.length))

interface InstrumentProps {
  className?: string
  instrumentOn?: boolean
  setInstrumentOn: (on: boolean) => void
  instrumentType: string
  setInstrumentType: (type: string) => void
  theme: string
  color: string
}

// The instrument On/Off switch + grouped type picker, shown inside the instrument
// modal (opened by the icon at the start of a channel).
export default function Instrument({
  className,
  instrumentOn,
  setInstrumentOn,
  instrumentType,
  setInstrumentType,
  theme,
  color,
}: InstrumentProps) {
  // Grouped list for the modal grid: a heading per category followed by its icons.
  const groupedInstrumentOptions = useMemo(
    () =>
      INSTRUMENT_GROUPS.flatMap((group) => [
        { heading: group.heading },
        ...group.instruments.map(({ value, label }) => ({
          value,
          // clone the icon to add a hover tooltip (title) without a wrapper element
          label: React.cloneElement(INSTRUMENT_TYPES[value](theme), { title: label }),
        })),
      ]),
    [theme]
  )

  const offColor = useMemo(() => themedSwitch('offColor', theme), [theme])
  const onColor = useMemo(() => themedSwitch('onColor', theme), [theme])
  const offHandleColor = useMemo(() => themedSwitch('offHandleColor', theme, false), [theme])
  // the instrument on/off handle uses the channel color when on (on = channel color)
  const onHandleColor = color

  return (
    <div className={classNames('instrument', className)}>
      <div className="instrument-switch-container">
        <div>
          <p className="switch-label">Off</p>
          <Switch
            className="instrument-switch"
            onChange={setInstrumentOn}
            checked={instrumentOn ?? false}
            uncheckedIcon={false}
            checkedIcon={false}
            offColor={offColor}
            onColor={onColor}
            offHandleColor={offHandleColor}
            onHandleColor={onHandleColor}
            width={48}
            height={24}
          />
          <p className="switch-label">On</p>
        </div>
        <div className="instrument-label">Instrument</div>
      </div>
      <Dropdown
        className="instrument-item instrument-dropdown"
        options={groupedInstrumentOptions}
        gridColumns={INSTRUMENT_GRID_COLUMNS}
        setValue={setInstrumentType}
        value={instrumentType}
      />
    </div>
  )
}
