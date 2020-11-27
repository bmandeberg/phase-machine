import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Dropdown from 'react-dropdown'
import './Dropdn.scss'

export default function Dropdn(props) {
  return (
    <div className={classNames('dropdown-container', props.className)}>
      <Dropdown
        options={props.options}
        onChange={(e) => props.setValue(e.value)}
        value={props.value}
        placeholder="Select an option"
      />
      <p className="dropdown-label">{props.label.toUpperCase()}</p>
    </div>
  )
}
Dropdn.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
  options: PropTypes.array,
  setValue: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}
