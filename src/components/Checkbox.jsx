import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import checkmark from '../assets/checkmark.svg'
import './Checkbox.scss'

export default function Checkbox({ label, className, checked, setChecked }) {
  const toggle = useCallback(() => {
    setChecked(!checked)
  }, [checked, setChecked])

  return (
    <div className={classNames('checkmark-container', className)}>
      <div className={classNames('checkbox', { checked: checked })} onClick={toggle}>
        {checked && <img className="no-select" src={checkmark} alt="" />}
      </div>
      <p className="checkmark-label no-select" onClick={toggle}>
        {label}
      </p>
    </div>
  )
}
Checkbox.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
  checked: PropTypes.bool,
  setChecked: PropTypes.func,
}
