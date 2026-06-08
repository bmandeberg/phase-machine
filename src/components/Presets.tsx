import React, { useMemo, useCallback } from 'react'
import classNames from 'classnames'
import Dropdown from './Dropdown'
import { BROWSER } from '../globals'
import { confirmDialog } from '../dialog'
import { Preset } from '../types'
import addIcon from '../assets/plus-icon-orange.svg'
import addIconBlue from '../assets/plus-icon-blue.svg'
import addIconDark from '../assets/plus-icon-dark.svg'
import trashIcon from '../assets/trash-icon.svg'
import trashIconBlue from '../assets/trash-icon-blue.svg'
import trashIconDark from '../assets/trash-icon-dark.svg'
import trashIconDisabled from '../assets/trash-icon-disabled.svg'
import trashIconDisabledBlue from '../assets/trash-icon-disabled-blue.svg'
import trashIconDisabledDark from '../assets/trash-icon-disabled-dark.svg'
import saveIcon from '../assets/save-icon.svg'
import saveIconBlue from '../assets/save-icon-blue.svg'
import saveIconDark from '../assets/save-icon-dark.svg'
import saveIconDisabled from '../assets/save-icon-disabled.svg'
import saveIconDisabledBlue from '../assets/save-icon-disabled-blue.svg'
import saveIconDisabledDark from '../assets/save-icon-disabled-dark.svg'
import edited from '../assets/edit-tag.svg'
import './Presets.scss'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface PresetsProps {
  className?: string
  preset: Preset
  presetOptions?: any[]
  setPresetName: any
  setPreset: any
  presetDirty?: boolean
  hotkey?: number
  presetHotkey?: number | string | null
  savePreset: () => void
  newPreset: () => void
  deletePreset: () => void
  theme: string
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function Presets({
  className,
  preset,
  presetOptions,
  setPresetName,
  setPreset,
  presetDirty,
  hotkey,
  presetHotkey,
  savePreset,
  newPreset,
  deletePreset,
  theme,
}: PresetsProps) {
  const inputPadding = useMemo(() => {
    let padding = 2
    if (presetDirty) {
      padding += 17
    }
    if (presetHotkey !== null) {
      padding += 17
    }
    return padding
  }, [presetDirty, presetHotkey])

  const activeTrashIcon = useMemo(() => {
    switch (theme) {
      case 'light':
        return preset.placeholder ? trashIconDisabled : trashIcon
      case 'dark':
      case 'aero':
        return preset.placeholder ? trashIconDisabledBlue : trashIconBlue
      case 'contrast':
        return preset.placeholder ? trashIconDisabledDark : trashIconDark
      default:
        return preset.placeholder ? trashIconDisabled : trashIcon
    }
  }, [preset.placeholder, theme])

  const activeSaveIcon = useMemo(() => {
    switch (theme) {
      case 'light':
        return presetDirty || preset.placeholder ? saveIcon : saveIconDisabled
      case 'dark':
      case 'aero':
        return presetDirty || preset.placeholder ? saveIconBlue : saveIconDisabledBlue
      case 'contrast':
        return presetDirty || preset.placeholder ? saveIconDark : saveIconDisabledDark
      default:
        return presetDirty || preset.placeholder ? saveIcon : saveIconDisabled
    }
  }, [preset.placeholder, presetDirty, theme])

  const activeAddIcon = useMemo(() => {
    switch (theme) {
      case 'light':
        return addIcon
      case 'dark':
      case 'aero':
        return addIconBlue
      case 'contrast':
        return addIconDark
      default:
        return addIcon
    }
  }, [theme])

  const doSave = useCallback(() => {
    if (!(!presetDirty && !preset.placeholder)) {
      savePreset()
    }
  }, [preset.placeholder, presetDirty, savePreset])

  const doDelete = useCallback(async () => {
    if (!preset.placeholder) {
      const confirmed = await confirmDialog(`Are you sure you want to delete the preset "${preset.name}" ⁉️`, {
        danger: true,
        confirmText: 'Delete',
      })
      if (confirmed) {
        deletePreset()
      }
    }
  }, [deletePreset, preset.placeholder, preset.name])

  const presetEdited = useMemo(() => <img className="preset-edited" src={edited} alt="" />, [])
  const presetHotkeyEl = useMemo(
    () => (
      <div className="preset-hotkey">
        <p>{presetHotkey}</p>
      </div>
    ),
    [presetHotkey]
  )
  const inputStyle = useMemo(
    () => ({ paddingRight: inputPadding, lineHeight: BROWSER.name?.includes('Safari') ? 21 + 'px' : 22 + 'px' }),
    [inputPadding]
  )

  return (
    <div className={classNames('presets-container', className)}>
      <div className="presets">
        <input className="spacebar-ok" type="text" value={preset.name} onChange={setPresetName} style={inputStyle} />
        <div className="preset-tags">
          {(presetDirty || preset.placeholder) && presetEdited}
          {presetHotkey !== null && presetHotkeyEl}
        </div>
        <Dropdown
          options={presetOptions ?? []}
          value={preset.id}
          placeholder="New Preset"
          setValue={setPreset}
          noTextTransform
          small
        />
        <div className="preset-dummy"></div>
        <div
          className={classNames('preset-action preset-save', {
            disabled: !presetDirty && !preset.placeholder,
          })}
          onClick={doSave}
          title="Save Preset">
          <img src={activeSaveIcon} alt="Save" draggable="false" />
        </div>
        <div
          className={classNames('preset-action preset-delete', { disabled: preset.placeholder })}
          onClick={doDelete}
          title="Delete Preset">
          <img src={activeTrashIcon} alt="Delete" draggable="false" />
        </div>
        <div className="preset-action preset-new" onClick={newPreset} title="Duplicate Preset">
          <img src={activeAddIcon} alt="Duplicate" draggable="false" />
        </div>
      </div>
      <p className="presets-label no-select">Preset</p>
    </div>
  )
}
