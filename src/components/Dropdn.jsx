import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Dropdown from 'react-dropdown'
import NumInput from './NumInput'
import './Dropdn.scss'

function longestText(options) {
  if (options.length) {
    let longestOption = ''
    for (let i = 0; i < options.length; i++) {
      const option = typeof options[i] === 'object' ? options[i].label.trim() : options[i].trim()
      if (option.length > longestOption.length) {
        longestOption = option
      }
    }
    return longestOption
  }
  return null
}

export default function Dropdn(props) {
  return (
    <div
      className={classNames('dropdown-container', props.className, {
        'small-dropdown': props.small,
        'no-text-transform': props.noTextTransform,
        'capitalize': props.capitalize,
        'inline-dropdown': props.inline,
        'dropdown-num-inputs-container': props.setNum1,
        'show-dropdown-num-inputs': props.showNumInputs,
      })}>
      <div className="dropdown">
        <Dropdown
          options={props.options}
          onChange={(e) => props.setValue(e.value)}
          value={props.value}
          placeholder={props.placeholder || 'Select an option'}
        />
        <div className="dropdown-min-width">{longestText(props.options)}</div>
      </div>
      {props.label && <p className="dropdown-label no-select">{props.label}</p>}
      {props.setNum1 && (
        <div className="dropdown-num-inputs-wrapper">
          <div className="dropdown-num-inputs">
            <NumInput value={props.num1} setValue={props.setNum1} />
            <NumInput value={props.num2} setValue={props.setNum2} />
          </div>
        </div>
      )}
    </div>
  )
}
Dropdn.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
  options: PropTypes.array,
  setValue: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placeholder: PropTypes.string,
  small: PropTypes.bool,
  noTextTransform: PropTypes.bool,
  capitalize: PropTypes.bool,
  inline: PropTypes.bool,
  num1: PropTypes.number,
  setNum1: PropTypes.func,
  num2: PropTypes.number,
  setNum2: PropTypes.func,
  showNumInputs: PropTypes.bool,
}
