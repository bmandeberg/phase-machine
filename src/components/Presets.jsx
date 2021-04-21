import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Dropdn from './Dropdn'
import addIcon from '../assets/add-icon.svg'
import removeIcon from '../assets/remove-icon.svg'
import trashIcon from '../assets/trash-icon.svg'
import saveIcon from '../assets/save-icon.svg'
import './Presets.scss'

export default function Presets(props) {
  return (
    <div className={classNames('presets-container', props.className)}>
      <div className="presets">
        <input type="text" value={props.presetName} onChange={props.setPresetName} />
        <Dropdn
          options={['Preset']}
          value={props.presetName}
          placeholder="New Preset"
          setValue={props.setPreset}
          small
        />
        <div className="preset-dummy"></div>
        <div className="preset-action preset-save">
          <img src={saveIcon} alt="Save" />
        </div>
        <div className="preset-action preset-delete">
          <img src={removeIcon} alt="Delete" />
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
}
