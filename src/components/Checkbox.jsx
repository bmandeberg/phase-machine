import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import checkmark from '../assets/checkmark.svg'
import './Checkbox.scss'

export default function Checkbox(props) {
  return (
    <div className={classNames('checkmark-container', props.className)}>
      <div
        className={classNames('checkbox', { checked: props.checked })}
        onClick={() => props.setChecked(!props.checked)}>
        {props.checked && <img src={checkmark} alt="" />}
      </div>
      <p className="checkmark-label">{props.label}</p>
    </div>
  )
}
Checkbox.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
  checked: PropTypes.bool,
  setChecked: PropTypes.func,
}
