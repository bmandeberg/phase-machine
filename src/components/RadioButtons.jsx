import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './RadioButtons.scss'

export default function RadioButtons({ className, options, selected, setSelected, label }) {
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
RadioButtons.propTypes = {
  className: PropTypes.string,
  options: PropTypes.array,
  selected: PropTypes.string,
  setSelected: PropTypes.func,
  label: PropTypes.string,
}
