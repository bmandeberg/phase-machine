import React, { useCallback, useMemo, useState, useEffect } from 'react'
import Switch from 'react-switch'
import Dropdown from '../components/Dropdown'
import MultiSelect from './MultiSelect'
import { THEMES, themedSwitch } from '../globals'
import classNames from 'classnames'
import { Preset } from '../types'
import './Settings.scss'

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
        alert('Presets copied to clipboard!')
      },
      () => {
        alert('Unable to copy presets to clipboard!')
      }
    )
  }, [presets, selectedPresets])

  const clearLocalStorage = useCallback(() => {
    const confirmClear = window.confirm('Are you sure you want to delete all presets and settings ⁉️')
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
