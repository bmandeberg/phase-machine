import React, { useMemo } from 'react'
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

export default function Presets(props) {
  const inputPadding = useMemo(() => {
    let padding = 2
    if (props.presetDirty) {
      padding += 17
    }
    if (props.presetHotkey !== null) {
      padding += 17
    }
    return padding
  }, [props.presetHotkey, props.presetDirty])

  const activeTrashIcon = useMemo(() => {
    switch (props.theme) {
      case 'light':
        return props.preset.placeholder ? trashIconDisabled : trashIcon
      case 'dark':
        return props.preset.placeholder ? trashIconDisabledBlue : trashIconBlue
      case 'contrast':
        return props.preset.placeholder ? trashIconDisabledDark : trashIconDark
      default:
        return props.preset.placeholder ? trashIconDisabled : trashIcon
    }
  }, [props.preset.placeholder, props.theme])

  const activeSaveIcon = useMemo(() => {
    switch (props.theme) {
      case 'light':
        return props.presetDirty || props.preset.placeholder ? saveIcon : saveIconDisabled
      case 'dark':
        return props.presetDirty || props.preset.placeholder ? saveIconBlue : saveIconDisabledBlue
      case 'contrast':
        return props.presetDirty || props.preset.placeholder ? saveIconDark : saveIconDisabledDark
      default:
        return props.presetDirty || props.preset.placeholder ? saveIcon : saveIconDisabled
    }
  }, [props.preset.placeholder, props.presetDirty, props.theme])

  const activeAddIcon = useMemo(() => {
    switch (props.theme) {
      case 'light':
        return addIcon
      case 'dark':
        return addIconBlue
      case 'contrast':
        return addIconDark
      default:
        return addIcon
    }
  }, [props.theme])

  return (
    <div className={classNames('presets-container', props.className)}>
      <div className="presets">
        <input
          type="text"
          value={props.preset.name}
          onChange={props.setPresetName}
          style={{ paddingRight: inputPadding }}
        />
        <div className="preset-tags">
          {(props.presetDirty || props.preset.placeholder) && <img className="preset-edited" src={edited} alt="" />}
          {props.presetHotkey !== null && (
            <div className="preset-hotkey">
              <p>{props.presetHotkey}</p>
            </div>
          )}
        </div>
        <Dropdn
          options={props.presetOptions}
          value={props.preset.id}
          placeholder="New Preset"
          setValue={props.setPreset}
          small
        />
        <div className="preset-dummy"></div>
        <div
          className={classNames('preset-action preset-save', {
            disabled: !props.presetDirty && !props.preset.placeholder,
          })}
          onClick={props.savePreset}>
          <img src={activeSaveIcon} alt="Save" />
        </div>
        <div
          className={classNames('preset-action preset-delete', { disabled: props.preset.placeholder })}
          onClick={props.deletePreset}>
          <img src={activeTrashIcon} alt="Delete" />
        </div>
        <div className="preset-action preset-new" onClick={props.newPreset}>
          <img src={activeAddIcon} alt="New" />
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
