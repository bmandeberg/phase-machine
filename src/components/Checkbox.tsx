import React, { useCallback } from 'react'
import classNames from 'classnames'
import checkmark from '../assets/checkmark.svg'
import './Checkbox.scss'

interface CheckboxProps {
  label?: string
  className?: string
  checked?: boolean
  setChecked?: (checked: boolean) => void
}

export default function Checkbox({ label, className, checked, setChecked }: CheckboxProps) {
  const toggle = useCallback(() => {
    setChecked?.(!checked)
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
