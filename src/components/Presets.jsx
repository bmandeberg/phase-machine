import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Dropdn from './Dropdn'
import addIcon from '../assets/add-icon.svg'
import removeIcon from '../assets/remove-icon.svg'
import removeIconDisabled from '../assets/remove-icon-disabled.svg'
import saveIcon from '../assets/save-icon.svg'
import saveIconDisabled from '../assets/save-icon-disabled.svg'
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

  return (
    <div className={classNames('presets-container', props.className)}>
      <div className="presets">
        <input
          type="text"
          value={props.presetName}
          onChange={props.setPresetName}
          style={{ paddingRight: inputPadding }}
        />
        <div className="preset-tags">
          {props.presetDirty && <img className="preset-edited" src={edited} alt="" />}
          {props.presetHotkey !== null && (
            <div className="preset-hotkey">
              <p>{props.presetHotkey}</p>
            </div>
          )}
        </div>
        <Dropdn
          options={props.presetNames}
          value={props.presetName}
          placeholder="New Preset"
          setValue={props.setPreset}
          small
        />
        <div className="preset-dummy"></div>
        <div className={classNames('preset-action preset-save', { disabled: !props.presetDirty })}>
          <img src={props.presetDirty ? saveIcon : saveIconDisabled} alt="Save" />
        </div>
        <div className={classNames('preset-action preset-delete', { disabled: props.presetDirty })}>
          <img src={!props.presetDirty ? removeIcon : removeIconDisabled} alt="Delete" />
        </div>
        <div className="preset-action preset-new">
          <img src={addIcon} alt="New" />
        </div>
      </div>
      <p className="presets-label no-select">Preset</p>
    </div>
  )
}
Presets.propTypes = {
  className: PropTypes.string,
  presetName: PropTypes.string,
  presetNames: PropTypes.array,
  setPresetName: PropTypes.func,
  setPreset: PropTypes.func,
  presetDirty: PropTypes.bool,
  hotkey: PropTypes.number,
  presetHotkey: PropTypes.number,
}
