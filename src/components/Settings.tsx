import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import Switch from 'react-switch'
import Dropdown from '../components/Dropdown'
import MultiSelect from './MultiSelect'
import { THEMES, themedSwitch, ALL_MIDI_CHANNELS } from '../globals'
import classNames from 'classnames'
import { ChannelMidiAssignment, Preset } from '../types'
import { alertDialog, confirmDialog } from '../dialog'
import './Settings.scss'

// One MIDI routing matrix (out or in): rows are phase machine channels, columns are
// "all" + MIDI channels 1-16, radio-style cells. Owns its own condensed/expanded
// state (collapsed by default, re-condensing when the modal closes) and an
// optimistic overlay: a clicked assignment round-trips through the channel (whose
// upward state report is debounced) before it comes back in `channels`, so the
// clicked value is held here in the meantime. An entry is dropped once the channel
// catches up — or when the actual value changes to anything else, so an external
// write can never be masked by a stale click. Values may be null ("all"), so
// presence is checked with `in`.
// stable fallback so a missing channels prop doesn't defeat MidiMatrix's memo
const NO_CHANNELS: ChannelMidiAssignment[] = []

interface MidiMatrixProps {
  label: string
  channels: ChannelMidiAssignment[]
  field: 'midiOutChannel' | 'midiInChannel'
  onAssign?: (id: string, midiChannel: number | null) => void
  modalType?: string | null
}

const MidiMatrix = React.memo(function MidiMatrix({ label, channels, field, onAssign, modalType }: MidiMatrixProps) {
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = useCallback(() => setExpanded((e) => !e), [])
  const [pending, setPending] = useState<Record<string, number | null>>({})

  const assign = useCallback(
    (id: string, midiChannel: number | null) => {
      setPending((pending) => ({ ...pending, [id]: midiChannel }))
      onAssign?.(id, midiChannel)
    },
    [onAssign]
  )

  const prevChannels = useRef(channels)
  useEffect(() => {
    const prev = prevChannels.current
    prevChannels.current = channels
    setPending((pending) => {
      if (Object.keys(pending).length === 0) return pending
      let changed = false
      const next = { ...pending }
      channels.forEach((c) => {
        if (!(c.id in next)) return
        if (c[field] === next[c.id] || c[field] !== prev.find((p) => p.id === c.id)?.[field]) {
          delete next[c.id]
          changed = true
        }
      })
      return changed ? next : pending
    })
  }, [channels, field])

  useEffect(() => {
    if (!modalType) {
      setExpanded(false)
      setPending({})
    }
  }, [modalType])

  return (
    <div className="settings-item midi-matrix-item">
      <div className="midi-matrix-header" onClick={toggleExpanded}>
        <p className="settings-label">{label}</p>
        <span className={classNames('midi-matrix-arrow', { expanded })}></span>
      </div>
      {expanded && (
        <div className="midi-matrix">
          {channels.length ? (
            <>
              <div className="midi-matrix-row">
                <div className="midi-matrix-row-label"></div>
                <div className="midi-matrix-column-label all">all</div>
                {ALL_MIDI_CHANNELS.map((midiChannel) => (
                  <div key={midiChannel} className="midi-matrix-column-label">
                    {midiChannel}
                  </div>
                ))}
              </div>
              {channels.map((channel) => {
                const assigned = channel.id in pending ? pending[channel.id] : channel[field]
                return (
                  <div key={channel.id} className="midi-matrix-row">
                    <div className="midi-matrix-row-label" style={{ color: channel.color }}>
                      {channel.channelNum + 1}
                    </div>
                    <div
                      className={classNames('midi-matrix-cell', { assigned: assigned === null })}
                      style={assigned === null ? { backgroundColor: channel.color } : undefined}
                      onClick={() => assign(channel.id, null)}></div>
                    {ALL_MIDI_CHANNELS.map((midiChannel) => (
                      <div
                        key={midiChannel}
                        className={classNames('midi-matrix-cell', { assigned: assigned === midiChannel })}
                        style={assigned === midiChannel ? { backgroundColor: channel.color } : undefined}
                        onClick={() => assign(channel.id, midiChannel)}></div>
                    ))}
                  </div>
                )
              })}
            </>
          ) : (
            <p className="midi-matrix-empty">no channels</p>
          )}
        </div>
      )}
    </div>
  )
})

/* eslint-disable @typescript-eslint/no-explicit-any */
interface SettingsProps {
  showStepNumbers?: boolean
  setShowStepNumbers: any
  defaultChannelModeKeybd?: boolean
  setDefaultChannelModeKeybd: any
  theme: string
  setTheme: any
  presets: Preset[]
  importPresets: (json: string) => void
  modalType?: string | null
  presetsRestartTransport?: boolean
  setPresetsRestartTransport: any
  midiClockIn?: boolean
  setMidiClockIn: any
  midiClockOut?: boolean
  setMidiClockOut: any
  ignorePresetsTempo?: boolean
  setIgnorePresetsTempo: any
  presetsStopTransport?: boolean
  setPresetsStopTransport: any
  channelMidiAssignments?: ChannelMidiAssignment[]
  setChannelMidiAssignment?: (id: string, midiChannel: number | null) => void
  setChannelMidiInAssignment?: (id: string, midiChannel: number | null) => void
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function Settings({
  showStepNumbers,
  setShowStepNumbers,
  defaultChannelModeKeybd,
  setDefaultChannelModeKeybd,
  theme,
  setTheme,
  presets,
  importPresets,
  modalType,
  presetsRestartTransport,
  setPresetsRestartTransport,
  midiClockIn,
  setMidiClockIn,
  midiClockOut,
  setMidiClockOut,
  ignorePresetsTempo,
  setIgnorePresetsTempo,
  presetsStopTransport,
  setPresetsStopTransport,
  channelMidiAssignments,
  setChannelMidiAssignment,
  setChannelMidiInAssignment,
}: SettingsProps) {

  const setRangeModeDefault = useCallback(() => {
    setDefaultChannelModeKeybd(false)
  }, [setDefaultChannelModeKeybd])

  const setKeybdModeDefault = useCallback(() => {
    setDefaultChannelModeKeybd(true)
  }, [setDefaultChannelModeKeybd])

  const offColor = useMemo(() => themedSwitch('offColor', theme), [theme])
  const onColor = useMemo(() => themedSwitch('onColor', theme), [theme])
  const offHandleColor = useMemo(() => themedSwitch('offHandleColor', theme, false), [theme])
  const onHandleColor = useMemo(() => themedSwitch('onHandleColor', theme), [theme])

  const presetNames = useMemo(() => presets.map((p) => p.name), [presets])
  const [selectedPresets, setSelectedPresets] = useState<string[]>([])
  const [presetsJSON, setPresetsJSON] = useState('')

  const updatePresetsJSON = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPresetsJSON(e.target.value)
  }, [])

  useEffect(() => {
    if (!modalType) {
      setSelectedPresets([])
    }
  }, [modalType])

  const copyPresets = useCallback(() => {
    const exportPresets = selectedPresets.map((sp) => presets.find((p) => p.name === sp))
    navigator.clipboard.writeText(JSON.stringify(exportPresets)).then(
      () => {
        alertDialog('Presets copied to clipboard!')
      },
      () => {
        alertDialog('Unable to copy presets to clipboard!')
      }
    )
  }, [presets, selectedPresets])

  const clearLocalStorage = useCallback(async () => {
    const confirmClear = await confirmDialog('Are you sure you want to delete all presets and settings ⁉️', {
      danger: true,
      confirmText: 'Delete',
    })
    if (confirmClear) {
      localStorage.clear()
      window.location.reload()
    }
  }, [])

  const copyPresetsEl = useMemo(
    () => (
      <div onClick={copyPresets} className="presets-action button green-button">
        Copy Presets to clipboard
      </div>
    ),
    [copyPresets]
  )
  const importPresetsEl = useMemo(
    () => (
      <div onClick={() => importPresets(presetsJSON)} className="presets-action button green-button">
        Import Presets
      </div>
    ),
    [importPresets, presetsJSON]
  )

  return (
    <div className="settings">
      <div className="settings-item">
        <p className="settings-label">Show step numbers</p>
        <Switch
          className="instrument-switch"
          onChange={setShowStepNumbers}
          checked={showStepNumbers ?? false}
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
      <div className="settings-item">
        <p className="settings-label">Presets restart timeline</p>
        <Switch
          className="instrument-switch"
          onChange={setPresetsRestartTransport}
          checked={presetsRestartTransport ?? false}
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
      <div className="settings-item">
        <p className="settings-label">Presets stop timeline</p>
        <Switch
          className="instrument-switch"
          onChange={setPresetsStopTransport}
          checked={presetsStopTransport ?? false}
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
      <div className="settings-item">
        <p className="settings-label">MIDI clock in</p>
        <Switch
          className="instrument-switch"
          onChange={setMidiClockIn}
          checked={midiClockIn ?? false}
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
      <div className="settings-item">
        <p className="settings-label">MIDI clock out</p>
        <Switch
          className="instrument-switch"
          onChange={setMidiClockOut}
          checked={midiClockOut ?? false}
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
      <MidiMatrix
        label="MIDI out matrix"
        channels={channelMidiAssignments ?? NO_CHANNELS}
        field="midiOutChannel"
        onAssign={setChannelMidiAssignment}
        modalType={modalType}
      />
      <MidiMatrix
        label="MIDI in matrix"
        channels={channelMidiAssignments ?? NO_CHANNELS}
        field="midiInChannel"
        onAssign={setChannelMidiInAssignment}
        modalType={modalType}
      />
      <div className="settings-item">
        <p className="settings-label">Ignore presets tempo</p>
        <Switch
          className="instrument-switch"
          onChange={setIgnorePresetsTempo}
          checked={ignorePresetsTempo ?? false}
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
      <div className="settings-item">
        <p className="settings-label">Default channel mode</p>
        <div className="switch-container inline">
          <p
            onClick={setRangeModeDefault}
            className={classNames('switch-label label-left', { selected: !defaultChannelModeKeybd })}>
            Range
          </p>
          <Switch
            className="switch"
            onChange={setDefaultChannelModeKeybd}
            checked={defaultChannelModeKeybd ?? false}
            uncheckedIcon={false}
            checkedIcon={false}
            offColor={offColor}
            onColor={onColor}
            offHandleColor={onHandleColor}
            onHandleColor={onHandleColor}
            width={48}
            height={24}
          />
          <p
            onClick={setKeybdModeDefault}
            className={classNames('switch-label', { selected: defaultChannelModeKeybd })}>
            Keybd
          </p>
        </div>
      </div>
      <div className="settings-item dropdown">
        <p className="settings-label">Theme</p>
        <Dropdown options={THEMES} value={theme} setValue={setTheme} capitalize />
      </div>
      <div className="settings-item">
        <p>Export Presets</p>
        {selectedPresets.length > 0 && copyPresetsEl}
        <MultiSelect
          options={presetNames}
          values={selectedPresets}
          setValues={setSelectedPresets}
          placeholder="Select Presets"
          container=".modal-content"
        />
      </div>
      <div className="settings-item">
        <p>Import Presets</p>
        {presetsJSON.length > 0 && importPresetsEl}
        <textarea value={presetsJSON} onChange={updatePresetsJSON} />
      </div>
      <div className="settings-item">
        <div onClick={clearLocalStorage} className="button red-button">
          Delete Presets and Settings
        </div>
      </div>
    </div>
  )
}
