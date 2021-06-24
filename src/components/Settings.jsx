import React, { useCallback, useMemo, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Switch from 'react-switch'
import Dropdn from '../components/Dropdn'
import MultiSelect from './MultiSelect'
import { THEMES, themedSwitch } from '../globals'
import './Settings.scss'

export default function Settings({
  showStepNumbers,
  setShowStepNumbers,
  linearKnobs,
  setLinearKnobs,
  hotkeyRestart,
  setHotkeyRestart,
  theme,
  setTheme,
  presets,
  importPresets,
  modalType,
}) {
  const setKnobType = useCallback(
    (knobType) => {
      setLinearKnobs(knobType === 'Linear')
    },
    [setLinearKnobs]
  )

  const offColor = useMemo(() => themedSwitch('offColor', theme), [theme])
  const onColor = useMemo(() => themedSwitch('onColor', theme), [theme])
  const offHandleColor = useMemo(() => themedSwitch('offHandleColor', theme, false), [theme])
  const onHandleColor = useMemo(() => themedSwitch('onHandleColor', theme), [theme])

  const knobsDropdownValue = useMemo(() => (linearKnobs ? 'Linear' : 'Relative Circular'), [linearKnobs])

  const presetNames = useMemo(() => presets.map((p) => p.name), [presets])
  const [selectedPresets, setSelectedPresets] = useState([])
  const [presetsJSON, setPresetsJSON] = useState('')

  const updatePresetsJSON = useCallback((e) => {
    setPresetsJSON(e.target.value)
  }, [])

  useEffect(() => {
    if (!modalType) {
      setSelectedPresets([])
    }
  }, [modalType])

  const copyPresets = useCallback(() => {
    const exportPresets = presets.filter((p) => selectedPresets.includes(p.name))
    navigator.clipboard.writeText(JSON.stringify(exportPresets)).then(
      () => {
        alert('Presets copied to clipboard!')
      },
      () => {
        alert('Unable to copy presets to clipboard!')
      }
    )
  }, [presets, selectedPresets])

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
          offColor={offColor}
          onColor={onColor}
          offHandleColor={offHandleColor}
          onHandleColor={onHandleColor}
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
          offColor={offColor}
          onColor={onColor}
          offHandleColor={offHandleColor}
          onHandleColor={onHandleColor}
          width={48}
          height={24}
        />
      </div>
      <div className="settings-item dropdown">
        <p className="settings-label">Knob type</p>
        <Dropdn
          options={['Linear', 'Relative Circular']}
          value={knobsDropdownValue}
          setValue={setKnobType}
          noTextTransform
        />
      </div>
      <div className="settings-item dropdown">
        <p className="settings-label">Theme</p>
        <Dropdn options={THEMES} value={theme} setValue={setTheme} capitalize />
      </div>
      <div className="settings-item">
        <p>Export Presets</p>
        <MultiSelect
          options={presetNames}
          values={selectedPresets}
          setValues={setSelectedPresets}
          placeholder="Select Presets"
        />
        {selectedPresets.length > 0 && (
          <div onClick={copyPresets} className="presets-action button green-button">
            Copy Presets to clipboard
          </div>
        )}
      </div>
      <div className="settings-item">
        <p>Import Presets</p>
        <textarea value={presetsJSON} onChange={updatePresetsJSON} />
        {presetsJSON.length > 0 && (
          <div onClick={() => importPresets(presetsJSON)} className="presets-action button green-button">
            Import Presets
          </div>
        )}
      </div>
    </div>
  )
}
Settings.propTypes = {
  showStepNumbers: PropTypes.bool,
  setShowStepNumbers: PropTypes.func,
  linearKnobs: PropTypes.bool,
  setLinearKnobs: PropTypes.func,
  hotkeyRestart: PropTypes.bool,
  setHotkeyRestart: PropTypes.func,
  theme: PropTypes.string,
  setTheme: PropTypes.func,
  presets: PropTypes.array,
  importPresets: PropTypes.func,
  modalType: PropTypes.string,
}
