import React, { useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Dropdn from './Dropdn'
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
}) {
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

  const doDelete = useCallback(() => {
    if (!preset.placeholder) {
      deletePreset()
    }
  }, [deletePreset, preset.placeholder])

  return (
    <div className={classNames('presets-container', className)}>
      <div className="presets">
        <input type="text" value={preset.name} onChange={setPresetName} style={{ paddingRight: inputPadding }} />
        <div className="preset-tags">
          {(presetDirty || preset.placeholder) && <img className="preset-edited" src={edited} alt="" />}
          {presetHotkey !== null && (
            <div className="preset-hotkey">
              <p>{presetHotkey}</p>
            </div>
          )}
        </div>
        <Dropdn options={presetOptions} value={preset.id} placeholder="New Preset" setValue={setPreset} small />
        <div className="preset-dummy"></div>
        <div
          className={classNames('preset-action preset-save', {
            disabled: !presetDirty && !preset.placeholder,
          })}
          onClick={doSave}
          title="Save Preset">
          <img src={activeSaveIcon} alt="Save" />
        </div>
        <div
          className={classNames('preset-action preset-delete', { disabled: preset.placeholder })}
          onClick={doDelete}
          title="Delete Preset">
          <img src={activeTrashIcon} alt="Delete" />
        </div>
        <div className="preset-action preset-new" onClick={newPreset} title="Duplicate Preset">
          <img src={activeAddIcon} alt="Duplicate" />
        </div>
      </div>
      <p className="presets-label no-select">Preset</p>
    </div>
  )
}
Presets.propTypes = {
  className: PropTypes.string,
  preset: PropTypes.object,
  presetOptions: PropTypes.array,
  setPresetName: PropTypes.func,
  setPreset: PropTypes.func,
  presetDirty: PropTypes.bool,
  hotkey: PropTypes.number,
  presetHotkey: PropTypes.number,
  savePreset: PropTypes.func,
  newPreset: PropTypes.func,
  deletePreset: PropTypes.func,
  theme: PropTypes.string,
}
