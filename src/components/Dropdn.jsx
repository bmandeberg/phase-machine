import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Dropdown from 'react-dropdown'
import './Dropdn.scss'

function longestText(options) {
  if (options.length) {
    return options.reduce((a, b) => {
      return a.length > b.length ? a : b
    })
  }
  return null
}

export default function Dropdn(props) {
  return (
    <div
      className={classNames('dropdown-container', props.className, {
        'small-dropdown': props.smallDropdown,
        'no-text-transform': props.noTextTransform,
      })}>
      <Dropdown
        options={props.options}
        onChange={(e) => props.setValue(e.value)}
        value={props.value}
        placeholder={props.placeholder || 'Select an option'}
      />
      <div className="dropdown-min-width">{longestText(props.options)}</div>
      <p className="dropdown-label no-select">{props.label}</p>
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
  smallDropdown: PropTypes.bool,
  noTextTransform: PropTypes.bool,
}
