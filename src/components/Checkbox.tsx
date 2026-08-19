import React, { useCallback } from 'react'
import classNames from 'classnames'
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
      {/* The mark is a CSS-masked div (not an <img>) so themes can recolor it with a
          plain background-color — same technique as the header's gear/? icons. */}
      <div className={classNames('checkbox', { checked: checked })} onClick={toggle}>
        {checked && <div className="checkmark" />}
      </div>
      <p className="checkmark-label no-select" onClick={toggle}>
        {label}
      </p>
    </div>
  )
}
