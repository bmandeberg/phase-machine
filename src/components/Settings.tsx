import React, { useCallback, useMemo, useState, useEffect } from 'react'
import Switch from 'react-switch'
import Dropdown from '../components/Dropdown'
import MultiSelect from './MultiSelect'
import MidiMatrix from './MidiMatrix'
import { THEMES, themedSwitch } from '../globals'
import classNames from 'classnames'
import { ChannelMidiAssignment, Preset } from '../types'
import { alertDialog, confirmDialog, copyWithAlert } from '../dialog'
import { encodePreset } from '../presetCode'
import './Settings.scss'

// stable fallback so a missing channels prop doesn't defeat MidiMatrix's memo
const NO_CHANNELS: ChannelMidiAssignment[] = []

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
  ignorePresetsMidiChannels?: boolean
  setIgnorePresetsMidiChannels: any
  presetsStopTransport?: boolean
  setPresetsStopTransport: any
  channelMidiAssignments?: ChannelMidiAssignment[]
  setChannelMidiAssignment?: (id: string, midiChannels: number[]) => void
  setChannelMidiInAssignment?: (id: string, midiChannels: number[]) => void
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
  ignorePresetsMidiChannels,
  setIgnorePresetsMidiChannels,
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

  // the props every Switch in this modal shares (same shape MIDIModal uses)
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

  // Every plain on/off preference is this same labelled row — declare them as data so a
  // change to the switch (sizing, theme wiring, a11y) lands in one place. The order here
  // is the order they render in.
  const toggles: { label: string; checked?: boolean; onChange: (checked: boolean) => void }[] = [
    { label: 'Show step numbers', checked: showStepNumbers, onChange: setShowStepNumbers },
    { label: 'Presets restart timeline', checked: presetsRestartTransport, onChange: setPresetsRestartTransport },
    { label: 'Presets stop timeline', checked: presetsStopTransport, onChange: setPresetsStopTransport },
    { label: 'MIDI clock in', checked: midiClockIn, onChange: setMidiClockIn },
    { label: 'MIDI clock out', checked: midiClockOut, onChange: setMidiClockOut },
  ]
  const presetIgnoreToggles: typeof toggles = [
    { label: 'Ignore presets tempo', checked: ignorePresetsTempo, onChange: setIgnorePresetsTempo },
    {
      label: 'Ignore presets MIDI channels',
      checked: ignorePresetsMidiChannels,
      onChange: setIgnorePresetsMidiChannels,
    },
  ]
  const toggleEl = ({ label, checked, onChange }: (typeof toggles)[number]) => (
    <div className="settings-item" key={label}>
      <p className="settings-label">{label}</p>
      <Switch className="instrument-switch" onChange={onChange} checked={checked ?? false} {...switchProps} />
    </div>
  )

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
    // compressed base64 (see presetCode.ts) — Import Presets accepts this and legacy raw JSON
    copyWithAlert(encodePreset(exportPresets), 'Presets copied to clipboard!', 'Unable to copy presets to clipboard!')
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
      {toggles.map(toggleEl)}
      <MidiMatrix
        label="MIDI out matrix"
        channels={channelMidiAssignments ?? NO_CHANNELS}
        variant="out"
        onAssign={setChannelMidiAssignment}
        modalType={modalType}
      />
      <MidiMatrix
        label="MIDI in matrix"
        channels={channelMidiAssignments ?? NO_CHANNELS}
        variant="in"
        onAssign={setChannelMidiInAssignment}
        modalType={modalType}
      />
      {presetIgnoreToggles.map(toggleEl)}
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
            {...switchProps}
            // this one is a labelled either/or, not an on/off — the handle keeps the
            // "on" color in both positions
            offHandleColor={onHandleColor}
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
