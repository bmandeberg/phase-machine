import React, { useMemo } from 'react'
import classNames from 'classnames'
import './RadioButtons.scss'

interface RadioButtonsProps {
  className?: string
  options: string[]
  selected?: string
  setSelected: (option: string) => void
  label?: string
}

export default function RadioButtons({ className, options, selected, setSelected, label }: RadioButtonsProps) {
  const optionsEls = useMemo(
    () =>
      options.map((option) => (
        <div
          className={classNames('radio-button no-select', { 'radio-button-selected': selected === option })}
          onClick={() => setSelected(option)}
          key={option}>
          {option}
        </div>
      )),
    [options, selected, setSelected]
  )

  return (
    <div className={classNames('radio-buttons-container', className)}>
      <div className="radio-buttons">{optionsEls}</div>
      <p className="radio-buttons radio-buttons-label no-select">{label}</p>
    </div>
  )
}
